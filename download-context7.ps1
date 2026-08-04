# Script de descarga de documentacion Context7 para Dashboard Hospitalario
# Proyecto: hdmNoviembre

Write-Host "Iniciando descarga de documentacion para el Dashboard Hospitalario..." -ForegroundColor Green

# 1. Crear directorios de destino
$directories = @("docs/backend", "docs/frontend", "docs/auth", "docs/charts")
foreach ($dir in $directories) {
    if (-not (Test-Path -Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Carpeta creada: $dir" -ForegroundColor Yellow
    }
}

# 2. Descargar documentacion de Backend y MongoDB
Write-Host "Descargando documentacion de Backend y MongoDB..." -ForegroundColor Cyan
npx ctx7@latest docs mongodb "aggregation pipeline stats" > docs/backend/mongodb-aggregation.md
npx ctx7@latest docs mongodb "facet aggregation multiple statistics" > docs/backend/mongodb-facet.md
npx ctx7@latest docs mongodb "expr and date filtering" > docs/backend/mongodb-expr.md
npx ctx7@latest docs mongodb "field mapping null empty data" > docs/backend/mongodb-field-mapping.md
npx ctx7@latest docs express "auth route protection healthcare" > docs/backend/express-auth.md
npx ctx7@latest docs express "HTTP methods hospital data" > docs/backend/express-methods.md
npx ctx7@latest docs helmet "security headers" > docs/backend/helmet-security.md
npx ctx7@latest docs mongodb "WHO 5 moments aggregation pipeline" > docs/backend/who-5-moments.md

# 3. Descargar documentacion de Autenticacion
Write-Host "Descargando documentacion de Autenticacion..." -ForegroundColor Cyan
npx ctx7@latest docs jsonwebtoken "JWT token middleware x-auth-token" > docs/auth/jwt-token.md
npx ctx7@latest docs bcrypt "password hashing medical system" > docs/auth/bcrypt-password.md

# 4. Descargar documentacion de Frontend y Visualizacion
Write-Host "Descargando documentacion de Frontend y Charts..." -ForegroundColor Cyan
npx ctx7@latest docs axios "http client react dashboard" > docs/frontend/axios-client.md
npx ctx7@latest docs react "dynamic chart components visualization" > docs/frontend/chart-components.md
npx ctx7@latest docs vite "react setup hot reload" > docs/frontend/vite-setup.md
npx ctx7@latest docs react-router "sector specific views navigation" > docs/frontend/react-router.md
npx ctx7@latest docs chart.js "compliance metrics hospital dashboard" > docs/frontend/chartjs-metrics.md

Write-Host "Descarga completada con exito! Toda la documentacion esta guardada en /docs" -ForegroundColor Green