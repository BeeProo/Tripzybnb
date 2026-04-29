# Tripzybnb — Hotel & Room Booking Platform

A modern, full-stack Airbnb-style web application for discovering and booking hotels and rooms across India. Features role-based access control for **Guests**, **Hosts**, and **Admins**, integrated **Razorpay** payments, real-time messaging, **in-app notifications**, and a wishlist system.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19 + Vite                     |
| Backend    | Node.js + Express 4                 |
| Database   | MongoDB + Mongoose 8                |
| Auth       | JWT (httpOnly cookies)              |
| Payments   | Razorpay (Test Mode)                |
| Real-time  | Socket.io                           |
| Security   | Helmet, Rate Limiting, Sanitize     |
| PWA        | Manifest + Service Worker           |

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **MongoDB** running on `localhost:27017` (or update `.env`)

### 1. Clone & Install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Configure Environment

```bash
# server/.env (created automatically, edit if needed)
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tripzybnb
JWT_SECRET=tripzybnb_super_secret_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database

```bash
cd server
npm run seed
```

This creates:
- **3 users** (1 admin + 1 host + 1 regular user)
- **15 listings** across India
- **18 reviews** with ratings
- **4 bookings** (3 confirmed, 1 cancelled)

### 4. Run the App

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Visit **http://localhost:5173**

---

## Demo Accounts

| Role  | Email                   | Password     | Login Page       |
|-------|-------------------------|-------------|------------------|
| Admin | admin@tripzybnb.com     | admin123    | `/login`         |
| Host  | beepro@user.com         | password123 | `/host/login`    |
| User  | kishorekumar@user.com   | password123 | `/login`         |

---

## Role-Based Access

### 👤 Guest (User)
- Browse and search listings by location, price, rating, tags, amenities
- Book properties with **Razorpay** payment (auto-confirms on successful payment)
- View booking history and cancel upcoming trips
- **Wishlist** — save favorite properties (heart icon on cards + detail page)
- **Message hosts** directly from listing pages
- **Real-time notifications** — bell icon with unread badge for messages, booking updates
- Write reviews and rate stays
- Dark mode toggle

### 🏠 Host
- **Dedicated host portal** with separate login/registration (`/host/login`, `/host/register`)
- **Host Dashboard** — view all active listings with stats
- **Request new properties** — submit additional listings for admin approval
- **New Customers tab** — see all confirmed bookings across properties with guest details and payment status
- **Manage bookings** — confirm/reject pending bookings, cancel confirmed ones
- **Edit listings** — update title, description, price, images, amenities
- **View property details** — see bookings, reviews, and customer info per listing
- **Real-time notifications** — instant alerts for new bookings, cancellations, and messages
- Message guests

### 🛡️ Admin
- Full **Admin Panel** with platform-wide analytics
- Manage all users (view, delete with cascading data cleanup)
- Manage all listings (CRUD)
- **Approve/reject host requests** — hosts cannot create listings directly
- View all bookings across the platform
- **Preview dropdown** — switch between host and customer page views for reference
- Access to all listings via "All Listings" nav link

---

## Payment Integration (Razorpay)

Razorpay is integrated in **test mode** for sandbox transactions.

### How It Works
1. User selects dates on a listing → clicks **"Pay ₹X"**
2. Razorpay checkout popup opens with prefilled user details
3. User completes payment with test card
4. On success → booking is **auto-confirmed** with payment ID stored
5. Host sees the booking as "✅ Paid" in their dashboard

### Test Card Details
| Field  | Value              |
|--------|--------------------|
| Card   | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g., `12/26`) |
| CVV    | Any 3 digits (e.g., `123`) |
| OTP    | `1234`             |

### Configuration
The Razorpay test key is configured in `client/src/pages/ListingDetail.jsx`:
```js
key: 'rzp_test_Sj0u9e8aOZK11V'
```
Replace with your own key from [Razorpay Dashboard](https://dashboard.razorpay.com/).

---

## Features

### Core
- 🏠 **Listings** — Browse 15+ curated hotel/room listings
- 🔍 **Search & Filter** — By location, price, rating, tags, amenities
- 📅 **Booking** — Date selection, availability check, price calculation
- 💳 **Razorpay Payments** — Secure test-mode payments in INR
- ⭐ **Reviews** — Rate and review listings
- 👤 **User Dashboard** — View booking history with payment status, cancel trips
- 🏠 **Host Dashboard** — Manage listings, view customers, handle bookings
- 🛡️ **Admin Panel** — Full platform control with analytics
- 📱 **Responsive** — Works on mobile, tablet, and desktop

### Advanced
- 🌓 **Dark Mode** — System-aware theme with manual toggle
- ♡ **Wishlist** — Heart icon on listing cards + "Save" button on detail page
- 💬 **Real-time Messaging** — Guest ↔ Host chat via Socket.io
- 🔔 **In-App Notifications** — Real-time bell icon with unread badge, dropdown panel, mark-read
- ✨ **Skeleton Screens** — Premium loading states
- 🍞 **Toast Alerts** — Success/error/info popup notifications
- 📸 **Image Lightbox** — Full-screen gallery with keyboard navigation
- 🔒 **Security** — Rate limiting (1000 req/15min), Helmet, MongoDB sanitization
- 📱 **PWA** — Installable as a mobile app
- 🔍 **SEO** — Open Graph, Twitter Cards, meta tags
- 🎨 **Role-specific Navbar** — Different nav for Guest, Host, Admin
- 📋 **Host Request System** — Hosts submit properties → Admin approves

---

## API Endpoints

Base: `http://localhost:5000/api/v1`

### Auth
| Method | Endpoint              | Description              | Access  |
|--------|-----------------------|--------------------------|---------|
| POST   | `/auth/register`      | Register user            | Public  |
| POST   | `/auth/register-host` | Register host            | Public  |
| POST   | `/auth/login`         | Login                    | Public  |
| POST   | `/auth/logout`        | Logout                   | Auth    |
| GET    | `/auth/me`            | Get current user         | Auth    |

### Listings
| Method | Endpoint                          | Description                | Access     |
|--------|-----------------------------------|----------------------------|------------|
| GET    | `/listings`                       | Get all listings (w/ filters) | Public  |
| GET    | `/listings/featured`              | Get featured listings      | Public     |
| GET    | `/listings/:id`                   | Get single listing         | Public     |
| POST   | `/listings`                       | Create listing             | Admin only |
| PUT    | `/listings/:id`                   | Update listing             | Host/Admin |
| DELETE | `/listings/:id`                   | Delete listing             | Admin only |
| GET    | `/listings/:id/availability`      | Check date availability    | Public     |

### Bookings
| Method | Endpoint                      | Description                    | Access     |
|--------|-------------------------------|--------------------------------|------------|
| POST   | `/bookings`                   | Create booking (w/ payment)    | Auth       |
| GET    | `/bookings/my`                | Get user's bookings            | Auth       |
| GET    | `/bookings/host/all`          | Get all host's property bookings | Host/Admin |
| GET    | `/bookings`                   | Get all bookings               | Admin      |
| GET    | `/bookings/listing/:listingId`| Get bookings for a listing     | Host/Admin |
| PATCH  | `/bookings/:id/cancel`        | Cancel booking                 | Auth       |
| PATCH  | `/bookings/:id/confirm`       | Confirm booking                | Host/Admin |

### Reviews
| Method | Endpoint                    | Description        | Access |
|--------|-----------------------------|--------------------|--------|
| GET    | `/listings/:id/reviews`     | Get listing reviews | Public |
| POST   | `/listings/:id/reviews`     | Create review      | Auth   |
| DELETE | `/reviews/:id`              | Delete review      | Admin  |

### Wishlist
| Method | Endpoint                     | Description            | Access |
|--------|------------------------------|------------------------|--------|
| GET    | `/wishlist`                  | Get user's wishlist    | Auth   |
| POST   | `/wishlist`                  | Add to wishlist        | Auth   |
| DELETE | `/wishlist/:listingId`       | Remove from wishlist   | Auth   |
| GET    | `/wishlist/check/:listingId` | Check if wishlisted    | Auth   |

### Messages
| Method | Endpoint                            | Description         | Access |
|--------|-------------------------------------|---------------------|--------|
| GET    | `/conversations`                    | Get conversations   | Auth   |
| POST   | `/conversations`                    | Start conversation  | Auth   |
| GET    | `/conversations/:id/messages`       | Get messages        | Auth   |
| POST   | `/conversations/:id/messages`       | Send message        | Auth   |

### Host Requests
| Method | Endpoint                          | Description              | Access     |
|--------|-----------------------------------|--------------------------|------------|
| POST   | `/host-requests`                  | Submit property request  | Host       |
| GET    | `/host-requests/my`               | Get my requests          | Host       |
| GET    | `/host-requests/my-listings`      | Get my active listings   | Host       |
| GET    | `/host-requests`                  | Get all requests         | Admin      |
| GET    | `/host-requests/:id`              | Get single request       | Admin      |
| PATCH  | `/host-requests/:id/approve`      | Approve request          | Admin      |
| PATCH  | `/host-requests/:id/reject`       | Reject request           | Admin      |

### Notifications
| Method | Endpoint                   | Description             | Access |
|--------|----------------------------|-------------------------|--------|
| GET    | `/notifications`           | Get my notifications    | Auth   |
| GET    | `/notifications/unread-count` | Get unread count     | Auth   |
| PATCH  | `/notifications/:id/read`  | Mark as read            | Auth   |
| PATCH  | `/notifications/read-all`  | Mark all as read        | Auth   |

### Users (Admin)
| Method | Endpoint          | Description    | Access |
|--------|-------------------|----------------|--------|
| GET    | `/users`          | Get all users  | Admin  |
| DELETE | `/users/:id`      | Delete user    | Admin  |

---

## Project Structure

```
Tripzybnb/
├── client/                     # React frontend
│   ├── public/
│   │   └── manifest.json       # PWA manifest
│   ├── src/
│   │   ├── api/                # Axios API calls
│   │   ├── components/
│   │   │   ├── common/         # StarRating, SkeletonCard, SkeletonDetail, ImageLightbox
│   │   │   ├── layout/         # Navbar (role-based), Footer
│   │   │   └── listings/       # ListingCard (with wishlist heart)
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Landing page with featured listings
│   │   │   ├── Search.jsx      # Search & filter page
│   │   │   ├── ListingDetail.jsx  # Detail page + Razorpay checkout + wishlist
│   │   │   ├── Login.jsx       # User login
│   │   │   ├── Register.jsx    # User registration
│   │   │   ├── HostLogin.jsx   # Host login
│   │   │   ├── HostRegister.jsx # Host registration
│   │   │   ├── Dashboard.jsx   # User bookings dashboard
│   │   │   ├── HostDashboard.jsx # Host portal (listings, customers, requests)
│   │   │   ├── HostListingView.jsx # Host's listing detail (bookings/reviews)
│   │   │   ├── BecomeHost.jsx  # Property request form (hosts + new users)
│   │   │   ├── Admin.jsx       # Admin panel
│   │   │   ├── Wishlist.jsx    # Saved listings
│   │   │   └── Messages.jsx    # Real-time chat
│   │   ├── App.jsx             # Root component with routing
│   │   ├── main.jsx            # Entry point with ThemeProvider
│   │   └── index.css           # Global styles + dark mode
│   ├── index.html              # SEO meta tags, Razorpay script, PWA
│   └── vite.config.js
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # DB connection
│   │   ├── controllers/        # auth, listing, booking, review, user, wishlist, conversation, notification
│   │   ├── middleware/          # Auth (role-based), error handling, validation
│   │   ├── models/             # User, Listing, Booking, Review, Wishlist, Conversation, Message, Notification
│   │   ├── routes/             # All API routes
│   │   ├── utils/              # ApiError, catchAsync
│   │   └── app.js              # Express setup + security middleware
│   ├── seed.js                 # Database seeder
│   └── server.js               # Entry point + Socket.io (user rooms for notifications)
└── README.md
```

---

## Booking Flow

```
Guest selects dates → Clicks "Pay ₹X"
    ↓
Razorpay popup opens → Guest pays with test card
    ↓
Payment success → Booking auto-confirmed (status: "confirmed")
    ↓
Guest sees booking in Dashboard (✅ Paid + Confirmed)
Host receives 🔔 real-time notification: "New Booking!"
Host sees customer in "New Customers" tab (✅ Paid)
```

---

## Notification System

Real-time in-app notifications powered by **Socket.io** + **MongoDB**.

### Notification Triggers

| Event | Recipient | Icon | Description |
|-------|-----------|------|-------------|
| New message sent | Other participant | 💬 | "New message from {name}" with preview |
| New booking created | Property host | 🎉 | "{guest} booked {property} for ₹{amount}" |
| Booking cancelled by guest | Property host | ❌ | "{guest} cancelled their booking" |
| Booking cancelled by host | Guest | ❌ | "Your booking has been cancelled" |

### How It Works
1. User logs in → Socket.io connects and joins personal `user:{id}` room
2. Backend events trigger `createNotification()` → saves to DB + emits via Socket.io
3. Navbar bell icon shows pulsing red unread badge
4. Click bell → dropdown with latest 20 notifications
5. Click notification → marks as read + navigates to relevant page
6. "Mark all read" button clears all unread indicators
7. Notifications auto-expire after 30 days (MongoDB TTL index)

---

## License

This project is for educational purposes.
