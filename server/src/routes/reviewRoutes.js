const express = require('express');
const { protect, admin } = require('../middleware/auth');
const { deleteReview } = require('../controllers/reviewController');

const router = express.Router();

router.delete('/:id', protect, deleteReview);

module.exports = router;
