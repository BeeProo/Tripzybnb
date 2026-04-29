const mongoose = require('mongoose');

const hostRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    // Property details for the request
    propertyTitle: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    propertyDescription: {
      type: String,
      required: [true, 'Property description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    propertyType: {
      type: String,
      required: [true, 'Property type is required'],
      enum: ['Hotel', 'Villa', 'Apartment', 'Cottage', 'Resort', 'Homestay', 'Hostel', 'Other'],
    },
    location: {
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, trim: true, default: '' },
      country: { type: String, required: [true, 'Country is required'], trim: true },
      address: { type: String, trim: true, default: '' },
    },
    price: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [1, 'Price must be at least ₹1'],
    },
    maxGuests: {
      type: Number,
      required: [true, 'Max guests is required'],
      min: [1, 'At least 1 guest required'],
      max: [50, 'Cannot exceed 50 guests'],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    // Host's personal info
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    message: {
      type: String,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    // Admin workflow
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

hostRequestSchema.index({ user: 1 });
hostRequestSchema.index({ status: 1 });

module.exports = mongoose.model('HostRequest', hostRequestSchema);
