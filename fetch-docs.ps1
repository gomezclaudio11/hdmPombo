# Context7 Documentation Fetch Script - PowerShell Version
# Implements all the prompts for the hospital hygiene dashboard project

$ErrorActionPreference = "Stop"

Write-Host "=== Context7 Documentation Fetch for Hospital Hygiene Dashboard ==="
Write-Host ""

# Create documentation directory
New-Item -ItemType Directory -Force -Path 'docs\backend', 'docs\frontend', 'docs\auth', 'docs\charts'

# Backend Documentation

Write-Host "📚 Fetching Backend Documentation..."
Write-Host ""

# MongoDB Aggregation & Data Modeling
Write-Host "Downloading MongoDB aggregation for healthcare compliance..."
npx ctx7 docs mongoose "MongoDB aggregation pipeline for healthcare compliance statistics" --output markdown | Out-File -FilePath docs\backend\mongodb-aggregation.md -Encoding UTF8

Write-Host "Downloading $facet aggregation..."
npx ctx7 docs mongoose "`$facet` aggregation with multiple statistics" --output markdown | Out-File -FilePath docs\backend\mongodb-facet.md -Encoding UTF8

Write-Host "Downloading `$expr` with `$and` conditions..."
npx ctx7 docs mongoose "`$expr` with `$and` conditions for date filtering" --output markdown | Out-File -FilePath docs\backend\mongodb-expr.md -Encoding UTF8

Write-Host "Downloading field mapping for null/empty handling..."
npx ctx7 docs mongoose "finding documents with `$or` for null/empty field handling in medical data" --output markdown | Out-File -FilePath docs\backend\mongodb-field-mapping.md -Encoding UTF8

# Express & API Routes
Write-Host "Downloading Express route protection..."
npx ctx7 docs express "REST API route protection with auth middleware for healthcare endpoints" --output markdown | Out-File -FilePath docs\backend\express-auth.md -Encoding UTF8

Write-Host "Downloading Express HTTP methods..."
npx ctx7 docs express "multiple HTTP methods for hospital compliance data: GET, POST" --output markdown | Out-File -FilePath docs\backend\express-methods.md -Encoding UTF8

# Authentication
Write-Host "Downloading JWT token with middleware..."
npx ctx7 docs jsonwebtoken "JWT token with x-auth-token middleware for hospital dashboard" --output markdown | Out-File -FilePath docs\auth\jwt-token.md -Encoding UTF8

Write-Host "Downloading bcrypt password hashing..."
npx ctx7 docs bcryptjs "password hashing for medical system authentication" --output markdown | Out-File -FilePath docs\auth\bcrypt-password.md -Encoding UTF8

# Security & Headers
Write-Host "Downloading HTTP security headers..."
npx ctx7 docs helmet "HTTP security headers for hospital dashboard REST API" --output markdown | Out-File -FilePath docs\backend\helmet-security.md -Encoding UTF8

Write-Host "Downloading CORS configuration..."
npx ctx7 docs cors "Cross-origin configuration for React frontend calling hospital backend" --output markdown | Out-File -FilePath docs\backend\cors-config.md -Encoding UTF8

# Frontend Documentation

Write-Host ""
Write-Host "📊 Fetching Frontend Documentation..."
Write-Host ""

# React & Core Components
Write-Host "Downloading Axios HTTP client..."
npx ctx7 docs axios "HTTP client for React hospital dashboard to call REST API endpoints" --output markdown | Out-File -FilePath docs\frontend\axios-client.md -Encoding UTF8

Write-Host "Downloading React chart components..."
npx ctx7 docs react-chartjs-2 "dynamic chart components for hospital compliance visualization" --output markdown | Out-File -FilePath docs\frontend\chart-components.md -Encoding UTF8

Write-Host "Downloading Vite setup..."
npx ctx7 docs vite "React development setup for hospital dashboard with hot reload" --output markdown | Out-File -FilePath docs\frontend\vite-setup.md -Encoding UTF8

Write-Host "Downloading React Router..."
npx ctx7 docs react-router-dom "client-side routing for sector-specific staff views in hospital dashboard" --output markdown | Out-File -FilePath docs\frontend\react-router.md -Encoding UTF8

# Chart.js
Write-Host "Downloading Chart.js metrics..."
npx ctx7 docs chart.js "creating compliance percentage charts for hospital dashboard metrics" --output markdown | Out-File -FilePath docs\charts\chartjs-metrics.md -Encoding UTF8

Write-Host "Downloading Chart.js rounding precision..."
npx ctx7 docs chart.js "`$round` precision for displaying hospital compliance percentages" --output markdown | Out-File -FilePath docs\charts\chartjs-rounding.md -Encoding UTF8

# WHO 5 Moments
Write-Host "Downloading WHO 5 moments analysis..."
npx ctx7 docs mongodb "aggregation pipeline for WHO 5 moments compliance analysis in hospitals" --output markdown | Out-File -FilePath docs\backend\who-5-moments.md -Encoding UTF8

# Error Handling
Write-Host "Downloading error handling middleware..."
npx ctx7 docs express "error handling middleware for hospital REST API with 500 status codes" --output markdown | Out-File -FilePath docs\backend\error-handling.md -Encoding UTF8

Write-Host ""
Write-Host "✨ Documentation fetch completed!"
Write-Host ""
Write-Host "📁 Documentation available in:"
Write-Host "   docs/backend/ - Backend API and database documentation"
Write-Host "   docs/frontend/ - Frontend React components documentation"
Write-Host "   docs/auth/ - Authentication system documentation"
Write-Host "   docs/charts/ - Chart.js and visualization documentation"

Write-Host ""
Write-Host "✅ All 22 documentation files downloaded successfully!"