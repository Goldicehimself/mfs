require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./DataBase/dbconnection.js');

// Import configuration and middleware
const constants = require('./src/config/constants');
const { requestLogger } = require('./src/middleware/logger');
const { errorHandler } = require('./src/utils/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const assetRoutes = require('./src/routes/assetRoutes');
const workOrderRoutes = require('./src/routes/workOrderRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');
const preventiveMaintenanceRoutes = require('./src/routes/preventiveMaintenanceRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

const EXPRESSPORT = constants.PORT;
const app = express();


// Security headers
app.use(helmet());

// CORS
app.use(cors());

//  Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // adjust based on your needs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

app.use(limiter);

//  Request logging
app.use(requestLogger);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/preventive-maintenance', preventiveMaintenanceRoutes);
app.use('/api/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use(errorHandler);


//  Connect DB
connectDB();

app.listen(EXPRESSPORT, () => {
  console.log(` Server is running on http://localhost:${EXPRESSPORT}`);
  console.log(` API Documentation: http://localhost:${EXPRESSPORT}/api/docs`);
});
