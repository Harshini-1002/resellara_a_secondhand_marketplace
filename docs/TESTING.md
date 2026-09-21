# Testing — Resellara

> **Navigation:** [README](README.md) · [Backend](BACKEND.md) · [API](API_DOCUMENTATION.md) · [Setup](SETUP_AND_RUN.md)

---

## Existing Automated Tests

Only **one automated test file** exists in the project:

**File:** [`backend/src/test/java/com/sellara/SellaraBackendApplicationTests.java`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/backend/src/test/java/com/sellara/SellaraBackendApplicationTests.java)

```java
@SpringBootTest
class SellaraBackendApplicationTests {
    @Test
    void contextLoads() { }
}
```

**What this tests:** Verifies that the Spring Boot application context starts without throwing an exception (i.e., all beans, configuration, and database connection are valid).

**What this does NOT test:** Any business logic, API endpoints, service methods, or database operations.

### How to Run the Automated Test

```powershell
cd C:\Users\harsh\.gemini\antigravity\scratch\sellara\backend
.\mvnw.cmd test
```

> ⚠️ This test requires the application-h2 profile or a live MySQL connection. If MySQL is not running or credentials are not set, the test may fail on startup.

**No unit tests, integration tests, or frontend tests were found in the codebase.** All testing described below is manual.

---

## Manual Test Cases

The following tests are **suggested manual test cases** — they have not been automatically verified. Run them with the backend and frontend both running.

Use a REST client (browser, PowerShell `curl`, or Postman) to test the API directly where noted.

---

### Category A: Authentication Tests

**Test A1: Successful Registration**
1. Open `http://localhost:5173/register`.
2. Fill all fields with valid data; choose `ROLE_BUYER`.
3. Click "Send OTP" → verify OTP arrives in email.
4. Enter OTP and click "Register".
5. **Expected:** Redirect to home; toast "Welcome to Sellara!"; token stored in localStorage.

**Test A2: Registration with Wrong OTP**
1. Follow steps 1–3 from A1.
2. Enter wrong OTP and click "Register".
3. **Expected:** Error toast "Incorrect OTP. 4 attempts remaining."

**Test A3: Registration with Weak Password**
1. Try password `abc123` (no uppercase, no special char).
2. **Expected:** Error "Password must be at least 6 characters and include at least 1 uppercase..."

**Test A4: Duplicate Email Registration**
1. Register with email X successfully.
2. Try to register again with email X.
3. **Expected:** Error "An account with this email already exists."

**Test A5: Successful Login**
1. Log in with correct credentials.
2. **Expected:** JWT token in localStorage; user info visible in Navbar.

**Test A6: Wrong Password Login**
1. Log in with wrong password.
2. **Expected:** Error toast "Invalid email or password."

**Test A7: Token Expiry (Manual)**
1. Log in; note the token.
2. Decode JWT at [jwt.io](https://jwt.io) (do not share your secret).
3. Confirm `exp` field = login time + 86400 seconds (24 hours).

---

### Category B: Product Tests

**Test B1: Seller Creates a Listing**
1. Log in as `ROLE_SELLER`; go to `/seller`.
2. Click "New Listing" and fill all fields.
3. **Expected:** Product appears in seller dashboard with status `AVAILABLE`.

**Test B2: Listing Appears in Public Search**
1. After B1, go to home as a different user (or logged out).
2. Search for the product title.
3. **Expected:** Product card appears.

**Test B3: Seller Edits Listing**
1. Click Edit on a listing; change the title.
2. **Expected:** Updated title shown immediately.

**Test B4: Seller Deletes Listing**
1. Click Delete on a listing.
2. **Expected:** Product removed from dashboard and no longer visible in search.

**Test B5: Price Suggestion (No Auth Required)**
```powershell
curl -X POST http://localhost:8080/api/products/price-suggestion `
  -H "Content-Type: application/json" `
  -d '{"originalPrice":50000,"ageInMonths":12,"itemCondition":"GOOD","categoryName":"Mobile Phones"}'
```
**Expected:** JSON response with `suggestedPrice`, `minPrice`, `maxPrice`, and `explanation`.

---

### Category C: Offer and Concurrency Tests

**Test C1: Buyer Places an Offer**
1. Log in as a buyer; view an AVAILABLE product.
2. Click "Make Offer"; enter price, address, phone.
3. **Expected:** Toast "Order placed successfully"; order appears in `/orders`.

**Test C2: Buyer Cannot Order Own Product**
1. Log in as seller; view own product URL.
2. Manually call `POST /api/orders` with that product ID.
3. **Expected:** `400 "You cannot place an order on your own listing."`

**Test C3: Seller Accepts an Offer**
1. As seller, go to `/seller`; find incoming PENDING order.
2. Click "Accept".
3. **Expected:**
   - Order status → `ACCEPTED`.
   - Product status → `RESERVED`.
   - As buyer, check `/orders` → order shows `ACCEPTED`.
   - Chat shows automated message.

**Test C4: Competing Offers Auto-Rejected**
1. Create Product P.
2. Buyer 1 places offer → Order A (PENDING).
3. Buyer 2 places offer → Order B (PENDING).
4. Seller accepts Order A.
5. **Expected:** Order B status → `REJECTED`; Buyer 2 gets in-chat notification.

**Test C5: Offer on RESERVED Product Blocked**
1. After test C3, try to place a new offer on the same product.
2. **Expected:** `400 "This item is no longer available for offers or orders (Current status: RESERVED)."`

**Test C6: Simultaneous Acceptance (Concurrency Test)**
This is a manual concurrency test:
1. Create Product P with two PENDING orders.
2. Quickly send two PATCH requests to accept both orders simultaneously (use two browser tabs or Postman).
3. **Expected:** Only ONE acceptance succeeds; the other receives error "item is no longer available". Product ends up `RESERVED` with only one accepted order.

> Note: This relies on the `SELECT ... FOR UPDATE` pessimistic lock. Results should always be consistent.

---

### Category D: Cancellation and Recovery Tests

**Test D1: Cancel an Accepted Deal (Product Restored)**
1. After Test C3 (seller accepted, product is RESERVED).
2. Seller clicks "Cancel/Reject" on the ACCEPTED order.
3. **Expected:**
   - Order status → `REJECTED`.
   - Product status → `AVAILABLE` (restored!).
   - In-chat: "The reserved order has been CANCELLED. The item has been restored to AVAILABLE status."
   - New buyers can now place offers.

**Test D2: Reject a Pending Offer (Product Unchanged)**
1. Seller rejects a PENDING order that was never accepted.
2. **Expected:** Order → `REJECTED`; product remains `AVAILABLE`.

---

### Category E: Deal Completion Tests

**Test E1: Complete a Deal**
1. Seller clicks "Mark Complete" on an ACCEPTED order.
2. **Expected:**
   - Order → `COMPLETED`.
   - Product → `SOLD`.
   - In-chat: "✅ Purchase COMPLETED! You can now leave a verified review."
   - Buyer sees "Write Review" button in `/orders`.

**Test E2: Cannot Complete a Pending Order**
```powershell
# Attempt to mark a PENDING order as COMPLETED directly
curl -X PATCH http://localhost:8080/api/orders/{id}/status `
  -H "Authorization: Bearer <seller_token>" `
  -H "Content-Type: application/json" `
  -d '{"status":"COMPLETED"}'
```
**Expected:** `400 "Only an accepted/reserved order can be marked as completed."`

---

### Category F: Review Tests

**Test F1: Verified Buyer Submits Review**
1. After Test E1 (COMPLETED order).
2. Log in as the buyer.
3. Click "Write Review" in `/orders`; submit 5-star review.
4. **Expected:** Review saved; seller's rating updates on their product page.

**Test F2: Duplicate Review Blocked**
1. After Test F1, attempt to submit another review for the same order.
2. **Expected:** `400 "This order has already been reviewed. Only one review per order is permitted."`

**Test F3: Unauthorized Review (Wrong Buyer)**
1. Log in as a *different* buyer (not the one who completed the order).
2. Directly call `POST /api/reviews` with that order's ID.
3. **Expected:** `403 Forbidden "You are not authorized to review this order."`

**Test F4: Review on Non-Completed Order**
1. Try to submit a review for an order that is still `PENDING`.
2. **Expected:** `400 "Reviews can only be submitted for COMPLETED orders."`

---

### Category G: Database Persistence Tests

**Test G1: Data Survives Backend Restart**
1. Create a product and place an offer.
2. Stop the backend (Ctrl+C).
3. Restart backend (`run-backend.bat`).
4. Browse to the product — it should still exist with the same status.
5. **Expected:** All data persists (MySQL stores on disk).

**Test G2: Hibernate Does Not Drop Tables on Restart**
1. Check `spring.jpa.hibernate.ddl-auto=update` in `application.properties`.
2. Restart the backend.
3. **Expected:** No tables dropped; all data intact.

---

### Category H: Authorization Tests

**Test H1: Buyer Cannot Access Seller Routes**
```powershell
curl -X GET http://localhost:8080/api/orders/seller `
  -H "Authorization: Bearer <buyer_token>"
```
**Expected:** `403 Forbidden`

**Test H2: Unauthenticated Access to Protected Route**
```powershell
curl -X GET http://localhost:8080/api/orders/buyer
```
**Expected:** `401 Unauthorized`

**Test H3: Wrong Seller Cannot Edit Another Seller's Listing**
1. Log in as Seller A; note a product ID belonging to Seller B.
2. Try `PUT /api/products/seller/{seller_B_product_id}` with Seller A's token.
3. **Expected:** `400 "You do not own this listing"` or similar error.

---

## Test Coverage Summary

| Category | Automated Tests | Manual Tests Defined Above |
|----------|----------------|---------------------------|
| Context loads | ✅ (contextLoads test) | — |
| Authentication | ❌ None | A1–A7 |
| Product CRUD | ❌ None | B1–B5 |
| Offer placement | ❌ None | C1–C5 |
| Concurrency (locking) | ❌ None | C6 |
| Cancellation/recovery | ❌ None | D1–D2 |
| Deal completion | ❌ None | E1–E2 |
| Reviews | ❌ None | F1–F4 |
| Persistence | ❌ None | G1–G2 |
| Authorization | ❌ None | H1–H3 |

> **Recommendation:** The most important tests to automate are the concurrency test (C6), the review authorization test (F3), and the product status lifecycle tests (E, D). These are the most critical correctness properties of the system.
