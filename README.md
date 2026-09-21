# Resellara — Full-Stack Second-Hand Marketplace

Resellara is a modern, full-stack pre-owned marketplace web application designed for buying and selling quality used tech, gear, furniture, and vehicles.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router DOM v6, React Hot Toast
- **Backend**: Java 25 / 21, Spring Boot 4.1.x / 3.4.x, Spring Data JPA, Spring Security 6+, JJWT (0.12.6)
- **Database**: MySQL 8.0 (with automated DDL updates and seed data) & fallback H2 profile
- **Authentication**: Stateless Bearer JWT with Role-based Access Control (`ROLE_BUYER`, `ROLE_SELLER`)

---

## Features

1. **User Authentication & Profile Management**:
   - Register as **Buyer** or **Seller**
   - Secure login generating signed JWT tokens
   - Role-based route guards and permissions
   - **One-click demo login buttons** for instant testing

2. **Marketplace Catalog & Search**:
   - Live keyword search across title, description, and location
   - Category filtering (Mobiles, Electronics, Vehicles, Furniture, Fashion, Books, Appliances)
   - Condition filtering (Like New, Excellent, Good, Fair)
   - Price range filtering & multi-criteria sorting (Featured, Newest, Price Low/High)
   - Badges showing calculated % savings off original retail price

3. **Product Details & Negotiation**:
   - High-resolution gallery preview
   - Item condition breakdown, location, and verified seller info
   - "Make Offer / Place Order" with custom offer price negotiation, delivery address, phone, and notes

4. **Seller Hub & Listing Management (CRUD)**:
   - Dashboard KPI metrics: Total listings, active items, sold count, pending offers
   - Create new listing with direct image preview, condition, price, and city
   - Edit existing listings
   - Mark items as Available or Sold
   - Delete listings

5. **Order Flow & Real-Time Status Updates**:
   - Buyers can track placed offers in **My Orders** with status timeline (`PENDING`, `ACCEPTED`, `REJECTED`)
   - Sellers receive incoming offers in their **Seller Dashboard** and can directly **Accept** or **Decline**
   - Accepted offers update product status in the marketplace

6. **Wishlist**:
   - Optimistic UI toggle for saving and removing items to wishlist
   - Dedicated **Saved Wishlist** page

---

## Pre-Seeded Demo Accounts

| Role | Email | Password | Details |
|------|-------|----------|---------|
| **Seller** | `seller@sellara.com` | `password123` | Alex Rivera (San Francisco, CA) |
| **Buyer** | `buyer@sellara.com` | `password123` | Sarah Chen (San Francisco, CA) |

*(You can also use the 1-click demo buttons on the Login page!)*

---

## Quick Start Guide

### 1. Backend (Spring Boot)
In `backend/`:
```bash
# With MySQL (default, set DB_PASSWORD if your root user has a password):
$env:DB_PASSWORD="your_mysql_password"
.\mvnw.cmd spring-boot:run

# Or with zero-config H2 profile:
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=h2"
```
Backend runs on `http://localhost:8080`.

### 2. Frontend (React + Vite)
In `frontend/`:
```bash
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.
