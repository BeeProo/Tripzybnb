import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const registerHostUser = (data) => api.post('/auth/register-host', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const logoutUser = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');

// Listings
export const getListings = (params) => api.get('/listings', { params });
export const getFeaturedListings = () => api.get('/listings/featured');
export const getListing = (id) => api.get(`/listings/${id}`);
export const createListing = (data) => api.post('/listings', data);
export const updateListing = (id, data) => api.put(`/listings/${id}`, data);
export const deleteListing = (id) => api.delete(`/listings/${id}`);

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getMyBookings = () => api.get('/bookings/my');
export const getAllBookings = () => api.get('/bookings');
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);
export const confirmBooking = (id) => api.patch(`/bookings/${id}/confirm`);
export const checkAvailability = (id, params) =>
  api.get(`/listings/${id}/availability`, { params });
export const getListingBookings = (listingId) =>
  api.get(`/bookings/listing/${listingId}`);
export const getHostAllBookings = () => api.get('/bookings/host/all');

// Reviews
export const getListingReviews = (id) => api.get(`/listings/${id}/reviews`);
export const createReview = (id, data) =>
  api.post(`/listings/${id}/reviews`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Users (Admin)
export const getAllUsers = () => api.get('/users');
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Wishlist
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (listingId) => api.post('/wishlist', { listing: listingId });
export const removeFromWishlist = (listingId) => api.delete(`/wishlist/${listingId}`);
export const checkWishlist = (listingId) => api.get(`/wishlist/check/${listingId}`);

// Messages
export const getConversations = () => api.get('/conversations');
export const getMessages = (conversationId) => api.get(`/conversations/${conversationId}/messages`);
export const sendMessage = (conversationId, data) => api.post(`/conversations/${conversationId}/messages`, data);
export const startConversation = (data) => api.post('/conversations', data);

// Host Requests
export const createHostRequest = (data) => api.post('/host-requests', data);
export const getMyHostRequests = () => api.get('/host-requests/my');
export const getMyListings = () => api.get('/host-requests/my-listings');

// Host Requests (Admin)
export const getAllHostRequests = (params) => api.get('/host-requests', { params });
export const getHostRequest = (id) => api.get(`/host-requests/${id}`);
export const approveHostRequest = (id, data) => api.patch(`/host-requests/${id}/approve`, data);
export const rejectHostRequest = (id, data) => api.patch(`/host-requests/${id}/reject`, data);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

export default api;
