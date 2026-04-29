const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, admin } = require('../middleware/auth');
const {
  createHostRequest,
  getMyHostRequests,
  getAllHostRequests,
  getHostRequest,
  approveHostRequest,
  rejectHostRequest,
  getMyListings,
} = require('../controllers/hostRequestController');

const router = express.Router();

router.use(protect); // All routes require authentication

// User/Host routes
router.post(
  '/',
  [
    body('propertyTitle').trim().notEmpty().withMessage('Property title is required'),
    body('propertyDescription').trim().notEmpty().withMessage('Description is required'),
    body('propertyType').notEmpty().withMessage('Property type is required'),
    body('location.city').trim().notEmpty().withMessage('City is required'),
    body('location.country').trim().notEmpty().withMessage('Country is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('maxGuests').isInt({ min: 1 }).withMessage('Max guests must be at least 1'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
  ],
  validate,
  createHostRequest
);

router.get('/my', getMyHostRequests);
router.get('/my-listings', getMyListings);

// Admin routes
router.get('/', admin, getAllHostRequests);
router.get('/:id', admin, getHostRequest);
router.patch('/:id/approve', admin, approveHostRequest);
router.patch('/:id/reject', admin, rejectHostRequest);

module.exports = router;
