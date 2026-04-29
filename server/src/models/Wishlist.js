const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
    },
  },
  { timestamps: true }
);

// One wishlist entry per user per listing
wishlistSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
