const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const hostRequestRoutes = require('./routes/hostRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Security middleware
try {
  const helmet = require('helmet');
  app.use(helmet({ contentSecurityPolicy: false }));
} catch (e) {
  // helmet not installed, skip
}

try {
  const mongoSanitize = require('express-mongo-sanitize');
  app.use(mongoSanitize());
} catch (e) {
  // express-mongo-sanitize not installed, skip
}

try {
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs (generous for dev)
    message: { success: false, message: 'Too many requests, please try again later' },
  });
  app.use('/api', limiter);
} catch (e) {
  // express-rate-limit not installed, skip
}

// Core Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);
app.use('/api/v1/conversations', conversationRoutes);
app.use('/api/v1/host-requests', hostRequestRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
