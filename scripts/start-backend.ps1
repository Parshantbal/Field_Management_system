# Start Project KEYSTONE Spring Boot Backend
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting Project KEYSTONE Backend (Spring Boot 3.3.4)  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$backendDir = Join-Path $PSScriptRoot "..\backend"
Set-Location $backendDir

Write-Host "Bootstrapping Spring Boot service on http://localhost:8080 ..." -ForegroundColor Green
mvn spring-boot:run
