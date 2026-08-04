# Context7 Documentation Fetch Script - PowerShell Version
# Implements all the prompts for the hospital hygiene dashboard project
# This script fetches documentation for all the technologies used in your project

# This script contains all the Context7 documentation prompts configured for your hospital hygiene dashboard project.
# It systematically fetches documentation for:
# 1. Backend technologies (MongoDB, Express, JWT, bcrypt, helmet, CORS)
# 2. Frontend technologies (React components, Axios, Chart.js, Vite, React Router)
# 3. Specialized healthcare documentation (WHO 5 moments, error handling)

# To run this script:
# 1. Set execution policy: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# 2. Run with PowerShell: powershell -ExecutionPolicy Bypass -File fetch-docs.ps1

# The script creates a comprehensive documentation directory with:
# - docs/backend/: MongoDB aggregation, Express routes, security headers
# - docs/frontend/: React components, API client setup, routing
# - docs/auth/: JWT and password hashing
# - docs/charts/: Chart.js for visualization

# All documentation is saved in markdown format for easy reference during development

# Key technologies covered:
# - MongoDB aggregation pipelines for healthcare compliance statistics
# - Express.js REST API with authentication middleware for protected endpoints
# - JWT authentication with x-auth-token for hospital dashboard access
# - React.js with Vite for frontend development
# - Chart.js and React-Chartjs-2 for dynamic compliance visualization
# - Axios for HTTP client communication with the REST API
# - WHO 5 moments compliance aggregation for hospital hygiene analysis