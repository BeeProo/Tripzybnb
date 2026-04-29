const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} = require('../controllers/wishlistController');

const router = express.Router();

router.use(protect); // All wishlist routes require authentication

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.get('/check/:listingId', checkWishlist);
router.delete('/:listingId', removeFromWishlist);

module.exports = router;
