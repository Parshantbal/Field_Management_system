# Project KEYSTONE - Full Stack Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         PROJECT KEYSTONE - FIELD SERVICE PLATFORM        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$backendScript = Join-Path $PSScriptRoot "start-backend.ps1"
$frontendScript = Join-Path $PSScriptRoot "start-frontend.ps1"

Write-Host "Spawning Backend in dedicated PowerShell window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$backendScript`""

Start-Sleep -Seconds 3

Write-Host "Spawning Frontend in dedicated PowerShell window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$frontendScript`""

Write-Host ""
Write-Host "Services successfully launched!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend API: http://localhost:8080" -ForegroundColor White
Write-Host "H2 Console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:keystonedb)" -ForegroundColor White
