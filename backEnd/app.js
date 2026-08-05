const express = require('express');
const mongoose = require('mongoose');
const helmet = require("helmet");
const cors = require('cors');
const config = require('./config');
const observacionRoutes = require("./routes/observacionRoutes");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require('./middleware/authMiddleware');
const errorHandler = require('./errorHandler');

// 1. Inicializar la aplicación Express
const app = express();
const PORT = config.PORT || 3000;

// 2. Connectiong to MongoDB
mongoose.connect(config.MONGO_URI)
    .then(async () => {
        console.log(' Connected correctly to MongoDB.');
    })
    .catch((err) => {
        console.error('Connection error to MongoDB:', err);
        process.exit(1);
    });

// 3. Basic Middlewares

// CORS Configuration
app.use(cors({
    origin: config.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
    credentials: false,
    optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10kb' })); // Limit request body size
app.use(helmet()); // Security headers

// 4. Global Error Handler
app.use(errorHandler.globalErrorHandler);

// 5. Define Routes
app.get('/', (req, res) => {
    res.send('Api server for the Hospital Hygiene Dashboard is running.');
});

// 6. Use API Routes
app.use('/api/observaciones', 
    authMiddleware.authenticate,
    observacionRoutes
);

app.use('/api/auth',
    authRoutes
);

// 7. Initialize error handling for routes after them
app.use(errorHandler.routeErrorHandler);

// 8. Start Server
app.listen(PORT, () => {
    console.log(` Express server listening on http://localhost:${PORT}`);
    console.log(`Environment: ${config.NODE_ENV}`);
});

// 9. Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

module.exports = app;