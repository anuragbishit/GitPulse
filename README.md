# GitPulse

GitPulse is a full-stack GitHub audience analytics platform that helps users track follower growth, repository performance, and engagement insights over time. It combines a FastAPI backend, a Next.js frontend, and MongoDB storage to provide a modern dashboard for GitHub profile and audience intelligence.

## Overview

GitPulse monitors GitHub audience metrics such as:

- follower growth and churn
- following activity
- repository traffic and popularity
- contribution patterns
- historical audience signals and trends

The app stores historical snapshots in MongoDB so users can compare current performance against past activity and view actionable insights over time.

## Features

- GitHub follower and following tracking
- Historical audience snapshot analysis
- Repository traffic and performance metrics
- Contribution-based analytics
- AI-style audience insights and recommendations
- Data export support
- Responsive dashboard UI
- OAuth-based GitHub login flow
- Local development startup script for Windows

## Tech Stack

- Frontend: Next.js 15
- Backend: FastAPI
- Database: MongoDB
- Authentication: GitHub OAuth
- Language: Python + TypeScript
- Styling: Tailwind CSS

## Architecture

- Frontend app renders charts, dashboards, and repository analytics
- FastAPI backend serves API routes and orchestrates data sync
- MongoDB stores historical snapshots, repository metrics, and audience data
- GitHub API is used to fetch live profile and repository data

## Project Structure

```text
Capstone project/
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
├── docker-compose.yml
├── start.bat
├── run.ps1
├── README.md
├── render.yaml
└── scripts/
