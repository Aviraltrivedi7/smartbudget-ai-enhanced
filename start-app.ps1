#!/usr/bin/env pwsh
# SmartBudget AI - Start Application Script
# This script starts both backend and frontend servers

Write-Host "🚀 Starting SmartBudget AI Application..." -ForegroundColor Green
Write-Host ""

# Start Backend Server in Background
Write-Host "📡 Starting Backend Server on port 5000..." -ForegroundColor Cyan
$backendJob = Start-Job -Name "SmartBudget-Backend" -ScriptBlock {
    Set-Location "C:\Users\trive\Downloads\pocket-pal-financial-ai-main\pocket-pal-financial-ai-main\backend\backend"
    $env:PORT = 5000
    $env:NODE_ENV = "development"
    node server.js
}

# Wait for backend to start
Start-Sleep -Seconds 3

# Check if backend is running
Write-Host "⏳ Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running successfully!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend health check failed, but server might still be starting..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎨 Starting Frontend Server on port 5173..." -ForegroundColor Cyan
Write-Host ""

# Start Frontend in current terminal
Set-Location "C:\Users\trive\Downloads\pocket-pal-financial-ai-main\pocket-pal-financial-ai-main"
npm run dev

# Cleanup on exit
Write-Host ""
Write-Host "🛑 Stopping servers..." -ForegroundColor Red
Get-Job -Name "SmartBudget-Backend" | Stop-Job
Get-Job -Name "SmartBudget-Backend" | Remove-Job
Write-Host "👋 Goodbye!" -ForegroundColor Green
