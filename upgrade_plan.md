# Tripzybnb — Comprehensive Upgrade Plan

## Current State Analysis

The project is a solid MERN stack Airbnb clone with: React 19 + Vite (frontend), Express 4 + MongoDB (backend), JWT auth, CRUD listings, bookings, reviews, admin panel. ~30 source files, ~2500 lines of code.

---

## Phase 1: Core Infrastructure Upgrades (Do First)

These are foundational changes that enable everything else.

### 1.1 ✅ Dark Mode Support

- Add CSS variables for dark theme in `index.css`
- Create `ThemeContext.jsx` with toggle persistence (localStorage)
- Add theme toggle button in Navbar
- **Impact**: Every page gets dark mode automatically via CSS variables

### 1.2 ✅ Skeleton Screens

- Create `SkeletonCard.jsx`, `SkeletonDetail.jsx`, `SkeletonTable.jsx` components
- Replace all `<div className="spinner">` with skeleton loaders
- **Impact**: App feels significantly faster, more professional

### 1.3 ✅ Toast Notification System

- Create `ToastContext.jsx` with auto-dismiss toast notifications
- Replace all `alert()` calls and inline status messages
- **Impact**: Professional UX across the entire app

---

## Phase 2: Feature Additions (Backend + Frontend)

### 2.1 ✅ Wishlist / Favorites System

- `Wishlist` model (server) — user + listing reference
- Wishlist routes/controller
- Heart icon on ListingCard, Wishlist page
- **New files**: model, route, controller, Wishlist page, CSS

### 2.2 ✅ Real-Time Messaging (Socket.io)

- `Message` and `Conversation` models
- Socket.io server integration in `server.js`
- Chat UI component with real-time updates
- Messages page with conversation list
- **Dependencies**: `socket.io` (server), `socket.io-client` (client)

### 2.3 ✅ Payment Integration (Razorpay)

- Razorpay order creation endpoint
- Payment verification endpoint
- Booking model update with `paymentId`, `paymentStatus`
- Checkout flow in ListingDetail booking widget
- **Dependencies**: `razorpay` (server)

### 2.4 ✅ Advanced Filtering (Instant Filters)

- Property type filter (Villa, Apartment, Cottage, etc.)
- Add `propertyType` field to Listing model
- Dual-range price slider component
- Instant filter updates without "Apply" button click (debounced)
- Guest count filter

### 2.5 ✅ Image Gallery / Lightbox

- Professional image gallery with lightbox overlay
- Keyboard navigation (arrow keys, escape)
- Image zoom on hover
- Smooth transitions between images

---

## Phase 3: Maps & Location

### 3.1 ✅ Geo-coordinates on Listings

- Add `location.coordinates` (GeoJSON) to Listing model
- Update seed data with real coordinates
- 2dsphere index for geo queries

### 3.2 ✅ Map View on Search Page

- Leaflet.js map integration (free, no API key needed)
- Split view: list + map
- Click pin → show listing card popup
- **Dependencies**: `leaflet`, `react-leaflet`

### 3.3 ✅ Map on Listing Detail

- Small map showing listing location
- Styled map marker

---

## Phase 4: Cloud & Performance

### 4.1 ✅ Cloudinary Image Upload

- Cloudinary SDK integration on server
- Multer middleware for file uploads
- Image upload UI in Admin create/edit listing form
- Automatic image optimization & responsive sizes
- **Dependencies**: `cloudinary`, `multer`, `multer-storage-cloudinary`

### 4.2 ✅ React Query (TanStack Query)

- Install and configure QueryClient
- Replace all `useEffect` + `useState` fetch patterns with `useQuery`/`useMutation`
- Automatic caching, refetching, loading states
- **Dependencies**: `@tanstack/react-query`

---

## Phase 5: PWA & SEO

### 5.1 ✅ Progressive Web App

- Create `manifest.json` with app icons
- Service worker for offline support
- Install prompt UI
- **Files**: `manifest.json`, `sw.js`, meta tags in `index.html`

### 5.2 ✅ SEO Meta Tags

- Dynamic `<title>` and `<meta>` per page using `react-helmet-async`
- Open Graph tags for social sharing
- Structured data (JSON-LD) for listings
- **Dependencies**: `react-helmet-async`

---

## Phase 6: Code Quality & Testing

### 6.1 ✅ Rate Limiting & Security

- `express-rate-limit` for API rate limiting
- `helmet` for HTTP security headers
- Input sanitization with `express-mongo-sanitize`
- **Dependencies**: `express-rate-limit`, `helmet`, `express-mongo-sanitize`

### 6.2 ✅ API Versioning & Error Codes

- Standardized error response format
- Error codes enum
- API response wrapper utility

---

## Implementation Order (Optimized for Dependencies)

| Step | Feature               | Est. Files Changed/Added |
| ---- | --------------------- | ------------------------ |
| 1    | Dark Mode             | 3 modified, 1 new        |
| 2    | Toast System          | 2 new, 5+ modified       |
| 3    | Skeleton Screens      | 3 new, 4 modified        |
| 4    | Image Lightbox        | 2 new, 1 modified        |
| 5    | Wishlist System       | 6 new, 3 modified        |
| 6    | Advanced Filters      | 2 new, 3 modified        |
| 7    | Map Integration       | 3 new, 3 modified        |
| 8    | Messaging (Socket.io) | 8 new, 3 modified        |
| 9    | Payment (Razorpay)    | 4 new, 3 modified        |
| 10   | Cloudinary Upload     | 3 new, 3 modified        |
| 11   | React Query           | 1 new, 8 modified        |
| 12   | PWA                   | 3 new, 1 modified        |
| 13   | SEO                   | 1 new (dep), 7 modified  |
| 14   | Security Hardening    | 1 modified, 2 new        |

> [!NOTE]
> TypeScript migration and Next.js migration are **not** included in this plan because they would require rewriting every single file and would be disruptive to the working application. These are better done as a separate project phase after all features are stable.

---

## What's NOT Being Changed

- ❌ TypeScript migration (would rewrite 100% of files — do separately)
- ❌ Next.js migration (would restructure entire client — do separately)
- ❌ Automated testing (Vitest/Playwright — do after features are stable)

These 3 are architectural migrations, not feature additions. They're best done after the feature set is locked in.
