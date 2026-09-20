# GitPulse — GitHub Audience Tracker & Advanced Analytics

<div align="center">

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/) [![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/) [![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/) [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

## About The Project

GitPulse is an advanced full-stack GitHub audience tracking and intelligence platform built with **FastAPI**, **MongoDB**, and **Next.js 15**. On every sync, it fetches your followers, following lists, and repository traffic metrics from the GitHub REST API, diffs them against historical snapshots in MongoDB, and logs every change in an append-only event log.

### Key Features

- **Audience Tracking**: Live follower gain, loss, and re-follow tracking keyed on immutable GitHub user IDs.
- **Repository Traffic & Stats**: Historical views, clones, stars, and forks saved long after GitHub's 14-day limit expires.
- **AI Audience Insights**: Intelligence engine evaluating audience velocity, engagement health, and optimal launch windows.
- **Data Export Engine**: Export your complete historical follower data and traffic statistics to **CSV** or **JSON**.
- **Live Profile README Badge**: Generate a dynamic SVG badge for your GitHub profile `README.md` showing live follower counters.

---

## Quick Start (One-Click Launch on Windows)

1. **Configure your environment**:
   Create a `backend/.env` file based on `backend/.env.example`:
   ```dotenv
   GITHUB_CLIENT_ID=your_github_oauth_app_client_id
   GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
   GITHUB_OAUTH_REDIRECT_URI=http://localhost:8000/api/auth/github/callback
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=your_mongodb_connection_string
   DB_NAME=github_analytics
   ```
   Create a GitHub OAuth App under **Settings → Developer settings → OAuth Apps** and set its authorization callback URL to the value of `GITHUB_OAUTH_REDIRECT_URI`. Users sign in on GitHub's website; GitPulse never asks for or receives their GitHub password.

2. **Launch Both Servers**:
   Install and start Docker Desktop, then double click **`start.bat`** (or run
    `.\start.bat` in a terminal). The launcher starts MongoDB, the FastAPI backend
   (`http://localhost:8000`), and the Next.js frontend (`http://localhost:3000`).
   Without Docker Desktop, start MongoDB separately on `localhost:27017` before
   launching the script.

---

## Advanced Features & API Endpoints

- `GET /api/analytics/ai-insights` — AI Audience Health & Growth recommendations.
- `GET /api/analytics/export?format=csv` — Download follower and traffic history in CSV.
- `GET /api/badge/followers` — Live SVG Badge for GitHub profile `README.md`.

---

## License

This project is licensed under the [MIT License](LICENSE).