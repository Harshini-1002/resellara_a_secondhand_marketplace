# Resellara — Project Documentation

> **Documentation set:** [README](README.md) · [Architecture](ARCHITECTURE.md) · [Frontend](FRONTEND.md) · [Backend](BACKEND.md) · [Database](DATABASE.md) · [API](API_DOCUMENTATION.md) · [Workflows](WORKFLOWS.md) · [Security](SECURITY.md) · [Setup](SETUP_AND_RUN.md) · [Testing](TESTING.md) · [Feature Audit](FEATURE_AUDIT.md) · [Interview Prep](INTERVIEW_PREPARATION.md) · [Glossary](GLOSSARY.md)

---

## Project Title

**Resellara** — A full-stack second-hand marketplace web application for India.

---

## Problem Statement

Buying and selling used items in India is often inconvenient and untrustworthy. Existing platforms like OLX suffer from:

- No verified buyer-seller communication before a deal is agreed.
- No protection against two buyers claiming the same item simultaneously.
- No verified-purchase review system to rate sellers honestly.
- No structured offer (negotiation) flow — just unmoderated phone calls.

**Resellara** solves these problems by providing a structured, safe platform where sellers can list items, buyers can browse and make price offers, a real-time-style chat enables negotiation, and reviews are only permitted after a deal is actually completed.

---

## Project Objectives

1. Enable users to register as either a **Buyer** or a **Seller**.
2. Allow sellers to create, edit, and delete product listings with price, condition, category, and Indian location data.
3. Allow buyers to browse, search, filter, and shortlist products.
4. Provide an **offer (order)** flow where buyers submit offers with a price, delivery address, and phone number.
5. Let sellers **accept** or **reject** offers, with the platform automatically reserving the product and declining competing offers.
6. Prevent duplicate purchases using **pessimistic database locking** to handle simultaneous requests.
7. Restore products to available status if an accepted deal is cancelled.
8. Provide **buyer-seller chat** per product.
9. Allow only the verified buyer of a completed order to submit **one review** per seller.
10. Provide **email OTP verification** for registration and password reset.

---

## Target Users

| User Type | Description |
|-----------|-------------|
| **Buyer** | Registers as `ROLE_BUYER`. Browses listings, makes offers, chats with sellers, manages wishlists, writes reviews after purchase. |
| **Seller** | Registers as `ROLE_SELLER`. Creates and manages listings, reviews incoming offers, accepts/rejects/completes deals. |
| *(Admin)* | The `ROLE_ADMIN` enum exists in code but no admin-specific routes or UI are currently implemented. |

---

## Main Features

### Implemented and Verified

| Feature | Summary |
|---------|---------|
| Email OTP registration | 6-digit OTP sent via Gmail SMTP, SHA-256 hashed, 5-minute expiry, 5-attempt lockout |
| JWT authentication | Stateless login; token stored in `localStorage`; valid 24 hours |
| Password validation | Min 6 chars; must include uppercase, lowercase, digit, special char |
| Password reset via OTP | Separate OTP flow for forgotten passwords |
| Product listing (seller) | Title, description, category, condition, price, original price, image URL, Indian location fields |
| Multi-parameter product search | Filter by keyword, category, condition, min/max price, state, district, city |
| AI-free price suggestion | Rule-based depreciation calculator using category, age, and condition |
| Wishlist (toggle) | Add/remove products; unique constraint prevents duplicates |
| Offer / order placement | Buyer submits offer price, address, phone; pessimistic lock prevents race conditions |
| Offer acceptance & reservation | Product → `RESERVED`; competing offers auto-rejected; in-chat notifications sent |
| Offer rejection / cancellation | If accepted order is cancelled → product restored to `AVAILABLE` |
| Deal completion | Seller marks `COMPLETED` → product becomes `SOLD` |
| Buyer-seller chat | Per-product conversation threads; automated system messages on status changes |
| Unread message count | `GET /api/chat/unread-count` endpoint |
| Verified-purchase reviews | Only buyer of a `COMPLETED` order can submit exactly one review |
| Seller rating summary | `AVG(rating)` computed from all verified reviews |
| Role-based UI routing | `ProtectedRoute` restricts `/seller` to `ROLE_SELLER` accounts |

### Partially Implemented

| Feature | Status |
|---------|--------|
| Product condition detail | `Condition` enum has 4 values (`LIKE_NEW`, `EXCELLENT`, `GOOD`, `FAIR`); detailed defect checklist is free text in `description` only |
| Chat unread indicators | Count endpoint exists; visual badge rendering depends on frontend implementation |

### Not Implemented

| Feature | Note |
|---------|------|
| Multiple image uploads | Only one `imageUrl` (text URL) per product is stored |
| User/listing reporting | No report or flag endpoint exists |
| Admin moderation queue | `ROLE_ADMIN` exists in the enum only |
| Static policy pages | `/privacy`, `/terms`, `/safety`, `/help` routes do not exist |
| Real-time WebSocket chat | Chat is REST-polled, not pushed via WebSocket |

---

## Technology Stack

| Technology | Version (verified) | Why it is used |
|------------|--------------------|----------------|
| **React** | 19.2.8 | Component-based UI library; fast and widely adopted for SPAs |
| **Vite** | 8.3.0 | Lightning-fast development server and build tool for React |
| **React Router DOM** | 7.18.4 | Client-side navigation between pages |
| **Axios** | 1.20.0 | HTTP client for calling the backend API |
| **Tailwind CSS** | 3.4.19 | Utility-first CSS framework for styling without writing custom CSS |
| **Lucide React** | 1.46.0 | Icon library |
| **React Hot Toast** | 2.6.0 | Toast notification system |
| **Java** | 21 (target bytecode) | Strongly typed, enterprise-grade language; required by Spring Boot |
| **Spring Boot** | 4.1.1 | Opinionated framework that auto-configures a production-ready server |
| **Spring Security** | (included in Spring Boot) | Authentication, JWT filter, CORS, CSRF, role-based access control |
| **Spring Data JPA + Hibernate** | Hibernate 7.4.5 | ORM layer; writes SQL automatically from Java entity classes |
| **JJWT** | 0.12.x | Library for creating and validating JSON Web Tokens |
| **Spring Mail** | (included) | Sends OTP emails via Gmail SMTP |
| **MySQL** | 8.0.43 | Relational database; persistent, ACID-compliant |
| **MySQL Connector/J** | 8.0.43 | JDBC driver connecting Spring Boot to MySQL |
| **Maven** | (mvnw wrapper) | Java dependency manager and build tool |

---

## Main User Roles

```
ROLE_BUYER   → Browse, search, wishlist, offer, chat, review
ROLE_SELLER  → List products, manage offers, complete/cancel deals, chat
ROLE_ADMIN   → Enum value exists in code; no routes currently implemented
```

---

## Project Scope and Limitations

**In scope (implemented):**
- Full authentication and OTP verification
- Product listing, search, and filtering
- Offer flow with concurrency protection
- Chat with automated notifications
- Verified reviews and seller ratings

**Out of scope / limitations:**
- No payment gateway integration
- No image upload (sellers paste an image URL)
- No real-time WebSocket chat (polling-based)
- No admin interface or content moderation
- No mobile app; desktop web only
- No Docker or cloud deployment configuration

---

## Resume Description

> Built **Resellara**, a full-stack second-hand marketplace using **React 19**, **Spring Boot 4.1.1**, and **MySQL 8.0**. Implemented JWT-based authentication with **email OTP verification** (SHA-256 hashed, 5-minute expiry). Designed a transactional **offer acceptance system** with **pessimistic database locking** to prevent two buyers from reserving the same item simultaneously, with automatic rejection of competing offers and product status lifecycle management (`AVAILABLE → RESERVED → SOLD`). Built a buyer-seller **chat system** with automated in-chat notifications, and a **verified-purchase review** system enforced at both the application and database layer (unique constraint on `order_id`).

---

## Interview Introductions

### 30-Second Introduction

> "Resellara is a full-stack second-hand marketplace I built using React and Spring Boot. Users register as buyers or sellers. Sellers list used items; buyers browse, filter, and make price offers. The key engineering challenge was preventing two buyers from simultaneously reserving the same item — I solved this with a pessimistic database lock. Reviews are restricted to verified buyers of completed orders, enforced at both the Java service and database layer."

### 1-Minute Introduction

> "Resellara is a second-hand marketplace for India, similar to OLX but with structured workflows. I built it using React 19 on the frontend and Spring Boot 4.1 with MySQL on the backend.
>
> The authentication system uses JWT tokens with email OTP verification during registration and password reset. The OTP is SHA-256 hashed before storage and expires in 5 minutes.
>
> The core business logic is the offer flow: a buyer submits a price offer on a product, and the seller can accept or reject it. When the seller accepts, the backend acquires a pessimistic write lock on the product row in MySQL to prevent another buyer from simultaneously claiming the same item. Competing pending offers are automatically declined with in-chat notifications sent to each buyer.
>
> Reviews can only be submitted by the verified buyer of a completed order, enforced with a Java service check and a database-level unique constraint on the `order_id` column of the reviews table."

### 2-Minute Introduction

> "Resellara is a full-stack second-hand marketplace that I designed and built from scratch to solve a real problem: existing platforms like OLX lack structured negotiation, verified reviews, and protection against race conditions during purchase.
>
> On the technology side, I used React 19 with Vite as the frontend, Spring Boot 4.1 as the REST API backend, and MySQL 8 as the database. Spring Security handles authentication and role-based authorization.
>
> The authentication flow uses JSON Web Tokens. When a user logs in, the server returns a signed JWT containing their ID, role, and name. Every subsequent API request includes this token in the `Authorization: Bearer` header. The frontend stores the token in `localStorage` and the Axios client attaches it automatically via a request interceptor.
>
> The most interesting technical problem was concurrent offer acceptance. If two buyers submit offers on the same product and the seller accidentally clicks 'Accept' twice, or two sellers interact simultaneously, the system must not double-reserve. I solved this by using `@Lock(LockModeType.PESSIMISTIC_WRITE)` in the Spring Data JPA repository. When a seller accepts an offer, the backend acquires an exclusive database lock on that product row inside a `@Transactional` method. Any competing transaction must wait, and by the time it gets the lock, it sees the product is already RESERVED and throws a `BadRequestException`.
>
> Reviews are another enforced business rule. The `ReviewService` checks that the order belongs to the authenticated buyer and has `COMPLETED` status. Even if those checks somehow passed, the database enforces a `UNIQUE` constraint on the `order_id` column of the `reviews` table, so a second insert would fail at the DB level.
>
> Going forward, I would add WebSocket-based real-time chat, image upload via cloud storage, and an admin moderation dashboard."
