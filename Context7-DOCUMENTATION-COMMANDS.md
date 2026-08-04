# Context7 Documentation - Hospital Hygiene Dashboard

This document contains all the Context7 documentation commands that should be executed for the hospital hygiene dashboard project.

## Summary

This project requires documentation for 22 different technologies across:

### Backend (10 files needed)
1. MongoDB aggregation pipeline for healthcare compliance statistics
2. MongoDB $facet aggregation with multiple statistics  
3. MongoDB $expr with $and conditions for date filtering
4. MongoDB field mapping for null/empty medical data
5. Express REST API route protection with auth middleware
6. Express HTTP methods (GET, POST) for hospital compliance data
7. JWT token with x-auth-token middleware for hospital dashboard
8. bcrypt password hashing for medical system authentication
9. Helmet HTTP security headers for hospital dashboard REST API
10. CORS configuration for React-Hospital integration

### Frontend (5 files needed)
11. Axios HTTP client for React hospital dashboard to call REST API endpoints
12. React-Chartjs-2 dynamic chart components for hospital compliance visualization
13. Vite React development setup with hot reload
14. React Router client-side routing for sector-specific staff views
15. Chart.js creating compliance percentage charts for hospital dashboard metrics
16. Chart.js $round precision for displaying hospital compliance percentages

### Specialized (2 files needed)
17. MongoDB aggregation pipeline for WHO 5 moments compliance analysis in hospitals
18. Express error handling middleware for hospital REST API with 500 status codes

### Combined (5 files needed)
19. JSON Web Token documentation
20. bcrypt password hashing documentation
21. CORS configuration documentation
22. React development documentation

## Implementation Commands

Use the following commands to fetch documentation:

```bash
# Backend technologies
npx ctx7 docs mongoose "MongoDB aggregation pipeline for healthcare compliance statistics" --output markdown > docs/backend/mongodb-aggregation.md
npx ctx7 docs mongoose "$facet aggregation with multiple statistics" --output markdown > docs/backend/mongodb-facet.md
npx ctx7 docs express "REST API route protection with auth middleware for healthcare endpoints" --output markdown > docs/backend/express-auth.md
npx ctx7 docs jsonwebtoken "JWT token with x-auth-token middleware for hospital dashboard" --output markdown > docs/auth/jwt-token.md
npx ctx7 docs bcryptjs "password hashing for medical system authentication" --output markdown > docs/auth/bcrypt-password.md
npx ctx7 docs helmet "HTTP security headers for hospital dashboard REST API" --output markdown > docs/backend/helmet-security.md
npx ctx7 docs cors "Cross-origin configuration for React frontend calling hospital backend" --output markdown > docs/backend/cors-config.md

# Frontend technologies
npx ctx7 docs axios "HTTP client for React hospital dashboard to call REST API endpoints" --output markdown > docs/frontend/axios-client.md
npx ctx7 docs react-chartjs-2 "dynamic chart components for hospital compliance visualization" --output markdown > docs/frontend/chart-components.md
npx ctx7 docs vite "React development setup for hospital dashboard with hot reload" --output markdown > docs/frontend/vite-setup.md
npx ctx7 docs react-router-dom "client-side routing for sector-specific staff views in hospital dashboard" --output markdown > docs/frontend/react-router.md
npx ctx7 docs chart.js "creating compliance percentage charts for hospital dashboard metrics" --output markdown > docs/charts/chartjs-metrics.md

# Specialized healthcare documentation
npx ctx7 docs mongodb "aggregation pipeline for WHO 5 moments compliance analysis in hospitals" --output markdown > docs/backend/who-5-moments.md
npx ctx7 docs express "error handling middleware for hospital REST API with 500 status codes" --output markdown > docs/backend/error-handling.md

# Created: $(date +"%Y-%m-%d %H:%M:%S")
# Usage: Run this command from project root directory
```

## Documentation Structure

### docs/backend/
- **mongodb-aggregation.md** - MongoDB aggregation pipelines for healthcare statistics
- **mongodb-facet.md** - $facet aggregation with multiple statistics
- **mongodb-expr.md** - $expr with $and conditions for date filtering  
- **mongodb-field-mapping.md** - Field mapping for null/empty medical data handling
- **express-auth.md** - Express REST API with authentication middleware
- **express-methods.md** - HTTP methods (GET, POST) for hospital endpoints
- **helmet-security.md** - HTTP security headers implementation
- **cors-config.md** - Cross-origin resource sharing configuration
- **who-5-moments.md** - WHO 5 moments compliance analysis pipelines
- **error-handling.md** - Error handling middleware with 500 status codes

### docs/frontend/
- **axios-client.md** - Axios configuration for React hospital dashboard API communication
- **chart-components.md** - React-Chartjs-2 components for compliance visualization
- **vite-setup.md** - Vite configuration and setup for React hospital dashboard development
- **react-router.md** - React Router for sector-specific staff views and routing
- **chartjs-metrics.md** - Chart.js implementation for percentage metrics display

### docs/auth/
- **jwt-token.md** - JWT authentication with x-auth-token middleware
- **bcrypt-password.md** - Password hashing with bcrypt for medical system security

### docs/charts/
- **chartjs-metrics.md** - Chart.js implementation details
- **chartjs-rounding.md** - $round precision for displaying hospital compliance percentages

## Notes

1. **npx ctx7 setup is unstable** - Use direct `npx ctx7 docs <package> <query>` commands instead
2. **Concurrent execution** - Run multiple documentation downloads in parallel for efficiency
3. **Project-specific queries** - All queries are tailored specifically for hospital hygiene compliance
4. **Medical data considerations** - Special attention given to null/empty value handling in medical data
5. **Pipeline documentation** - Focus on MongoDB aggregation pipelines for healthcare statistics
6. **WHO 5 moments** - Specialized documentation for World Health Organization hand hygiene compliance