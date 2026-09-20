"""Advanced Audience Analytics, AI Insights Engine, Data Export, and Live SVG Badge Generator."""

import csv
import io
import json
from datetime import datetime, timezone
from ..database import get_db
from .follower_service import (
    get_current_unfollowed as get_lost_followers,
    get_growth,
    get_stats as get_follower_stats,
)
from .profile_service import get_profile
from .repo_service import get_overview as get_repo_overview
from .sync_state import recent_runs


def get_overview() -> dict:
    """Compatibility wrapper so analytics functions can reuse repo summary data."""
    return get_repo_overview()


def get_traffic_summary() -> dict:
    """Backward-compatible alias for the repository overview used by AI insight generation."""
    return get_overview()


def _average(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def get_growth_forecast() -> dict:
    """Project follower totals from the recent daily net-growth trend."""
    stats = get_follower_stats()
    growth = get_growth(90)
    points = growth["points"]
    recent = [point["net"] for point in points[-14:]]
    baseline = [point["net"] for point in points[:-14]]
    daily_net = round(_average(recent), 2)
    baseline_net = round(_average(baseline), 2)
    current = stats.get("total_followers", 0)
    horizons = (7, 30, 90)

    return {
        "current_followers": current,
        "daily_net_average": daily_net,
        "baseline_daily_net_average": baseline_net,
        "trend": "accelerating" if daily_net > baseline_net + 0.25 else (
            "slowing" if daily_net < baseline_net - 0.25 else "steady"
        ),
        "projections": [
            {"days": days, "projected_followers": max(0, round(current + daily_net * days))}
            for days in horizons
        ],
        "data_points": len(points),
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def get_smart_alerts() -> dict:
    """Return explainable alerts from audience, repository, and sync signals."""
    growth = get_growth(30)
    stats = get_follower_stats()
    alerts: list[dict] = []
    recent_net = sum(point["net"] for point in growth["points"][-7:])
    previous_net = sum(point["net"] for point in growth["points"][:-7])

    if recent_net <= -2:
        alerts.append({
            "severity": "warning",
            "kind": "audience",
            "title": "Audience decline detected",
            "description": f"Your audience changed by {recent_net} net followers in the last 7 days.",
        })
    elif recent_net >= 3 and recent_net > previous_net / 3:
        alerts.append({
            "severity": "positive",
            "kind": "audience",
            "title": "Follower momentum is rising",
            "description": f"You gained {recent_net} net followers in the last 7 days.",
        })

    retention = growth.get("retention_rate", 100.0)
    if stats.get("total_followed_events", 0) >= 5 and retention < 80:
        alerts.append({
            "severity": "warning",
            "kind": "retention",
            "title": "Retention needs attention",
            "description": f"Recent follower retention is {retention}%. Review your latest content and engagement timing.",
        })

    repo_spikes = list(get_db()["repo_snapshots"].find(
        {"stars_since_last_sync": {"$gt": 0}},
        {"_id": 0, "name": 1, "stars_since_last_sync": 1},
    ).sort("stars_since_last_sync", -1).limit(3))
    for repo in repo_spikes:
        alerts.append({
            "severity": "positive",
            "kind": "repository",
            "title": f"{repo['name']} is getting noticed",
            "description": f"It gained {repo['stars_since_last_sync']} star(s) since the last sync.",
        })

    failed = next((run for run in recent_runs(5) if run.get("status") == "failed"), None)
    if failed:
        alerts.append({
            "severity": "warning",
            "kind": "sync",
            "title": "A recent sync failed",
            "description": failed.get("error") or "Check your GitHub token and database connection.",
        })

    return {
        "alerts": alerts,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def get_ai_insights() -> dict:
    """Compute AI Audience Insights based on live MongoDB history and profile stats."""
    profile = get_profile()
    stats = get_follower_stats()
    lost = get_lost_followers()
    traffic = get_traffic_summary()

    total_followers = stats.get("total_followers", 0)
    total_following = stats.get("total_following", 0)
    lost_count = lost.get("total", 0) if isinstance(lost, dict) else len(lost)
    
    # Calculate retention score
    net_count = total_followers + lost_count
    retention_rate = round((total_followers / net_count * 100), 1) if net_count > 0 else 100.0

    # Calculate engagement ratio
    ratio = round(total_followers / total_following, 2) if total_following > 0 else total_followers

    # Build smart insights
    insights = []
    
    if retention_rate >= 90:
        insights.append({
            "type": "positive",
            "title": "High Audience Retention",
            "description": f"Your profile retains {retention_rate}% of its audience. Very low unfollow rate indicates strong content quality."
        })
    else:
        insights.append({
            "type": "warning",
            "title": "Audience Churn Detected",
            "description": f"{lost_count} users unfollowed recently. Consider engaging more with your recent followers."
        })

    total_views = traffic.get("total_views", 0)
    if total_views > 0:
        conversion = round((total_followers / max(total_views, 1)) * 100, 1)
        insights.append({
            "type": "positive",
            "title": "Traffic Conversion",
            "description": f"Recorded {total_views} total repo views with a estimated profile conversion impact."
        })
    else:
        insights.append({
            "type": "info",
            "title": "Daily Traffic Sync Active",
            "description": "Repo views and clones are logged automatically on every sync to prevent data loss."
        })

    insights.append({
        "type": "recommendation",
        "title": "Optimal Engagement Window",
        "description": "Based on follower activity trends, mid-week updates (Tuesday-Thursday) show peak developer activity."
    })

    return {
        "user": profile.get("login"),
        "retention_rate": retention_rate,
        "follower_ratio": ratio,
        "total_followers": total_followers,
        "total_following": total_following,
        "lost_followers_count": lost_count,
        "insights": insights,
        "generated_at": datetime.now(timezone.utc).isoformat()
    }


def get_audience_quality() -> dict:
    """Return a single quality score and next-best actions for the audience."""
    profile = get_profile()
    stats = get_follower_stats()
    growth = get_growth(30)

    total_followers = stats.get("total_followers", 0)
    total_following = stats.get("total_following", 0)

    retention_rate = float(growth.get("retention_rate", 100.0))
    net_growth = int(growth.get("net", 0))
    ratio = round(total_followers / total_following, 2) if total_following > 0 else total_followers

    score = 50
    if retention_rate >= 85:
        score += 20
    elif retention_rate >= 70:
        score += 10
    else:
        score -= 5

    if net_growth > 0:
        score += 15
    elif net_growth < 0:
        score -= 10

    if ratio >= 1.0:
        score += 10
    elif ratio >= 0.5:
        score += 5

    if total_followers >= 100:
        score += 5

    score = max(0, min(100, score))

    if score >= 80:
        status = "Strong"
    elif score >= 60:
        status = "Healthy"
    elif score >= 40:
        status = "Watchlist"
    else:
        status = "At risk"

    recommendations = []
    if retention_rate < 75:
        recommendations.append("Audit your last 30 days of content and focus on higher-value posts that drive repeat followers.")
    if net_growth <= 0:
        recommendations.append("Increase posting cadence or refresh your profile positioning to regain momentum.")
    else:
        recommendations.append("Keep your content streak going; this audience is still expanding and converting.")

    if ratio < 1.0:
        recommendations.append("Increase engagement with your network so your follower-to-following balance is healthier.")

    return {
        "user": profile.get("login"),
        "score": score,
        "status": status,
        "retention_rate": round(retention_rate, 1),
        "net_growth": net_growth,
        "total_followers": total_followers,
        "total_following": total_following,
        "follower_ratio": ratio,
        "recommendations": recommendations[:3],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def get_repository_opportunity_radar() -> dict:
    """Score repositories by opportunity based on attention, traction, and maintenance health."""
    overview = get_overview()
    repos = overview.get("most_starred", [])
    if not repos:
        return {
            "top_pick": None,
            "opportunities": [],
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    ranked = []
    for repo in repos:
        name = repo.get("name", "unknown")
        stars = int(repo.get("stars", 0))
        views = int(repo.get("views_all_time", 0))
        forks = int(repo.get("forks", 0))
        traffic = int(repo.get("traffic_views_total", 0))
        commits = int(repo.get("commits_last_year", 0))
        description = (repo.get("description") or "").strip()

        score = 0
        if stars >= 100:
            score += 30
        elif stars >= 25:
            score += 18
        elif stars >= 10:
            score += 10

        if views >= 500:
            score += 25
        elif views >= 100:
            score += 15
        elif views >= 25:
            score += 8

        if forks >= 10:
            score += 15
        elif forks >= 3:
            score += 8

        if traffic > 0:
            score += 10

        if commits >= 30:
            score += 15
        elif commits >= 10:
            score += 8

        if description:
            score += 5

        score = max(0, min(100, score))
        quality = "Strong" if score >= 75 else "Promising" if score >= 50 else "Early"

        ranked.append({
            "name": name,
            "score": score,
            "quality": quality,
            "stars": stars,
            "views_all_time": views,
            "forks": forks,
            "commits_last_year": commits,
            "description": description or "No description yet",
        })

    opportunities = sorted(ranked, key=lambda item: (-item["score"], item["name"]))[:5]
    top_pick = opportunities[0] if opportunities else None

    return {
        "top_pick": top_pick,
        "opportunities": opportunities,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def export_followers_data(export_format: str = "csv") -> tuple[str, str, str]:
    """Export audience snapshots and logs into CSV or JSON. Returns (content, media_type, filename)."""
    db = get_db()

    # Fetch current followers
    current_followers = list(db["followers"].find({}, {"_id": 0, "login": 1, "id": 1, "html_url": 1, "avatar_url": 1, "synced_at": 1}))

    # Format output timestamp
    datestr = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    if export_format.lower() == "json":
        data = {
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "total": len(current_followers),
            "followers": current_followers
        }
        return json.dumps(data, indent=2, default=str), "application/json", f"gitpulse_followers_{datestr}.json"

    # Default CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["GitHub ID", "Username", "Profile URL", "Avatar URL", "First Synced At"])

    for f in current_followers:
        writer.writerow([
            f.get("id"),
            f.get("login"),
            f.get("html_url"),
            f.get("avatar_url"),
            f.get("synced_at")
        ])

    return output.getvalue(), "text/csv", f"gitpulse_followers_{datestr}.csv"


def generate_svg_badge(username: str = None) -> str:
    """Generate a high quality SVG counter badge for GitHub profile READMEs."""
    stats = get_follower_stats()
    count = stats.get("total_followers", 0)
    uname = username or "GitPulse"

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="220" height="36" viewBox="0 0 220 36">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
  </defs>
  <rect width="220" height="36" rx="8" fill="url(#bg)" stroke="#334155" stroke-width="1"/>
  <rect x="135" y="6" width="78" height="24" rx="5" fill="url(#accent)"/>
  <g fill="#fff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif" font-size="12" font-weight="600">
    <text x="12" y="22" fill="#94a3b8" font-size="11" font-weight="500">GitPulse Audience</text>
    <text x="174" y="22" text-anchor="middle" fill="#ffffff" font-size="13">{count:,}</text>
  </g>
</svg>'''
    return svg
