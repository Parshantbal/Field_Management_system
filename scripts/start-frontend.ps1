# Start Project KEYSTONE React Frontend
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting Project KEYSTONE Frontend (Vite + React)     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$frontendDir = Join-Path $PSScriptRoot "..\frontend"
Set-Location $frontendDir

Write-Host "Launching Vite dev server on http://localhost:5173 ..." -ForegroundColor Green
npm run dev
