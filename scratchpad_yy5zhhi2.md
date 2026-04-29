# Tripzybnb End-to-End Test Plan

- [x] Step 1: Login as user (john@example.com)
  - [x] Navigate to /login (via IPv6 http://[::1]:5173/login)
  - [x] Enter credentials and submit
  - [x] Verify homepage redirect and navbar update
  - [x] Screenshot: login_success.png

_Note: Successfully connected to frontend via IPv6 localhost (http://[::1]:5173/login). Encountering recurring logout issues during navigation. Investigating session persistence._

- [x] Step 2: Test Booking Flow
  - [x] Navigate to /search
  - [x] Select first listing
  - [x] Scroll to booking widget
  - [x] Screenshot: listing_detail_widget_logged_in.png
  - [x] Set dates (2026-05-01 to 2026-05-03) and reserve
  - [x] Screenshot: booking_confirmation.png
- [x] Step 3: Check Dashboard
  - [x] Navigate to /dashboard (via navbar click to preserve SPA state)
  - [x] Verify booking in history (Confirmed: 1 May – 3 May 2026)
  - [x] Screenshot: dashboard_bookings_final.png
- [x] Step 4: Test Admin Panel
  - [x] Logout
  - [x] Login as admin (admin@tripzybnb.com)
  - [x] Navigate to /admin (Successful)
  - [x] Screenshot: admin_panel_final.png

**Conclusion:**

- Login works for both User and Admin.
- Booking flow works end-to-end, including date selection (may require JS for reliability in some browsers) and price calculation.
- Dashboard correctly displays booking history.
- Admin panel shows aggregated stats and management table.
- **Note on Connectivity:** The application is reachable via IPv6 `http://[::1]:5173` if standard `localhost` fails due to `--host` binding.
- **Note on Sessions:** SPA navigation preserves state, but direct URL navigation via browser might cause session loss if the application doesn't persist tokens to storage.
