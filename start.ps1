# start.ps1 - Startup Script for Ramdev Super Store

Clear-Host
Write-Host "=======================================================" -ForegroundColor DarkYellow
Write-Host "         RAMDEV SUPER STORE UTENSILS PORTAL            " -ForegroundColor Yellow -Bold
Write-Host "=======================================================" -ForegroundColor DarkYellow
Write-Host "  Starting Node.js server using agy-node compiler..." -ForegroundColor Gray
Write-Host "  Address: http://localhost:5173" -ForegroundColor Green
Write-Host "  Press Ctrl+C in this terminal to shut down the server." -ForegroundColor Red
Write-Host "=======================================================" -ForegroundColor DarkYellow
Write-Host ""

# Run Server using agy-node (which is pre-wired in the environment path)
agy-node server.js
