const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    location: {
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        trim: true,
        default: '',
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
      },
    },
    price: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    maxGuests: {
      type: Number,
      default: 6,
      min: [1, 'At least 1 guest required'],
      max: [50, 'Cannot exceed 50 guests'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for search
listingSchema.index({ title: 'text', description: 'text' });
// Performance indexes
listingSchema.index({ 'location.city': 1 });
listingSchema.index({ 'location.country': 1 });
listingSchema.index({ tags: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ avgRating: -1 });

module.exports = mongoose.model('Listing', listingSchema);
