# Tripzybnb API Documentation

**Base URL:** `http://localhost:5000/api/v1`

All responses follow the format:
```json
{
  "success": true,
  "data": { ... },
  "pagination": { "page": 1, "limit": 12, "total": 15, "pages": 2 }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authentication

Authentication uses JWT tokens stored in **httpOnly cookies**. Include `credentials: 'include'` in fetch/axios requests.

### POST `/auth/register`
Create a new user account.

**Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| name | string | ✅ | Full name (max 50 chars) |
| email | string | ✅ | Valid email address |
| password | string | ✅ | Minimum 6 characters |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "BeePro",
    "email": "beepro@user.com",
    "role": "user",
    "avatar": ""
  }
}
```

### POST `/auth/login`
Login with email and password.

**Body:**
| Field | Type | Required |
|---|---|---|
| email | string | ✅ |
| password | string | ✅ |

**Response (200):** Same as register. Sets `token` cookie.

### POST `/auth/logout`
🔒 **Auth Required**

Clears the authentication cookie.

### GET `/auth/me`
🔒 **Auth Required**

Returns the currently authenticated user.

---

## Listings

### GET `/listings`
Retrieve listings with search, filter, sort, and pagination.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| search | string | Full-text search on title & description |
| city | string | Filter by city name (case-insensitive) |
| country | string | Filter by country |
| tags | string | Comma-separated tag filter (e.g., `luxury,beach`) |
| amenities | string | Comma-separated; listing must have ALL specified |
| minPrice | number | Minimum price per night |
| maxPrice | number | Maximum price per night |
| minRating | number | Minimum average rating (1-5) |
| sort | string | `price_asc`, `price_desc`, `rating`, `popular` |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 12) |

**Example:** `GET /listings?city=Goa&minPrice=5000&sort=rating&page=1`

**Response (200):**
```json
{
  "success": true,
  "data": [ { listing objects... } ],
  "pagination": { "page": 1, "limit": 12, "total": 3, "pages": 1 }
}
```

### GET `/listings/featured`
Returns top 8 listings sorted by average rating.

### GET `/listings/:id`
Returns a single listing with creator info.

### POST `/listings`
🔒 **Admin Only**

**Body:**
| Field | Type | Required |
|---|---|---|
| title | string | ✅ |
| description | string | ✅ |
| location.city | string | ✅ |
| location.state | string | ❌ |
| location.country | string | ✅ |
| price | number | ✅ |
| images | string[] | ❌ |
| amenities | string[] | ❌ |
| tags | string[] | ❌ |

### PUT `/listings/:id`
🔒 **Admin Only** — Update a listing. Same body fields as create (all optional).

### DELETE `/listings/:id`
🔒 **Admin Only** — Deletes listing and all associated bookings and reviews.

---

## Bookings

### POST `/bookings`
🔒 **Auth Required** — Create a new booking.

**Body:**
| Field | Type | Required | Description |
|---|---|---|---|
| listing | string | ✅ | Listing ObjectId |
| checkIn | string | ✅ | ISO 8601 date (e.g., `2026-04-10`) |
| checkOut | string | ✅ | ISO 8601 date |
| guests | number | ❌ | Default: 1 |

**Validations:**
- Check-out must be after check-in
- Check-in cannot be in the past
- No overlapping confirmed bookings for the same listing
- `totalPrice` is auto-calculated: `nights × price`

### GET `/bookings/my`
🔒 **Auth Required** — Returns current user's bookings (sorted newest first).

### GET `/bookings`
🔒 **Admin Only** — Returns all bookings with user and listing details.

### PATCH `/bookings/:id/cancel`
🔒 **Auth Required** — Cancel a booking (owner or admin).

### GET `/listings/:id/availability`
Check if a listing is available for specific dates.

**Query Parameters:**
| Param | Type | Required |
|---|---|---|
| checkIn | string | ✅ |
| checkOut | string | ✅ |

**Response:**
```json
{ "success": true, "available": true }
```

---

## Reviews

### POST `/listings/:id/reviews`
🔒 **Auth Required** — Add a review to a listing.

**Body:**
| Field | Type | Required |
|---|---|---|
| rating | number | ✅ (1-5) |
| comment | string | ✅ |

**Constraints:** One review per user per listing. Auto-updates listing's `avgRating` and `reviewCount`.

### GET `/listings/:id/reviews`
Returns all reviews for a listing with user info.

### DELETE `/reviews/:id`
🔒 **Auth Required** — Delete a review (owner or admin). Auto-recalculates listing rating.

---

## Health Check

### GET `/health`
Returns `{ "success": true, "message": "API is running" }`
