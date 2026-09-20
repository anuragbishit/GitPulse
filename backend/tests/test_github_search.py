import unittest
from unittest.mock import Mock, patch

from app.config import CORS_ORIGINS
from app import database
from app.services.analytics_service import (
    get_audience_quality,
    get_repository_opportunity_radar,
)
from app.services.github_service import (
    clear_active_github_credentials,
    get_active_github_context,
    search_users,
    set_active_github_credentials,
)


class SearchUsersTests(unittest.TestCase):
    def test_search_users_returns_items(self):
        response = Mock()
        response.raise_for_status.return_value = None
        response.json.return_value = {
            "items": [
                {
                    "login": "octocat",
                    "avatar_url": "https://avatars.githubusercontent.com/u/1?v=4",
                    "html_url": "https://github.com/octocat",
                    "type": "User",
                }
            ]
        }

        with patch("app.services.github_service.requests.get", return_value=response) as mock_get:
            result = search_users("octo", per_page=5)

        self.assertEqual(result[0]["login"], "octocat")
        self.assertEqual(result[0]["type"], "User")
        mock_get.assert_called_once()


class AudienceAnalyticsTests(unittest.TestCase):
    @patch("app.services.analytics_service.get_growth", return_value={"net": 28, "retention_rate": 86.5})
    @patch("app.services.analytics_service.get_follower_stats", return_value={"total_followers": 520, "total_following": 280})
    @patch("app.services.analytics_service.get_profile", return_value={"login": "octocat"})
    def test_get_audience_quality_returns_score_and_recommendations(self, *_):
        metrics = get_audience_quality()

        self.assertIn("score", metrics)
        self.assertIn("status", metrics)
        self.assertIn("recommendations", metrics)
        self.assertGreaterEqual(metrics["score"], 0)
        self.assertLessEqual(metrics["score"], 100)

    @patch("app.services.analytics_service.get_overview", return_value={
        "most_starred": [
            {"name": "alpha", "stars": 150, "views_all_time": 800, "forks": 15, "commits_last_year": 90, "description": "A strong project"},
            {"name": "beta", "stars": 40, "views_all_time": 400, "forks": 8, "commits_last_year": 12, "description": "Needs attention"},
        ]
    })
    def test_get_repository_opportunity_radar_returns_ranked_opportunities(self, *_):
        radar = get_repository_opportunity_radar()

        self.assertIn("top_pick", radar)
        self.assertIn("opportunities", radar)
        self.assertGreater(len(radar["opportunities"]), 0)
        self.assertEqual(radar["opportunities"][0]["name"], "alpha")


class AuthContextTests(unittest.TestCase):
    def test_active_github_credentials_can_be_overridden(self):
        clear_active_github_credentials()
        set_active_github_credentials("octocat", "secret-token")

        username, token = get_active_github_context()

        self.assertEqual(username, "octocat")
        self.assertEqual(token, "secret-token")

        clear_active_github_credentials()


class DatabaseConnectionTests(unittest.TestCase):
    @patch("app.database.MongoClient")
    def test_new_client_falls_back_to_local_mongo_when_remote_uri_is_unreachable(self, mongo_client_cls):
        remote_client = Mock()
        remote_client.admin.command.side_effect = Exception("network timeout")

        local_client = Mock()
        local_client.admin.command.return_value = {"ok": 1}

        mongo_client_cls.side_effect = [remote_client, remote_client, remote_client, local_client]
        original_uri = database.MONGODB_URI
        original_client = database._client
        database.MONGODB_URI = "mongodb+srv://example.mongodb.net/test"
        database._client = None

        try:
            client = database._new_client()
        finally:
            database.MONGODB_URI = original_uri
            database._client = original_client

        self.assertIs(client, local_client)
        self.assertEqual(mongo_client_cls.call_args_list[-1].args[0], "mongodb://localhost:27017")


class CorsConfigTests(unittest.TestCase):
    def test_cors_allows_localhost_credentials(self):
        self.assertIn("http://localhost:3000", CORS_ORIGINS)
        self.assertNotIn("*", CORS_ORIGINS)


if __name__ == "__main__":
    unittest.main()
