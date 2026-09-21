# Backend Documentation — Resellara

> **Navigation:** [README](README.md) · [Architecture](ARCHITECTURE.md) · [Frontend](FRONTEND.md) · [Database](DATABASE.md) · [API](API_DOCUMENTATION.md) · [Security](SECURITY.md) · [Setup](SETUP_AND_RUN.md)

---

## Versions (Verified from `pom.xml`)

| Technology | Version |
|------------|---------|
| Java (target bytecode) | 21 |
| Spring Boot | 4.1.1 |
| Hibernate | 7.4.5 (via Spring Boot BOM) |
| MySQL Connector/J | 8.0.43 |
| JJWT | 0.12.x (via Spring Boot BOM) |

---

## Maven Configuration (`pom.xml`)

Maven is the build tool and dependency manager. The project uses a **Maven Wrapper** (`mvnw.cmd`) so you do not need Maven installed globally.

**Key dependencies (verified):**

| Dependency | Artifact ID | Purpose |
|-----------|-------------|---------|
| Spring Boot Web MVC | `spring-boot-starter-webmvc` | REST controllers, JSON serialization |
| Spring Boot Data JPA | `spring-boot-starter-data-jpa` | ORM / Hibernate |
| Spring Boot Security | `spring-boot-starter-security` | Authentication and authorization |
| Spring Boot Validation | `spring-boot-starter-validation` | `@NotBlank`, `@Valid`, etc. |
| Spring Boot Mail | `spring-boot-starter-mail` | Sending OTP emails |
| MySQL Connector | `mysql-connector-j` | JDBC driver (runtime only) |
| H2 Database | `com.h2database:h2` | In-memory DB for tests (runtime) |
| JJWT | (included via parent) | JWT creation and validation |

---

## Application Entry Point

**File:** [`SellaraBackendApplication.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/SellaraBackendApplication.java)

```java
@SpringBootApplication
public class SellaraBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SellaraBackendApplication.class, args);
    }
}
```

`@SpringBootApplication` enables:
- Component scanning (finds all `@Component`, `@Service`, `@Repository`, `@Controller`)
- Auto-configuration (sets up database, security, mail based on `application.properties`)
- `@EnableAutoConfiguration`

---

## Package and Folder Structure

```
com/sellara/
├── SellaraBackendApplication.java  ← main class
├── config/        SecurityConfig.java
├── controller/    8 controller classes
├── service/       11 service classes
├── repository/    9 repository interfaces
├── entity/        9 entity classes + 5 enum classes
├── dto/           Request and response DTOs
├── security/      JWT filter, provider, UserPrincipal
└── exception/     Custom exceptions + GlobalExceptionHandler
```

---

## Dependency Injection

Spring Boot uses **constructor injection** throughout this project. This means each class declares its dependencies as constructor parameters, and Spring automatically provides them.

**Example from `OrderService`:**
```java
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository, ...) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }
}
```

Spring scans for classes annotated with `@Service`, `@Repository`, `@Controller`, or `@Component` and wires them together automatically. No manual `new` keyword needed.

---

## Controllers

Controllers handle HTTP requests and return responses. They are annotated with `@RestController` and contain no business logic — they only receive input, call the service, and return the result.

### `AuthController` — `/api/auth/**`
**File:** [`AuthController.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/controller/AuthController.java)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/send-otp` | Sends OTP email for registration/reset |
| POST | `/api/auth/verify-otp` | Verifies OTP without consuming it |
| POST | `/api/auth/register` | Creates account (requires valid OTP) |
| POST | `/api/auth/login` | Password-based login |
| POST | `/api/auth/login-with-otp` | OTP-based login |
| POST | `/api/auth/reset-password` | Resets password (requires valid OTP) |
| GET  | `/api/auth/me` | Returns current user profile |

### `ProductController` — `/api/products/**`
**File:** [`ProductController.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/controller/ProductController.java)

| Method | Path | Role |
|--------|------|------|
| GET | `/api/products` | Public — multi-param search |
| GET | `/api/products/{id}` | Public — single product |
| POST | `/api/products/price-suggestion` | Public — price calculator |
| GET | `/api/products/seller/my-listings` | `ROLE_SELLER` |
| POST | `/api/products/seller` | `ROLE_SELLER` — create listing |
| PUT | `/api/products/seller/{id}` | `ROLE_SELLER` — edit listing |
| DELETE | `/api/products/seller/{id}` | `ROLE_SELLER` — delete listing |
| PATCH | `/api/products/seller/{id}/status` | `ROLE_SELLER` — change status |

### `OrderController` — `/api/orders/**`
**File:** [`OrderController.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/controller/OrderController.java)

| Method | Path | Role |
|--------|------|------|
| POST | `/api/orders` | Authenticated — place offer |
| GET | `/api/orders/buyer` | Authenticated — buyer's orders |
| GET | `/api/orders/seller` | `ROLE_SELLER` — incoming offers |
| PATCH | `/api/orders/{id}/status` | `ROLE_SELLER` — accept/reject/complete |

### `ChatController` — `/api/chat/**`
**File:** [`ChatController.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/controller/ChatController.java)

| Method | Path |
|--------|------|
| POST | `/api/chat/conversations?productId=` |
| GET | `/api/chat/conversations` |
| GET | `/api/chat/conversations/{id}/messages` |
| POST | `/api/chat/conversations/{id}/messages` |
| GET | `/api/chat/unread-count` |

### `WishlistController` — `/api/wishlist/**`
**File:** [`WishlistController.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/controller/WishlistController.java)

| Method | Path |
|--------|------|
| GET | `/api/wishlist` |
| GET | `/api/wishlist/ids` |
| POST | `/api/wishlist/toggle/{productId}` |

### `ReviewController` — `/api/reviews/**`
**File:** [`ReviewController.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/controller/ReviewController.java)

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/reviews` | Authenticated |
| GET | `/api/reviews/seller/{sellerId}` | Public |
| GET | `/api/reviews/order/{orderId}` | Authenticated (buyer or seller of that order) |

### `CategoryController` — `/api/categories`
Public. Returns all product categories.

### `LocationController` — `/api/locations`
Public. `GET /api/locations/search?q=` and `GET /api/locations/popular`.

---

## Services

Services contain the real business logic. Every method that changes data is wrapped in `@Transactional`.

### `AuthService`
**File:** [`AuthService.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/service/AuthService.java)

Key methods:
- `register(RegisterRequest)` — validates OTP, checks email uniqueness, BCrypt-hashes password, saves User, returns JWT.
- `login(LoginRequest)` — uses Spring Security `AuthenticationManager` to verify credentials, generates JWT.
- `loginWithOtp(OtpVerifyRequest)` — verifies `FORGOT_PASSWORD` OTP, finds user, generates JWT.
- `resetPassword(PasswordResetRequest)` — verifies OTP, validates new password, BCrypt-hashes and saves.
- `validatePassword(password)` — regex check: min 6 chars, uppercase + lowercase + digit + special character.

### `OrderService`
**File:** [`OrderService.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/service/OrderService.java)

Key methods:
- `createOrder(buyerId, req)` — acquires pessimistic lock on product; checks `AVAILABLE`; prevents self-purchase; saves Order with `PENDING` status.
- `updateOrderStatus(sellerId, orderId, newStatus)` — verifies seller ownership; acquires pessimistic lock; handles ACCEPTED / COMPLETED / REJECTED transitions with product status changes and in-chat notifications.
- `sendNotificationChat(product, buyer, seller, content)` — private helper that finds or creates a Conversation and saves a ChatMessage from the seller's account.

**Critical logic — ACCEPTED transition:**
```
1. product.status must be AVAILABLE → else throw BadRequestException
2. order.status = ACCEPTED
3. product.status = RESERVED
4. All other PENDING orders for same product → REJECTED + notification
5. Winning buyer gets: "🎉 Your offer has been ACCEPTED!"
```

**COMPLETED transition:**
```
1. order.status must be ACCEPTED → else throw BadRequestException
2. order.status = COMPLETED
3. product.status = SOLD
4. Buyer gets: "✅ Purchase COMPLETED! You can now leave a verified review."
```

**REJECTED transition (cancellation of an accepted deal):**
```
1. If previousStatus was ACCEPTED and product is RESERVED or PENDING_SALE:
   → product.status = AVAILABLE  (restoration!)
   → notification: "Item has been restored to AVAILABLE"
2. Otherwise (declining a pending offer):
   → notification: "Your offer was declined by the seller."
```

### `ReviewService`
**File:** [`ReviewService.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/service/ReviewService.java)

`createReview(buyerId, req)` enforces:
1. `order.buyer.id == buyerId` — correct buyer
2. `order.status == COMPLETED` — completed deal
3. `!reviewRepository.existsByOrderId(orderId)` — no existing review
4. Rating between 1–5

`getSellerRatingSummary(sellerId)` — returns `AVG(rating)`, total count, and list of reviews.

### `EmailOtpService`
**File:** [`EmailOtpService.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/service/EmailOtpService.java)

- Generates 6-digit random OTP using `SecureRandom`.
- SHA-256 hashes the raw OTP before saving to DB (only the hash is stored).
- OTP expires in **5 minutes**; resend cooldown is **60 seconds**.
- Maximum **5 failed attempts** before the OTP is locked.
- `verifyOtp(..., markUsed=true)` — marks OTP as used so it cannot be reused.

### `PriceSuggestionService`
**File:** [`PriceSuggestionService.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/service/PriceSuggestionService.java)

Calculates suggested resale price using a **rule-based depreciation model** (no AI/Gemini API is actually called in the current implementation — `geminiApiKey` is read but not used). The algorithm:
1. Looks up annual depreciation rate by category keyword (e.g., mobile → 25%, furniture → 12%).
2. Applies compound monthly decay: `ageFactor = (1 - monthlyRate)^ageMonths`; floor at 20% residual value.
3. Applies condition multiplier: LIKE_NEW = 0.95, EXCELLENT = 0.85, GOOD = 0.72, FAIR = 0.55.
4. Returns min, mid, and max price rounded to nearest ₹50.

### `ProductService`, `ChatService`, `WishlistService`, `LocationService`, `DataInitializerService`
Standard CRUD services. `DataInitializerService` seeds the database with categories on first startup if none exist.

---

## Repositories

Repositories are Java interfaces that extend `JpaRepository<Entity, ID>`. Spring Data JPA automatically generates the SQL queries.

### `ProductRepository`
**File:** [`ProductRepository.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/repository/ProductRepository.java)

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT p FROM Product p WHERE p.id = :id")
Optional<Product> findByIdWithPessimisticLock(@Param("id") Long id);
```
This generates `SELECT ... FOR UPDATE` — an exclusive row lock in MySQL.

The `searchProducts(...)` JPQL query uses `LOWER(CONCAT('%', :query, '%'))` for case-insensitive substring search across title, description, and location.

### `ReviewRepository`
```java
boolean existsByOrderId(Long orderId);
@Query("SELECT AVG(r.rating) FROM Review r WHERE r.seller.id = :sellerId")
Double getAverageRatingBySellerId(@Param("sellerId") Long sellerId);
```

### `OrderRepository`
```java
List<Order> findByProductIdAndStatusAndIdNot(Long productId, OrderStatus status, Long orderId);
// Used to find all PENDING orders for a product EXCEPT the just-accepted one
```

---

## Entities

JPA entities are Java classes annotated with `@Entity`. Each maps to a database table.

| Entity | Table | Key Fields |
|--------|-------|-----------|
| `User` | `users` | `id`, `email` (unique), `password` (BCrypt), `fullName`, `phone`, `city`, `role` |
| `Product` | `products` | `id`, `title`, `description`, `category`, `itemCondition`, `price`, `originalPrice`, `imageUrl`, `location`, `state`, `district`, `city`, `pincode`, `status`, `seller` |
| `Order` | `orders` | `id`, `buyer`, `product`, `offerPrice`, `deliveryAddress`, `contactPhone`, `notes`, `status` |
| `Conversation` | `conversations` | `id`, `product`, `buyer`, `seller` (unique: product+buyer) |
| `ChatMessage` | `chat_messages` | `id`, `conversation`, `sender`, `content` |
| `WishlistItem` | `wishlist_items` | `id`, `user`, `product` (unique: user+product) |
| `Review` | `reviews` | `id`, `order` (unique), `buyer`, `seller`, `product`, `rating`, `comment` |
| `EmailOtp` | `email_otps` | `id`, `email`, `hashedOtp`, `otpType`, `expiresAt`, `resendAvailableAt`, `failedAttempts`, `used` |
| `Category` | `categories` | `id`, `name` |

**Enums stored as strings in MySQL:**
- `Role`: `ROLE_BUYER`, `ROLE_SELLER`, `ROLE_ADMIN`
- `ProductStatus`: `AVAILABLE`, `RESERVED`, `PENDING_SALE`, `SOLD`
- `OrderStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`
- `Condition`: `LIKE_NEW`, `EXCELLENT`, `GOOD`, `FAIR`
- `OtpType`: `REGISTRATION`, `PASSWORD_RESET`, `LOGIN` (note: `FORGOT_PASSWORD` is also used internally — see `AuthService.loginWithOtp`)

---

## DTOs (Data Transfer Objects)

DTOs prevent exposing internal entity structure in API responses. They are plain Java classes used for:
- **Request DTOs**: incoming JSON body (`RegisterRequest`, `OrderCreateRequest`, etc.)
- **Response DTOs**: outgoing JSON body (`AuthResponse`, `ProductResponse`, etc.)

### Key Request DTOs

**`RegisterRequest`:** `email`, `password`, `confirmPassword`, `fullName`, `phone`, `city`, `role`, `otp`

**`LoginRequest`:** `email`, `password`

**`ProductCreateRequest`:** `title`, `description`, `categoryId`, `itemCondition`, `price`, `originalPrice`, `imageUrl`, `location`, `state`, `district`, `city`, `pincode`

**`OrderCreateRequest`:** `productId`, `offerPrice`, `deliveryAddress`, `contactPhone`, `notes`

**`ReviewCreateRequest`:** `orderId`, `rating`, `comment`

### `ApiResponse<T>` — Common wrapper
**File:** [`dto/common/ApiResponse.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/dto/common/ApiResponse.java)

Every API response is wrapped:
```json
{
  "success": true,
  "message": "Product listed successfully",
  "data": { ... }
}
```

---

## Validation and Exception Handling

### Validation
- DTOs use **Jakarta Validation** annotations: `@NotBlank`, `@NotNull`, `@DecimalMin`, `@Min`, `@Max`.
- Controllers annotate parameters with `@Valid` to trigger validation.
- Validation failures throw `MethodArgumentNotValidException`.

### Exception Classes
| Class | HTTP Status |
|-------|-------------|
| `ResourceNotFoundException` | 404 Not Found |
| `BadRequestException` | 400 Bad Request |
| `BadCredentialsException` (Spring) | 401 Unauthorized |
| `AccessDeniedException` (Spring) | 403 Forbidden |
| `MethodArgumentNotValidException` | 400 (field errors) |
| `Exception` (catch-all) | 500 Internal Server Error |

**`GlobalExceptionHandler`** (`@RestControllerAdvice`) intercepts all exceptions thrown from controllers and maps them to consistent JSON `ApiResponse` bodies.

---

## Spring Security and JWT

See [SECURITY.md](SECURITY.md) for full detail. In brief:

1. **`SecurityConfig`** — defines which routes are public/protected, disables CSRF, configures CORS, sets session as STATELESS.
2. **`JwtAuthenticationFilter`** — runs before every request; extracts `Bearer` token from `Authorization` header; validates it; sets `SecurityContextHolder`.
3. **`JwtTokenProvider`** — creates tokens (HMAC-SHA, 24h expiry) and validates them.
4. **`UserDetailsServiceImpl`** — loads `User` from DB by email; returns `UserPrincipal`.
5. **`BCryptPasswordEncoder`** — hashes passwords at registration; verifies at login.

---

## Running the Backend

```powershell
# From project root:
run-backend.bat

# Or manually:
cd C:\Users\harsh\.gemini\antigravity\scratch\sellara\backend
set DB_USERNAME=sellara_user
set DB_PASSWORD=<your_password>
.\mvnw.cmd spring-boot:run
```

The backend runs on **`http://localhost:8080`**. On first startup, Hibernate creates all tables automatically (`spring.jpa.hibernate.ddl-auto=update`).

---

## How Layers Communicate

```
HTTP Request
    ↓
@RestController (validates @Valid, extracts @AuthenticationPrincipal)
    ↓  calls
@Service (business logic, @Transactional)
    ↓  calls
@Repository (database queries, pessimistic locks)
    ↓  executes SQL via Hibernate
MySQL Database
    ↑  returns entity
@Service  ← maps entity to DTO
    ↑  returns DTO
@RestController ← wraps in ApiResponse
    ↑  serializes to JSON
HTTP Response
```
