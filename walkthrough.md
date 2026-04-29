# Tripzybnb — Walkthrough

## What Was Built

A complete **Airbnb-style hotel/room booking platform** with React frontend, Express backend, and MongoDB database.

---

## Verified Pages

### Homepage

Hero section with gradient overlay, animated search bar, tag quick-filters, and featured listings grid loaded from MongoDB.

```carousel
![Hero section with search](C:\Users\Asus\.gemini\antigravity\brain\27581097-b497-43a1-807f-4fb81636399c\homepage_hero_1773741710465.png)
<!-- slide -->
![Featured listings and tag filters](C:\Users\Asus\.gemini\antigravity\brain\27581097-b497-43a1-807f-4fb81636399c\homepage_featured_listings_1773741733455.png)
```

### Search Page

Full-text search, sidebar filters (price/rating/tags/amenities), sort dropdown, and 15 results from seed data.

![Search page with 15 listings](C:\Users\Asus.gemini\antigravity\brain\27581097-b497-43a1-807f-4fb81636399c\search_page_listings_1773741754915.png)

### Listing Detail

Image gallery with thumbnails, title/location/price, booking widget with date pickers, and reviews section.

![Penthouse Suite detail page](C:\Users\Asus.gemini\antigravity\brain\27581097-b497-43a1-807f-4fb81636399c\listing_detail_page_1773741772167.png)

### Login Page

Clean auth form with demo credential display for easy testing.

![Login page](C:\Users\Asus.gemini\antigravity\brain\27581097-b497-43a1-807f-4fb81636399c\login_page_1773741794144.png)

---

## Architecture Summary

| Component       | Files                                        | Key Features                                                          |
| --------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| **Models**      | 4 (User, Listing, Booking, Review)           | Password hashing, text indexes, auto-computed ratings                 |
| **Controllers** | 4                                            | Search/filter/sort/pagination, availability checking, cascade deletes |
| **Middleware**  | 3 (auth, errorHandler, validate)             | JWT cookies, role-based access, express-validator                     |
| **Pages**       | 7 React pages                                | Home, Search, ListingDetail, Login, Register, Dashboard, Admin        |
| **Seed Data**   | 15 listings, 3 users, 18 reviews, 4 bookings | Diverse Indian destinations                                           |

## How to Run

```bash
# 1. Seed database
cd server && npm run seed

# 2. Start backend (port 5000)
cd server && npm run dev

# 3. Start frontend (port 5173)
cd client && npm run dev
```

**Demo logins:** `admin@tripzybnb.com` / `admin123` — `beepro@user.com` / `password123` / `jane@example.com` / `password123`

## Browser Recording

![Browser test recording](C:\Users\Asus.gemini\antigravity\brain\27581097-b497-43a1-807f-4fb81636399c\tripzybnb_browser_test_1773741672322.webp)
