# Tripzybnb Project Presentation Guide

This guide is designed to help you explain your project, **Tripzybnb**, during your presentation. It breaks down the folder structure, the technology stack, and the core functionality.

## 1. Project Overview

**Tripzybnb** is a full-stack "Hotel/Home Booking" application built using the **MERN** stack (MongoDB, Express, React, Node.js). It allows users to browse listings, view details, make bookings, and provide reviews. It also includes an administrative interface for managing the platform.

### Architecture Diagram

```mermaid
graph TD
    User((User)) <--> Client[React Frontend (Vite)]
    Client <--> API[Express REST API]
    API <--> Logic[Controllers & Middleware]
    Logic <--> DB[(MongoDB / Mongoose)]
```

## 2. Technology Stack

- **Frontend**: React (v19) with Vite (for fast builds), React Router (for navigation), and Axios (for API communication).
- **Backend**: Node.js and Express.js (REST API).
- **Database**: MongoDB with Mongoose (ODM).
- **Authentication**: JSON Web Tokens (JWT) and Bcrypt (for password hashing).
- **Tools**: Nodemon (dev environment), Dotenv (environment variables), Morgan (logging).

---

## 3. Folder Structure Explanation

### `server/` (The Backend)

The backend handles the data, logic, and security of the application.

- **`src/models/`**: Contains the "Blueprints" for your database.
  - `User.js`: Defines what a user looks like (e.g., name, email, role).
  - `Listing.js`: Schema for hotel/home listings.
  - `Booking.js`: Schema for tracking user reservations.
  - `Review.js`: Schema for user feedback on listings.
- **`src/routes/`**: Defines the "Endpoints" (URLs) that the frontend can talk to.
  - `authRoutes.js`: Login and Registration.
  - `listingRoutes.js`: Fetching, creating, or editing listings.
  - `bookingRoutes.js`: Managing reservations.
- **`src/controllers/`**: The "Brain" of the backend. Contains the actual logic for each route (e.g., "Find all listings in the database and send them back").
- **`src/middleware/`**: Functions that run "in the middle" of a request.
  - `authMiddleware.js`: Checks if a user is logged in before allowing them to book a stay.
- **`src/config/`**: Setup for external services, primarily the **Database Connection** to MongoDB.
- **`src/app.js`**: Initializes Express and configures middleware like CORS and JSON parsing.
- **`server.js`**: The starting point that launches the server on a specific port (e.g., 5000).

---

### `client/` (The Frontend)

The frontend is what the user sees and interacts with.

- **`src/pages/`**: Full-screen views.
  - `Home.jsx`: The landing page with featured listings.
  - `ListingDetail.jsx`: Shows photos, description, and price for a specific place.
  - `Dashboard.jsx`: User profile and booking history.
  - `Admin.jsx`: Special view for administrators to manage users and listings.
- **`src/components/`**: Smaller, reusable UI parts (e.g., `Navbar.jsx`, `ListingCard.jsx`, `Footer.jsx`).
- **`src/context/`**: State management (e.g., `AuthContext.jsx`). This allows the app to "remember" if a user is logged in across different pages.
- **`src/api/`**: Centralized place for fetching data from the backend using Axios.
- **`App.jsx`**: The main hub that defines the routing (which URL shows which page).
- **`main.jsx`**: The entry point that renders the React app into the HTML.

---

## 4. How the Project Works (The Workflow)

### The "Big Picture" Flow

1. **User Action**: A user clicks on a listing on the homepage.
2. **Frontend Request**: React sends a "GET" request via **Axios** to the backend (e.g., `/api/listings/123`).
3. **Backend Logic**: The **Route** receives the request, calls the **Controller**, which then asks the **Database** (Mongoose) for that listing's data.
4. **Database Response**: MongoDB sends the data back to the Controller.
5. **Backend Response**: The Controller sends the data as a JSON object back to the Frontend.
6. **Frontend Update**: React receives the data and uses it to update the **State** and render the `ListingDetail` page.

### Key Logic Examples

- **Authentication**: When you login, the server creates a **JWT (Token)**. This token is stored in your browser (Cookies or LocalStorage) and is sent with every subsequent request to prove who you are.
- **Search**: The search bar filters listings based on the location or dates provided by the user, sending specific queries to the backend.

---

## 5. Summary of Key Features

- **User Authentication**: Secure signup and login.
- **Search & Filter**: Find the perfect stay.
- **Booking System**: Select dates and reserve a place.
- **Reviews**: Leave feedback for others.
- **Admin Panel**: Complete control over users and listings (CRUD operations).

---

## 6. Tips for your Presentation

1. **Live Demo**: Show the homepage first, then sign in as a user, book a place, and finally show the Admin panel.
2. **Code Snippet**: If they ask for code, show a **Route** and its corresponding **Controller** to demonstrate how the frontend communicates with the backend.
3. **Database Vision**: Mention that you used **MongoDB** because its flexible document structure is perfect for listings that might have different features (Wi-fi, Pool, etc.).
