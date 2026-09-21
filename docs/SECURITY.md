# Security Documentation — Resellara

> **Navigation:** [README](README.md) · [Architecture](ARCHITECTURE.md) · [Backend](BACKEND.md) · [Setup](SETUP_AND_RUN.md)

---

## Authentication vs Authorization

These are two different concepts that are often confused.

| Concept | Question It Answers | Implementation |
|---------|--------------------|--------------------|
| **Authentication** | "Who are you?" | JWT token + BCrypt password verification |
| **Authorization** | "Are you allowed to do this?" | Spring Security roles + ownership checks |

---

## JWT (JSON Web Token) — How It Works

### What is a JWT?

A JWT is a string with three base64-encoded parts separated by dots:
```
header.payload.signature
```

**Header:** Algorithm type (HMAC-SHA256)  
**Payload (claims):** User data embedded in the token  
**Signature:** Hash of header+payload using a secret key — prevents tampering

### JWT Claims in Resellara

From [`JwtTokenProvider.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/security/JwtTokenProvider.java):

```java
Jwts.builder()
    .subject(userPrincipal.getUsername())   // email
    .claim("id", userPrincipal.getId())     // user ID
    .claim("role", userPrincipal.getRole()) // ROLE_BUYER or ROLE_SELLER
    .claim("name", userPrincipal.getFullName())
    .issuedAt(now)
    .expiration(expiryDate)                 // now + 86400000ms = 24 hours
    .signWith(getSigningKey())              // HMAC-SHA key from secret
    .compact();
```

### JWT Secret

Configured in `application.properties`:
```
sellara.jwt.secret=<64-character hex string>
sellara.jwt.expiration-ms=86400000
```

> ⚠️ **Security Note:** The JWT secret is hardcoded as a default value in `application.properties`. In production, this must be set via an environment variable or secrets manager. Anyone who has this secret can forge tokens.

### JWT Lifecycle

```
1. User logs in → POST /api/auth/login
2. Backend generates token → signed with secret key
3. Token returned to frontend in response body
4. Frontend stores in localStorage as 'sellara_token'
5. Every request → Axios interceptor adds "Authorization: Bearer <token>"
6. JwtAuthenticationFilter validates token signature and expiry
7. If valid → UserDetailsServiceImpl loads user from DB
8. SecurityContextHolder holds the authenticated user for this request
9. After 24 hours → token expires → 401 Unauthorized → frontend clears localStorage
```

### Token Validation Code

From [`JwtAuthenticationFilter.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/security/JwtAuthenticationFilter.java):

```java
if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
    String username = tokenProvider.getUsernameFromJWT(jwt);
    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
    UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    SecurityContextHolder.getContext().setAuthentication(authentication);
}
```

**Key point:** The token is validated on *every request* — no session is stored on the server (stateless).

---

## Password Hashing with BCrypt

### What is BCrypt?

BCrypt is a password hashing algorithm that is intentionally slow (to resist brute-force attacks). It automatically includes a **salt** (random data) to prevent rainbow table attacks.

### How It's Used

**At registration** ([`AuthService.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/service/AuthService.java)):
```java
passwordEncoder.encode(request.getPassword())
// e.g., "Secret@1" → "$2a$10$hashed_result..."
```

**At login:**
```java
authenticationManager.authenticate(
    new UsernamePasswordAuthenticationToken(email, rawPassword)
)
// Spring Security calls passwordEncoder.matches(rawPassword, storedHash)
```

The raw password is never stored anywhere.

### Password Strength Validation

From `AuthService.validatePassword`:
```java
Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#^()_+...]).{6,}$")
```
Requires: at least 6 characters, one uppercase, one lowercase, one digit, one special character.

---

## Role-Based Authorization

### Roles

| Role | Stored As | Authorities |
|------|-----------|-------------|
| Buyer | `ROLE_BUYER` | Can create orders, wishlist, reviews |
| Seller | `ROLE_SELLER` | Can manage products, view/update orders |
| Admin | `ROLE_ADMIN` | Enum exists; no routes implemented |

### Route-Level Protection (Security Config)

From [`SecurityConfig.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/config/SecurityConfig.java):

```java
.requestMatchers("/api/products/seller/**").hasAuthority("ROLE_SELLER")
.anyRequest().authenticated()
```

### Method-Level Protection

```java
@PreAuthorize("hasAuthority('ROLE_SELLER')")
public ResponseEntity<?> createProduct(...) { ... }
```

### Ownership Checks (Service Layer)

Beyond role checks, the service layer verifies ownership:

**Product ownership** (`ProductService`):
```java
if (!product.getSeller().getId().equals(sellerId)) {
    throw new BadRequestException("You do not own this listing.");
}
```

**Order ownership** (`OrderService`):
```java
if (!order.getProduct().getSeller().getId().equals(sellerId)) {
    throw new BadRequestException("You are not authorized to update this order.");
}
```

**Review ownership** (`ReviewService`):
```java
if (!order.getBuyer().getId().equals(buyerId)) {
    throw new AccessDeniedException("Only the verified buyer can review.");
}
```

---

## CORS Configuration

**What is CORS?**  
Cross-Origin Resource Sharing. Browsers block JavaScript from calling APIs on a different domain/port unless the server explicitly allows it. Our React app runs on `:5173` and the API is on `:8080` — different ports = different origins.

From [`SecurityConfig.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/config/SecurityConfig.java):

```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173"
));
configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
configuration.setAllowedHeaders(Arrays.asList("Authorization","Content-Type","X-Requested-With","Accept"));
configuration.setAllowCredentials(true);
configuration.setMaxAge(3600L);  // 1-hour preflight cache
```

> ⚠️ **Security Note:** In production, `allowedOrigins` must be updated to only the actual production frontend domain. `"http://localhost:5173"` should not be allowed in production.

---

## CSRF — Why It's Disabled

CSRF (Cross-Site Request Forgery) is a browser-level attack. It is mitigated in this application by:
1. The API is **stateless** — no cookies, no session.
2. All authenticated requests require a `Bearer` token in the `Authorization` header.
3. JavaScript on a malicious site cannot read `localStorage` from another origin.

Therefore, CSRF protection is safely disabled for the REST API:
```java
.csrf(csrf -> csrf.disable())
```

> **Note:** CSRF protection should NOT be disabled if the application uses cookie-based sessions. Since this app is JWT-based and stateless, disabling is correct.

---

## OTP Security

From [`EmailOtpService.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/main/java/com/sellara/service/EmailOtpService.java):

| Security Measure | Implementation |
|-----------------|----------------|
| Random generation | `SecureRandom.nextInt(900000) + 100000` — cryptographically random |
| No raw storage | OTP hashed with `SHA-256` before saving to DB |
| Expiry | 5 minutes (`expiresAt = createdAt + 5 minutes`) |
| Resend cooldown | 60 seconds between resend requests |
| Failed attempt lockout | OTP locked after 5 wrong attempts |
| One-time use | `is_used` flag set to `true` after successful verification |

---

## Input Validation

| Layer | Mechanism | Example |
|-------|-----------|---------|
| Frontend | Component state checks | Empty field check before submit |
| DTO (Java) | Jakarta Validation annotations | `@NotBlank`, `@DecimalMin("1.0")` |
| Controller | `@Valid` annotation | Triggers DTO validation |
| Service | Business rule checks | `order.status == COMPLETED` check |
| Database | Constraints | `NOT NULL`, `UNIQUE`, `DECIMAL(12,2)` |

---

## Secret and Environment Variable Configuration

| Secret | How Configured |
|--------|---------------|
| DB username | `DB_USERNAME` Windows user environment variable |
| DB password | `DB_PASSWORD` Windows user environment variable |
| JWT secret | In `application.properties` (default hardcoded — should be moved to env var) |
| SMTP username | `RESELLARA_SMTP_USERNAME` env var (has default in properties) |
| SMTP password | `RESELLARA_SMTP_PASSWORD` env var |

From `application.properties`:
```properties
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:}
spring.mail.username=${RESELLARA_SMTP_USERNAME:default@gmail.com}
spring.mail.password=${RESELLARA_SMTP_PASSWORD:}
```

> **Never commit actual secrets to version control.**

---

## Security Risks and Missing Protections

The following issues were identified by inspecting the codebase. These are honest findings:

| Risk | Severity | Finding |
|------|----------|---------|
| JWT secret hardcoded as default | 🔴 High | `JwtTokenProvider.java` has `@Value("${sellara.jwt.secret:9a3f...}")` — the default is a real key visible in the source code. Anyone with source access can forge tokens if the env var is not overridden. |
| No token blacklist/revocation | 🟡 Medium | Logout is client-only. If a token is stolen, it remains valid for up to 24 hours. No server-side invalidation. |
| `localStorage` token storage | 🟡 Medium | Tokens in `localStorage` are accessible to JavaScript on the same origin. XSS attacks could steal them. HttpOnly cookies would be safer. |
| No rate limiting on OTP endpoints | 🟡 Medium | While OTP resend has a 60-second cooldown, there is no IP-level rate limiting. |
| No HTTPS enforced | 🟡 Medium | The application runs on HTTP locally. In production, HTTPS is essential. |
| SMTP password in env var only | ✅ OK | Not hardcoded; requires `RESELLARA_SMTP_PASSWORD` to be set. |
| No input sanitization against XSS | 🟡 Medium | Product descriptions are stored as-is. If rendered as HTML (not plain text), XSS is possible. React escapes JSX by default, which mitigates most cases. |
| No image upload validation | 🟡 Medium | `imageUrl` is a user-provided text URL — no validation that it points to an actual image. |
| Admin role has no endpoints | ℹ️ Info | `ROLE_ADMIN` exists but has no protected routes. Cannot exploit what doesn't exist, but no admin functions are available. |
