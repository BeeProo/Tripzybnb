const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, admin, hostOrAdmin } = require('../middleware/auth');
const {
  getListings,
  getFeaturedListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { checkAvailability } = require('../controllers/bookingController');
const { createReview, getListingReviews } = require('../controllers/reviewController');

const router = express.Router();

// Public routes
router.get('/', getListings);
router.get('/featured', getFeaturedListings);
router.get('/:id', getListing);
router.get('/:id/availability', checkAvailability);
router.get('/:id/reviews', getListingReviews);

// Protected routes
router.post(
  '/:id/reviews',
  protect,
  [
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
  ],
  validate,
  createReview
);

// Admin-only: create listings (host requests go through admin approval)
router.post(
  '/',
  protect,
  admin,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('location.city').trim().notEmpty().withMessage('City is required'),
    body('location.country').trim().notEmpty().withMessage('Country is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
  ],
  validate,
  createListing
);

router.put('/:id', protect, hostOrAdmin, updateListing);

// Admin-only routes
router.delete('/:id', protect, admin, deleteListing);

module.exports = router;
