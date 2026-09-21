# API Documentation — Resellara

> **Navigation:** [README](README.md) · [Architecture](ARCHITECTURE.md) · [Backend](BACKEND.md) · [Database](DATABASE.md) · [Workflows](WORKFLOWS.md)

All responses follow this wrapper:
```json
{ "success": true, "message": "...", "data": { ... } }
```
Errors return `"success": false` with an appropriate HTTP status code.

Base URL: `http://localhost:8080`  
All routes begin with `/api/`.

---

## Authentication (`/api/auth/**`)

All auth endpoints are **public** (no token required).

---

### POST `/api/auth/send-otp`

**Purpose:** Send a 6-digit OTP to an email address for registration or password reset.

**Request Body:**
```json
{ "email": "user@example.com", "otpType": "REGISTRATION" }
```
`otpType` values: `REGISTRATION`, `PASSWORD_RESET`, `LOGIN`

**Success (200):**
```json
{ "success": true, "message": "Verification code has been dispatched to your email address.", "data": null }
```

**Errors:**
- `400` — email already registered (for `REGISTRATION` type)
- `400` — resend cooldown not expired ("Please wait N seconds before requesting a new OTP.")

**Service:** `AuthService.sendOtp` → `EmailOtpService.sendOtp`  
**DB:** Inserts row into `email_otps`

---

### POST `/api/auth/verify-otp`

**Purpose:** Verify OTP without consuming it (e.g., live validation step in UI).

**Request Body:**
```json
{ "email": "user@example.com", "otp": "123456", "otpType": "REGISTRATION" }
```

**Success (200):**
```json
{ "success": true, "message": "Verification code verified successfully.", "data": { "verified": true } }
```

**Errors:**
- `400` — wrong OTP, expired, or locked (5 failed attempts)

**DB:** Increments `failed_attempts` on wrong OTP; does not mark as used.

---

### POST `/api/auth/register`

**Purpose:** Create a new user account. Requires prior OTP verification.

**Request Body:**
```json
{
  "email": "buyer@example.com",
  "password": "Secret@1",
  "confirmPassword": "Secret@1",
  "fullName": "Rohit Sharma",
  "phone": "9876543210",
  "city": "Mumbai",
  "role": "ROLE_BUYER",
  "otp": "123456"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "<JWT>",
    "type": "Bearer",
    "id": 1,
    "email": "buyer@example.com",
    "fullName": "Rohit Sharma",
    "role": "ROLE_BUYER",
    "city": "Mumbai",
    "phone": "9876543210"
  }
}
```

**Errors:**
- `400` — email already exists, passwords don't match, weak password, invalid OTP

**Service:** `AuthService.register`  
**DB:** Inserts `users` row; marks OTP as used

---

### POST `/api/auth/login`

**Purpose:** Password-based login.

**Request Body:**
```json
{ "email": "buyer@example.com", "password": "Secret@1" }
```

**Success (200):** Same shape as register response (with JWT token).

**Errors:**
- `401` — wrong email or password ("Invalid email or password.")

**Service:** `AuthService.login` → Spring `AuthenticationManager`  
**DB:** Reads `users` table

---

### POST `/api/auth/login-with-otp`

**Purpose:** Log in using a previously sent OTP (for "magic link" style login).

**Request Body:**
```json
{ "email": "user@example.com", "otp": "654321", "otpType": "LOGIN" }
```

**Success (200):** Same shape as login response.

**Errors:** `400` — OTP expired or wrong

---

### POST `/api/auth/reset-password`

**Purpose:** Reset forgotten password. Requires valid OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "789012",
  "newPassword": "NewPass@2",
  "confirmPassword": "NewPass@2"
}
```

**Success (200):** `{ "success": true, "message": "Your password has been reset successfully...", "data": null }`

**Errors:** `400` — OTP invalid/expired, passwords don't match, weak password

**DB:** Updates `users.password` (BCrypt hash)

---

### GET `/api/auth/me`

**Purpose:** Get current user's profile. **Requires authentication.**

**Headers:** `Authorization: Bearer <token>`

**Success (200):** Same shape as AuthResponse but `token` field is `null`.

**Errors:** `401` — no/invalid token

---

## Products (`/api/products/**`)

---

### GET `/api/products`

**Purpose:** Browse and search products. **Public.**

**Query Parameters (all optional):**
| Param | Type | Example |
|-------|------|---------|
| `query` | String | `laptop` |
| `categoryId` | Long | `3` |
| `condition` | Enum | `LIKE_NEW` / `EXCELLENT` / `GOOD` / `FAIR` |
| `minPrice` | BigDecimal | `500` |
| `maxPrice` | BigDecimal | `20000` |
| `state` | String | `Maharashtra` |
| `district` | String | `Pune` |
| `city` | String | `Pune` |

**Success (200):**
```json
{
  "success": true,
  "message": "Products retrieved",
  "data": [
    {
      "id": 5,
      "title": "iPhone 12 Pro",
      "description": "...",
      "category": { "id": 1, "name": "Mobile Phones" },
      "itemCondition": "EXCELLENT",
      "price": 45000.00,
      "originalPrice": 79000.00,
      "imageUrl": "https://...",
      "location": "Pune",
      "state": "Maharashtra",
      "district": "Pune",
      "city": "Pune",
      "pincode": "411001",
      "status": "AVAILABLE",
      "seller": { "id": 2, "fullName": "Ankit Patel", "city": "Pune" },
      "createdAt": "2026-09-15T12:30:00",
      "updatedAt": "2026-09-15T12:30:00"
    }
  ]
}
```

Only products with status `AVAILABLE` are returned.

**Service:** `ProductService.getAllProducts` → `ProductRepository.searchProducts`

---

### GET `/api/products/{id}`

**Purpose:** Get a single product by ID. **Public.**  
Returns any status (AVAILABLE, RESERVED, SOLD) — useful for viewing a product detail page.

**Success (200):** Single `ProductResponse` in `data`.

**Errors:** `404` — product not found

---

### POST `/api/products/price-suggestion`

**Purpose:** Calculate a suggested resale price. **Public.**

**Request Body:**
```json
{
  "originalPrice": 79000,
  "ageInMonths": 18,
  "itemCondition": "EXCELLENT",
  "categoryName": "Mobile Phones"
}
```

**Success (200):**
```json
{
  "data": {
    "minPrice": 41500.00,
    "maxPrice": 48500.00,
    "suggestedPrice": 44900.00,
    "depreciationPercent": 43,
    "explanation": "Estimated based on 18 months of usage...",
    "aiGenerated": false
  }
}
```

**Note:** `aiGenerated` is always `false` — calculation is rule-based, not AI.

---

### GET `/api/products/seller/my-listings`

**Purpose:** Get the current seller's own listings. **Requires `ROLE_SELLER`.**

**Headers:** `Authorization: Bearer <token>`

**Success (200):** Array of `ProductResponse` (all statuses).

---

### POST `/api/products/seller`

**Purpose:** Create a new product listing. **Requires `ROLE_SELLER`.**

**Request Body:**
```json
{
  "title": "Dell Laptop",
  "description": "Used 1 year, good condition",
  "categoryId": 2,
  "itemCondition": "GOOD",
  "price": 35000,
  "originalPrice": 65000,
  "imageUrl": "https://example.com/image.jpg",
  "location": "Bangalore",
  "state": "Karnataka",
  "district": "Bangalore Urban",
  "city": "Bangalore",
  "pincode": "560001"
}
```

**Success (200):** Created `ProductResponse` in `data`.

**Errors:** `400` — validation failures (missing title, price too low, etc.)

---

### PUT `/api/products/seller/{id}`

**Purpose:** Update an existing listing. **Requires `ROLE_SELLER` and ownership.**

Same request body as create. Service verifies `product.seller.id == sellerId`.

**Success (200):** Updated `ProductResponse`.

**Errors:** `403` if wrong seller; `404` if product not found.

---

### DELETE `/api/products/seller/{id}`

**Purpose:** Delete a listing. **Requires `ROLE_SELLER` and ownership.**

**Success (200):** `{ "data": null, "message": "Product deleted successfully" }`

---

### PATCH `/api/products/seller/{id}/status`

**Purpose:** Manually change a product's status. **Requires `ROLE_SELLER` and ownership.**

**Query Parameter:** `status=AVAILABLE` (or `RESERVED`, `SOLD`, etc.)

**Success (200):** Updated `ProductResponse`.

---

## Orders (`/api/orders/**`)

---

### POST `/api/orders`

**Purpose:** Place an offer on a product. **Requires authentication.**

**Request Body:**
```json
{
  "productId": 5,
  "offerPrice": 43000,
  "deliveryAddress": "123 Main Street, Andheri, Mumbai 400058",
  "contactPhone": "9876543210",
  "notes": "Can pickup on weekends"
}
```

**Success (200):**
```json
{
  "data": {
    "id": 12,
    "buyer": { "id": 1, "fullName": "Rohit Sharma" },
    "product": { "id": 5, "title": "iPhone 12 Pro" },
    "offerPrice": 43000.00,
    "deliveryAddress": "123 Main Street...",
    "contactPhone": "9876543210",
    "notes": "Can pickup on weekends",
    "status": "PENDING",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:**
- `400` — product not AVAILABLE ("This item is no longer available for offers or orders")
- `400` — buyer trying to order own product ("You cannot place an order on your own listing")
- `400` — validation failures

**DB:** Acquires pessimistic lock on `products` row; inserts `orders` row

---

### GET `/api/orders/buyer`

**Purpose:** Get all orders placed by the current buyer. **Requires authentication.**

**Success (200):** Array of `OrderResponse`, ordered by `createdAt` DESC.

---

### GET `/api/orders/seller`

**Purpose:** Get all incoming orders for the seller's products. **Requires `ROLE_SELLER`.**

**Success (200):** Array of `OrderResponse`, ordered by `createdAt` DESC.

---

### PATCH `/api/orders/{id}/status`

**Purpose:** Accept, reject, or complete an order. **Requires `ROLE_SELLER`.**

**Path Parameter:** `{id}` — order ID

**Request Body:**
```json
{ "status": "ACCEPTED" }
```
Valid values: `ACCEPTED`, `REJECTED`, `COMPLETED`

**What happens on each status:**

| New Status | Effect |
|-----------|--------|
| `ACCEPTED` | Product → `RESERVED`; competing PENDING orders → `REJECTED` with notifications |
| `COMPLETED` | Product → `SOLD`; buyer notified |
| `REJECTED` | If was ACCEPTED → product restored to `AVAILABLE`; else just declines the offer |

**Errors:**
- `400` — product not AVAILABLE (for ACCEPTED)
- `400` — order not ACCEPTED (for COMPLETED)
- `400` — not your order to update

---

## Chat (`/api/chat/**`)

All chat endpoints **require authentication.**

---

### POST `/api/chat/conversations?productId={id}`

**Purpose:** Get or create a conversation between current user and the product's seller.

**Query Parameter:** `productId` (required)

**Success (200):**
```json
{
  "data": {
    "id": 7,
    "product": { "id": 5, "title": "iPhone 12 Pro" },
    "buyer": { "id": 1, "fullName": "Rohit Sharma" },
    "seller": { "id": 2, "fullName": "Ankit Patel" },
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**DB:** Inserts into `conversations` if not exists (unique constraint on product+buyer).

---

### GET `/api/chat/conversations`

**Purpose:** List all conversations for the current user (as buyer or seller).

**Success (200):** Array of `ConversationResponse`.

---

### GET `/api/chat/conversations/{id}/messages`

**Purpose:** Get all messages in a conversation. Only the buyer or seller of that conversation can access it.

**Success (200):** Array of `ChatMessageResponse` with `{ id, sender, content, createdAt, read }`.

---

### POST `/api/chat/conversations/{id}/messages`

**Purpose:** Send a message in a conversation.

**Request Body:**
```json
{ "content": "Is the phone still available?" }
```

**Success (200):** The created `ChatMessageResponse`.

---

### GET `/api/chat/unread-count`

**Purpose:** Get total unread message count for current user.

**Success (200):**
```json
{ "data": { "unreadCount": 3 } }
```

---

## Wishlist (`/api/wishlist/**`)

All wishlist endpoints **require authentication.**

---

### GET `/api/wishlist`

**Purpose:** Get all wishlisted products for current user as full `ProductResponse` objects.

---

### GET `/api/wishlist/ids`

**Purpose:** Get just the product IDs that the current user has wishlisted (used by UI to show heart icon state).

**Success (200):** `{ "data": [5, 12, 23] }`

---

### POST `/api/wishlist/toggle/{productId}`

**Purpose:** Add product to wishlist if not present; remove if already present.

**Success (200):**
```json
{ "data": { "wishlisted": true, "productId": 5 }, "message": "Item added to wishlist" }
```

**DB:** Inserts or deletes from `wishlist_items`

---

## Reviews (`/api/reviews/**`)

---

### POST `/api/reviews`

**Purpose:** Submit a verified-purchase review. **Requires authentication.**

**Request Body:**
```json
{ "orderId": 12, "rating": 5, "comment": "Great seller, item as described!" }
```

**Success (200):**
```json
{
  "data": {
    "id": 3,
    "orderId": 12,
    "buyer": { "id": 1, "fullName": "Rohit Sharma" },
    "seller": { "id": 2, "fullName": "Ankit Patel" },
    "product": { "id": 5, "title": "iPhone 12 Pro" },
    "rating": 5,
    "comment": "Great seller...",
    "createdAt": "..."
  }
}
```

**Errors:**
- `403` — not the buyer of that order
- `400` — order not COMPLETED
- `400` — review already exists for this order
- `400` — rating not between 1 and 5

---

### GET `/api/reviews/seller/{sellerId}`

**Purpose:** Get a seller's rating summary and all their reviews. **Public.**

**Success (200):**
```json
{
  "data": {
    "sellerId": 2,
    "sellerName": "Ankit Patel",
    "averageRating": 4.7,
    "totalReviews": 8,
    "reviews": [ { ... }, { ... } ]
  }
}
```

---

### GET `/api/reviews/order/{orderId}`

**Purpose:** Get the review for a specific order (if any). **Requires authentication.** Only buyer or seller of that order can view.

**Success (200):** `ReviewResponse` or `null` in `data`.

---

## Categories (`/api/categories`)

### GET `/api/categories`

**Public.** Returns all categories.

```json
{ "data": [ { "id": 1, "name": "Mobile Phones" }, { "id": 2, "name": "Laptops" } ] }
```

---

## Locations (`/api/locations`)

### GET `/api/locations/search?q={query}`

**Public.** Search Indian cities/districts by partial name.

### GET `/api/locations/popular`

**Public.** Returns a list of popular Indian cities.
