# Database Documentation — Resellara

> **Navigation:** [README](README.md) · [Architecture](ARCHITECTURE.md) · [Backend](BACKEND.md) · [API](API_DOCUMENTATION.md) · [Setup](SETUP_AND_RUN.md)

---

## Database Overview

| Property | Value |
|----------|-------|
| Database Engine | MySQL Community Server 8.0.43 |
| Database Name | `sellara_db` |
| Host | `localhost` |
| Port | `3306` |
| Character Set | Default UTF-8 (MySQL 8 default) |
| Schema Management | Hibernate `ddl-auto=update` — tables are created/updated automatically on startup |
| Persistence | **Yes** — data survives application restart (MySQL is a persistent engine) |

**Connection string (from `application.properties`, without credentials):**
```
jdbc:mysql://localhost:3306/sellara_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
```

The `createDatabaseIfNotExist=true` parameter means the database `sellara_db` is created automatically if it does not exist.

---

## Tables and Entities

### `users`
**Entity:** [`User.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/entity/User.java)

| Column | Java Field | Type | Constraints |
|--------|-----------|------|------------|
| `id` | `id` | BIGINT | Primary Key, Auto Increment |
| `email` | `email` | VARCHAR | NOT NULL, UNIQUE |
| `password` | `password` | VARCHAR | NOT NULL (BCrypt hash) |
| `full_name` | `fullName` | VARCHAR | NOT NULL |
| `phone` | `phone` | VARCHAR | Nullable |
| `city` | `city` | VARCHAR | Nullable |
| `role` | `role` | VARCHAR (enum) | NOT NULL — `ROLE_BUYER`, `ROLE_SELLER`, `ROLE_ADMIN` |
| `created_at` | `createdAt` | DATETIME | NOT NULL, NOT UPDATABLE |

**Purpose:** Stores all registered users. The `role` column determines what each user can do.

---

### `categories`
**Entity:** [`Category.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/entity/Category.java)

| Column | Type | Constraints |
|--------|------|------------|
| `id` | BIGINT | Primary Key, Auto Increment |
| `name` | VARCHAR | NOT NULL |

**Purpose:** Product categories (e.g., Electronics, Furniture, Vehicles). Seeded by `DataInitializerService` on startup.

---

### `products`
**Entity:** [`Product.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/entity/Product.java)

| Column | Java Field | Type | Constraints |
|--------|-----------|------|------------|
| `id` | `id` | BIGINT | Primary Key, Auto Increment |
| `title` | `title` | VARCHAR | NOT NULL |
| `description` | `description` | TEXT | NOT NULL |
| `category_id` | `category` | BIGINT | FK → `categories.id`, NOT NULL |
| `item_condition` | `itemCondition` | VARCHAR (enum) | NOT NULL — `LIKE_NEW`, `EXCELLENT`, `GOOD`, `FAIR` |
| `price` | `price` | DECIMAL(12,2) | NOT NULL |
| `original_price` | `originalPrice` | DECIMAL(12,2) | Nullable |
| `image_url` | `imageUrl` | TEXT | Nullable |
| `location` | `location` | VARCHAR | NOT NULL |
| `state` | `state` | VARCHAR | Nullable |
| `district` | `district` | VARCHAR | Nullable |
| `city` | `city` | VARCHAR | Nullable |
| `pincode` | `pincode` | VARCHAR | Nullable |
| `status` | `status` | VARCHAR (enum) | NOT NULL, default `AVAILABLE` |
| `seller_id` | `seller` | BIGINT | FK → `users.id`, NOT NULL |
| `created_at` | `createdAt` | DATETIME | NOT NULL, NOT UPDATABLE |
| `updated_at` | `updatedAt` | DATETIME | Updated on change |

**Database Indexes:**
- `idx_product_state` on `state`
- `idx_product_city` on `city`

**Product Status Values:**

| Status | Meaning |
|--------|---------|
| `AVAILABLE` | Listed and open for offers |
| `RESERVED` | An offer has been accepted; item held for that buyer |
| `PENDING_SALE` | Intermediate state (enum exists; transitions may use it) |
| `SOLD` | Deal completed; item sold |

---

### `orders`
**Entity:** [`Order.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/entity/Order.java)

| Column | Java Field | Type | Constraints |
|--------|-----------|------|------------|
| `id` | `id` | BIGINT | Primary Key, Auto Increment |
| `buyer_id` | `buyer` | BIGINT | FK → `users.id`, NOT NULL |
| `product_id` | `product` | BIGINT | FK → `products.id`, NOT NULL |
| `offer_price` | `offerPrice` | DECIMAL(12,2) | NOT NULL |
| `delivery_address` | `deliveryAddress` | TEXT | NOT NULL |
| `contact_phone` | `contactPhone` | VARCHAR | NOT NULL |
| `notes` | `notes` | TEXT | Nullable |
| `status` | `status` | VARCHAR (enum) | NOT NULL, default `PENDING` |
| `created_at` | `createdAt` | DATETIME | NOT NULL, NOT UPDATABLE |
| `updated_at` | `updatedAt` | DATETIME | Updated on change |

**Order Status Values:**

| Status | Meaning |
|--------|---------|
| `PENDING` | Buyer submitted offer; waiting for seller decision |
| `ACCEPTED` | Seller accepted; product is now RESERVED |
| `REJECTED` | Seller declined (or competing offer auto-rejected) |
| `COMPLETED` | Deal done; product is now SOLD; review can be submitted |

---

### `conversations`
**Entity:** [`Conversation.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/entity/Conversation.java)

| Column | Type | Constraints |
|--------|------|------------|
| `id` | BIGINT | PK |
| `product_id` | BIGINT | FK → `products.id`, NOT NULL |
| `buyer_id` | BIGINT | FK → `users.id`, NOT NULL |
| `seller_id` | BIGINT | FK → `users.id`, NOT NULL |
| `created_at` | DATETIME | NOT NULL |
| `updated_at` | DATETIME | NOT NULL |

**Unique constraint:** `(product_id, buyer_id)` — One conversation per buyer per product.

---

### `chat_messages`
**Entity:** [`ChatMessage.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/entity/ChatMessage.java)

| Column | Type | Constraints |
|--------|------|------------|
| `id` | BIGINT | PK |
| `conversation_id` | BIGINT | FK → `conversations.id`, NOT NULL |
| `sender_id` | BIGINT | FK → `users.id`, NOT NULL |
| `content` | TEXT | NOT NULL |
| `created_at` | DATETIME | NOT NULL |
| `is_read` | BOOLEAN | NOT NULL, default false |

---

### `wishlist_items`
**Entity:** [`WishlistItem.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/entity/WishlistItem.java)

| Column | Type | Constraints |
|--------|------|------------|
| `id` | BIGINT | PK |
| `user_id` | BIGINT | FK → `users.id`, NOT NULL |
| `product_id` | BIGINT | FK → `products.id`, NOT NULL |
| `created_at` | DATETIME | NOT NULL |

**Unique constraint:** `(user_id, product_id)` — A user cannot wishlist the same product twice.

---

### `reviews`
**Entity:** [`Review.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/entity/Review.java)

| Column | Type | Constraints |
|--------|------|------------|
| `id` | BIGINT | PK |
| `order_id` | BIGINT | FK → `orders.id`, NOT NULL, **UNIQUE** |
| `buyer_id` | BIGINT | FK → `users.id`, NOT NULL |
| `seller_id` | BIGINT | FK → `users.id`, NOT NULL |
| `product_id` | BIGINT | FK → `products.id`, NOT NULL |
| `rating` | INT | NOT NULL, CHECK 1–5 |
| `comment` | TEXT | Nullable |
| `created_at` | DATETIME | NOT NULL |

**Unique constraint:** `uk_review_order` on `order_id` — **only one review per completed order at database level**.

**Database Indexes:**
- `idx_review_seller` on `seller_id`
- `idx_review_buyer` on `buyer_id`

---

### `email_otps`
**Entity:** [`EmailOtp.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/entity/EmailOtp.java)

| Column | Type | Constraints |
|--------|------|------------|
| `id` | BIGINT | PK |
| `email` | VARCHAR | NOT NULL |
| `hashed_otp` | VARCHAR | NOT NULL (SHA-256 of raw code) |
| `otp_type` | VARCHAR (enum) | NOT NULL |
| `created_at` | DATETIME | NOT NULL |
| `expires_at` | DATETIME | NOT NULL |
| `resend_available_at` | DATETIME | NOT NULL |
| `failed_attempts` | INT | NOT NULL, default 0 |
| `is_used` | BOOLEAN | NOT NULL, default false |

**Index:** `idx_otp_email_type` on `(email, otp_type)`.

**OtpType values:** `REGISTRATION`, `PASSWORD_RESET`, `LOGIN`  
Note: The code also uses `FORGOT_PASSWORD` in `AuthService.loginWithOtp` — this may be an internal variant.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    users {
        bigint id PK
        varchar email UK
        varchar password
        varchar full_name
        varchar phone
        varchar city
        varchar role
        datetime created_at
    }
    categories {
        bigint id PK
        varchar name
    }
    products {
        bigint id PK
        varchar title
        text description
        bigint category_id FK
        varchar item_condition
        decimal price
        decimal original_price
        text image_url
        varchar location
        varchar state
        varchar district
        varchar city
        varchar pincode
        varchar status
        bigint seller_id FK
        datetime created_at
        datetime updated_at
    }
    orders {
        bigint id PK
        bigint buyer_id FK
        bigint product_id FK
        decimal offer_price
        text delivery_address
        varchar contact_phone
        text notes
        varchar status
        datetime created_at
        datetime updated_at
    }
    conversations {
        bigint id PK
        bigint product_id FK
        bigint buyer_id FK
        bigint seller_id FK
        datetime created_at
        datetime updated_at
    }
    chat_messages {
        bigint id PK
        bigint conversation_id FK
        bigint sender_id FK
        text content
        boolean is_read
        datetime created_at
    }
    wishlist_items {
        bigint id PK
        bigint user_id FK
        bigint product_id FK
        datetime created_at
    }
    reviews {
        bigint id PK
        bigint order_id FK UK
        bigint buyer_id FK
        bigint seller_id FK
        bigint product_id FK
        int rating
        text comment
        datetime created_at
    }
    email_otps {
        bigint id PK
        varchar email
        varchar hashed_otp
        varchar otp_type
        datetime created_at
        datetime expires_at
        datetime resend_available_at
        int failed_attempts
        boolean is_used
    }

    users ||--o{ products : "sells (seller_id)"
    categories ||--o{ products : "categorizes"
    users ||--o{ orders : "places (buyer_id)"
    products ||--o{ orders : "receives offers"
    users ||--o{ conversations : "participates (buyer_id)"
    users ||--o{ conversations : "participates (seller_id)"
    products ||--o{ conversations : "topic"
    conversations ||--o{ chat_messages : "contains"
    users ||--o{ chat_messages : "sends (sender_id)"
    users ||--o{ wishlist_items : "saves"
    products ||--o{ wishlist_items : "saved in"
    orders ||--|| reviews : "reviewed by (UK)"
    users ||--o{ reviews : "writes (buyer_id)"
    users ||--o{ reviews : "receives (seller_id)"
    products ||--o{ reviews : "about"
```

---

## How Data Flows Through the Database

### New Product Listed
```sql
INSERT INTO products (title, description, category_id, item_condition, price,
  original_price, image_url, location, state, district, city, pincode,
  status, seller_id, created_at, updated_at)
VALUES (?, ?, ?, 'LIKE_NEW', ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?, NOW(), NOW());
```

### Offer Accepted (inside transaction with lock)
```sql
-- Pessimistic lock
SELECT * FROM products WHERE id = ? FOR UPDATE;

-- Product reserved
UPDATE products SET status = 'RESERVED', updated_at = NOW() WHERE id = ?;

-- Order accepted
UPDATE orders SET status = 'ACCEPTED', updated_at = NOW() WHERE id = ?;

-- Competing offers declined
UPDATE orders SET status = 'REJECTED', updated_at = NOW()
WHERE product_id = ? AND status = 'PENDING' AND id != ?;
```

### Deal Completed
```sql
UPDATE orders SET status = 'COMPLETED', updated_at = NOW() WHERE id = ?;
UPDATE products SET status = 'SOLD', updated_at = NOW() WHERE id = ?;
```

### Review Submitted
```sql
INSERT INTO reviews (order_id, buyer_id, seller_id, product_id, rating, comment, created_at)
VALUES (?, ?, ?, ?, ?, ?, NOW());
-- Fails with unique constraint violation if order_id already has a review
```

---

## Database Indexes and Constraints Summary

| Table | Index / Constraint | Columns | Purpose |
|-------|--------------------|---------|---------|
| `users` | UNIQUE | `email` | No duplicate accounts |
| `products` | INDEX `idx_product_state` | `state` | Fast location filtering |
| `products` | INDEX `idx_product_city` | `city` | Fast location filtering |
| `conversations` | UNIQUE | `product_id, buyer_id` | One chat thread per buyer per item |
| `wishlist_items` | UNIQUE | `user_id, product_id` | No duplicate wishlist entries |
| `reviews` | UNIQUE `uk_review_order` | `order_id` | One review per completed order |
| `reviews` | INDEX `idx_review_seller` | `seller_id` | Fast seller rating queries |
| `reviews` | INDEX `idx_review_buyer` | `buyer_id` | Fast buyer review queries |
| `email_otps` | INDEX `idx_otp_email_type` | `email, otp_type` | Fast OTP lookup during verification |

---

## Data Persistence

- MySQL stores data in its data directory on disk.
- `spring.jpa.hibernate.ddl-auto=update` means Hibernate will **alter tables** to match entity classes on startup, but will **never drop tables** or delete existing rows.
- Data is **fully preserved** across application restarts.
- Data is lost only if you manually drop tables or the MySQL data directory is deleted.

---

## Safe Local Database Setup

See [SETUP_AND_RUN.md](SETUP_AND_RUN.md) for step-by-step instructions.

**Backup your data (PowerShell):**
```powershell
# Dump all tables to a SQL file (replace USERNAME with your MySQL user)
mysqldump -u sellara_user -p sellara_db > sellara_backup.sql
```

**Restore from backup:**
```powershell
mysql -u sellara_user -p sellara_db < sellara_backup.sql
```

> **Important:** Never paste your MySQL password in documentation, chat, or version control. Use environment variables.
