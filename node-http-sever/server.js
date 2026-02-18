require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./DataBase/dbconnection.js');

// Import configuration and middleware
const { requestLogger } = require('./src/middleware/logger');
const { protect } = require('./src/middleware/auth');
const { AuthorizationError } = require('./src/utils/errorHandler');
const constants = require('./src/constants/constants');
const User = require('./src/models/User');
const { errorHandler } = require('./src/utils/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const assetRoutes = require('./src/routes/assetRoutes');
const workOrderRoutes = require('./src/routes/workOrderRoutes');
const vendorRoutes = require('./src/routes/vendorRoutes');
const preventiveMaintenanceRoutes = require('./src/routes/preventiveMaintenanceRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const activityRoutes = require('./src/routes/activityRoutes');
const orgRoutes = require('./src/routes/orgRoutes');
const leaveRoutes = require('./src/routes/leaveRoutes');
const fundRoutes = require('./src/routes/fundRoutes');
const emailRoutes = require('./src/routes/emailRoutes');

const EXPRESSPORT = constants.PORT;
const app = express();


// Security headers
app.use(helmet());

// CORS
app.use(cors());

//  Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//  Static uploads (auth protected with certificate access control)
app.use('/uploads', protect, async (req, res, next) => {
  try {
    if (!req.path.startsWith('/certificates/')) {
      return next();
    }

    const { role, id } = req.user || {};
    const allowedRoles = [constants.ROLES.ADMIN, constants.ROLES.MANAGER, constants.ROLES.FACILITY_MANAGER];
    if (allowedRoles.includes(role)) {
      return next();
    }

    if (role !== constants.ROLES.TECHNICIAN) {
      throw new AuthorizationError('Access denied');
    }

    const user = await User.findById(id).select('certificates');
    const normalizedPath = `uploads${req.path.split(path.sep).join('/')}`;
    const isOwner = user?.certificates?.includes(normalizedPath);

    if (!isOwner) {
      throw new AuthorizationError('Access denied');
    }

    next();
  } catch (error) {
    next(error);
  }
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/email', emailRoutes);

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

// Leave reminder job (every 6 hours)
const { sendLeaveReminderEmails } = require('./src/services/leaveService');
setInterval(() => {
  sendLeaveReminderEmails().catch((err) => console.error('[leave reminders] failed', err));
}, 6 * 60 * 60 * 1000);

app.listen(EXPRESSPORT, () => {
  console.log(` Server is running on http://localhost:${EXPRESSPORT}`);
  console.log(` API Documentation: http://localhost:${EXPRESSPORT}/api/docs`);
});
