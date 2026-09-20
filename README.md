# GitPulse

<p align="center">
  <img src="assets/logo.svg" alt="GitPulse Logo" width="220" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-0.115.5-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/MongoDB-Local%20%2B%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License" />
</p>

<p align="center">
  <strong>GitHub Audience Intelligence & Growth Analytics Platform</strong>
</p>

GitPulse is a full-stack analytics dashboard for tracking GitHub audience growth, repository performance, and engagement trends in one place. It combines live GitHub data, historical snapshots, and insights to help developers understand what is driving growth and opportunity.

---

## Why GitPulse?

GitPulse helps answer questions like:

- Is my audience growing or declining?
- Which repositories are creating the most momentum?
- Are follower gains sustainable?
- Which repositories deserve more attention?
- What patterns emerge from audience and contribution activity?

---

## Features

- GitHub follower and following tracking
- Historical audience snapshot analysis
- Repository traffic and performance insights
- Contribution and engagement monitoring
- AI-style recommendation engine
- Modern dashboard for analytics overview
- Exportable insight data
- OAuth-based GitHub login flow
- Responsive dashboard UI

---

## Tech Stack

- Frontend: Next.js
- Backend: FastAPI
- Database: MongoDB
- Authentication: GitHub OAuth
- Styling: Tailwind CSS
- Visualization: Recharts

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
