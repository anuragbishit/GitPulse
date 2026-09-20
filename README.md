# GitPulse

<div align="center">
  <img src="assets/logo.svg" alt="GitPulse Logo" width="220" />
</div>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.115.5-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/MongoDB-Local%20%2B%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" />
</p>

<p align="center">
  <strong>GitHub Audience Intelligence & Growth Analytics Platform</strong>
</p>

GitPulse is a full-stack analytics platform built to help developers and creators track, understand, and optimize their GitHub audience and repository performance. It brings together live GitHub data, historical snapshots, and intelligent insights in one streamlined dashboard.

From follower trends to repository opportunities, GitPulse turns raw GitHub activity into meaningful, actionable intelligence.

---

## Why GitPulse?

GitHub exposes metrics, but not always the story behind them. GitPulse helps users answer questions like:

- Is my audience growing or declining?
- Which repositories are creating the most momentum?
- Are follower gains sustainable?
- Which projects deserve more attention?
- What patterns emerge across audience and contribution behavior?

---

## Key Features

- GitHub follower and following tracking
- Historical audience snapshot analysis
- Repository traffic and performance insights
- Contribution and engagement monitoring
- AI-style recommendation engine
- Modern dashboard for analytics overview
- Exportable insight data
- OAuth-based GitHub login flow
- Responsive interface for desktop use

---

## Tech Stack

- Frontend: Next.js
- Backend: FastAPI
- Database: MongoDB
- Authentication: GitHub OAuth
- Styling: Tailwind CSS
- Visualization: Recharts
- Deployment-ready architecture

---

## Platform Preview

<div align="center">
  <img src="assets/dashboard-preview.png" alt="GitPulse Dashboard Preview" width="100%" />
</div>

---

## Project Structure

```text
gitpulse/
├── backend/
│   ├── app/
│   ├── tests/
│   ├── .env
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── Dockerfile
├── assets/
│   ├── logo.svg
│   └── dashboard-preview.png
├── docker-compose.yml
├── start.bat
├── run.ps1
├── README.md
├── render.yaml
├── scripts/
└── .gitignore
