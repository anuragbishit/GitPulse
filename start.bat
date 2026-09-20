@echo off
setlocal

title GitPulse Launcher

echo ====================================================
echo Starting GitPulse Backend and Frontend...
echo ====================================================
echo.

set "ROOT=%~dp0"
set "BACKEND_DIR=%ROOT%backend"
set "FRONTEND_DIR=%ROOT%frontend"
set "NEXT_PUBLIC_API_BASE=http://localhost:8000"
set "USE_COMPOSE=0"

where docker >nul 2>&1
if not errorlevel 1 (
  docker info >nul 2>&1
  if not errorlevel 1 set "USE_COMPOSE=1"
)

REM Prevent stale app instances from keeping old database config or dev server state alive.
for /f "tokens=2" %%p in ('wmic process where "commandline like '%%uvicorn app.main:app%%' or commandline like '%%next dev%%' or commandline like '%%Capstone project%%'" get processid 2^>nul') do (
  taskkill /F /PID %%p 2>nul
)

for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000 " 2^>nul') do (
  taskkill /F /PID %%p 2>nul
)

for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8000 " 2^>nul') do (
  taskkill /F /PID %%p 2>nul
)

if exist "%FRONTEND_DIR%\.next" (
  rmdir /s /q "%FRONTEND_DIR%\.next"
)

if "%USE_COMPOSE%"=="1" (
  echo Starting the API with Docker Compose...
  docker compose up -d --build api
) else (
  echo Docker Desktop is unavailable. The API will use the MongoDB URI from backend\.env.
  start "GitPulse Backend" /d "%BACKEND_DIR%" cmd /k ".\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
)
start "GitPulse Frontend" /d "%FRONTEND_DIR%" cmd /k "set NEXT_PUBLIC_API_BASE=%NEXT_PUBLIC_API_BASE% && npm.cmd run dev"

echo.
echo Both servers have been launched in separate windows!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Open http://localhost:3000 in your browser once Next.js finishes compiling.
echo ====================================================

endlocal
