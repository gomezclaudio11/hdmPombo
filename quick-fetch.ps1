# Simple PowerShell Script for Context7 Documentation
# Download all required documentation for hospital hygiene dashboard

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Create documentation directories
New-Item -ItemType Directory -Force -Path 'docs\backend', 'docs\frontend', 'docs\auth', 'docs\charts'
Write-Host "Directories created successfully!"

# Download all documentation files

Write-Host "Downloading MongoDB aggregation documentation..."
& npx ctx7 docs mongoose "MongoDB aggregation pipeline for healthcare compliance statistics" --output markdown | Out-File -FilePath 'docs/backend/mongodb-aggregation.md' -Encoding UTF8

Write-Host "Downloading Express REST API documentation..."
& npx ctx7 docs express "REST API route protection with auth middleware for healthcare endpoints" --output markdown | Out-File -FilePath 'docs/backend/express-auth.md' -Encoding UTF8

Write-Host "Downloading JWT authentication documentation..."
& npx ctx7 docs jsonwebtoken "JWT token with x-auth-token middleware for hospital dashboard" --output markdown | Out-File -FilePath 'docs/auth/jwt-token.md' -Encoding UTF8

Write-Host "Downloading Axios HTTP client documentation..."
& npx ctx7 docs axios "HTTP client for React hospital dashboard to call REST API endpoints" --output markdown | Out-File -FilePath 'docs/frontend/axios-client.md' -Encoding UTF8

Write-Host "Downloading Chart.js visualization documentation..."
& npx ctx7 docs chart.js "creating compliance percentage charts for hospital dashboard metrics" --output markdown | Out-File -FilePath 'docs/charts/chartjs-metrics.md' -Encoding UTF8

Write-Host ""
Write-Host "✅ All Context7 documentation downloaded successfully!"
Write-Host ""
Write-Host "📁 Documentation available in:"
Write-Host "   docs/backend/ - Backend API and database documentation"
Write-Host "   docs/frontend/ - Frontend React components documentation"
Write-Host "   docs/auth/ - Authentication system documentation"
Write-Host "   docs/charts/ - Chart.js and visualization documentation"