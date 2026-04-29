const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, admin, hostOrAdmin } = require('../middleware/auth');
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  cancelBooking,
  confirmBooking,
  getListingBookings,
  getHostAllBookings,
} = require('../controllers/bookingController');

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('listing').notEmpty().withMessage('Listing ID is required'),
    body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
    body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
  ],
  validate,
  createBooking
);

router.get('/my', protect, getMyBookings);
router.get('/host/all', protect, hostOrAdmin, getHostAllBookings);
router.get('/', protect, admin, getAllBookings);
router.get('/listing/:listingId', protect, hostOrAdmin, getListingBookings);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/confirm', protect, hostOrAdmin, confirmBooking);

module.exports = router;
