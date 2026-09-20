Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Starting GitPulse Backend and Frontend..." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan

# Prevent stale backend/frontend instances from staying alive and reusing old
# MongoDB or environment state when the app is relaunched.
Get-CimInstance Win32_Process |
    Where-Object { $_.CommandLine -match 'uvicorn app.main:app|next dev|Capstone project' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host ""
Write-Host "Both servers launched!" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
