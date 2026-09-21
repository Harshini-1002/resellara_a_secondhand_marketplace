# Frontend Documentation — Resellara

> **Navigation:** [README](README.md) · [Architecture](ARCHITECTURE.md) · [Backend](BACKEND.md) · [API](API_DOCUMENTATION.md) · [Setup](SETUP_AND_RUN.md)

---

## React and Vite Setup

**Verified from `frontend/package.json`:**

| Tool | Version |
|------|---------|
| React | 19.2.8 |
| React DOM | 19.2.8 |
| Vite | 8.3.0 |
| @vitejs/plugin-react | 6.1.1 |

React is the UI library — it lets you write the UI as composable pieces called **components**. Vite is the build tool and development server — it starts the app in milliseconds and automatically reloads the browser when you save a file.

---

## Full Dependencies (from `package.json`)

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `axios` | ^1.20.0 | HTTP client for calling the Spring Boot API |
| `lucide-react` | ^1.46.0 | SVG icon library |
| `react` | ^19.2.8 | UI component library |
| `react-dom` | ^19.2.8 | Renders React components into the browser DOM |
| `react-hot-toast` | ^2.6.0 | Toast popup notifications |
| `react-router-dom` | ^7.18.4 | Client-side page routing |
| `tailwindcss` | ^3.4.19 | CSS utility classes for styling |
| `autoprefixer` | ^10.6.1 | PostCSS plugin for CSS vendor prefixes |
| `postcss` | ^8.5.28 | CSS transformation tool (required by Tailwind) |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/react` | ^19.2.18 | TypeScript definitions (for IDE hints even in JS) |
| `@types/react-dom` | ^19.2.7 | TypeScript definitions |
| `oxlint` | ^1.81.0 | Extremely fast JavaScript linter |
| `vite` | ^8.3.0 | Dev server and bundler |

---

## Entry Point and Application Rendering

**File:** [`frontend/src/main.jsx`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/frontend/src/main.jsx)

This is where the browser starts. It imports `App` and mounts it into the `<div id="root">` in `index.html`.

**File:** [`frontend/src/App.jsx`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/frontend/src/App.jsx)

`App.jsx` is the root component. It:
1. Wraps the entire app in `<BrowserRouter>` (enables URL-based routing).
2. Wraps in `<AuthProvider>` → `<WishlistProvider>` → `<ChatProvider>` (global state contexts).
3. Configures `<Toaster>` (react-hot-toast settings — dark theme, 3.5s duration).
4. Renders `<AppContent>` which contains:
   - `<Navbar>` at the top
   - `<Routes>` defining all URL paths
   - `<ChatDrawer>` (always mounted; hides itself when not open)
   - `<Footer>` at the bottom

---

## Routing and Pages

Routes are defined in `App.jsx` using React Router v7:

| Path | Component | Auth Required | Role Required |
|------|-----------|---------------|---------------|
| `/` | `HomePage` | No | — |
| `/products/:id` | `ProductDetailsPage` | No | — |
| `/login` | `LoginPage` | No | — |
| `/register` | `RegisterPage` | No | — |
| `/seller` | `SellerDashboardPage` | ✅ Yes | `ROLE_SELLER` |
| `/orders` | `MyOrdersPage` | ✅ Yes | Any |
| `/wishlist` | `WishlistPage` | ✅ Yes | Any |
| `*` (catch-all) | `HomePage` | No | — |

**`ProtectedRoute`** ([`components/common/ProtectedRoute.jsx`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/frontend/src/components/common/ProtectedRoute.jsx)):
Reads `isAuthenticated` and `user.role` from `AuthContext`. If not authenticated, redirects to `/login`. If wrong role, shows an access denied message.

---

## Pages

### `HomePage.jsx`
- Product browsing grid.
- Search bar in `Navbar` drives `searchQuery` state via `handleSearchSubmit`, which navigates to `/?q=<query>`.
- `ProductFilters` component provides category, condition, price, and location filter controls.
- Calls `productApi.getProducts(params)` to load products.
- Each product shown as a `ProductCard`.

### `ProductDetailsPage.jsx`
- Shows full product details for a single item (`/products/:id`).
- Loads product via `productApi.getProductById(id)`.
- Allows buyers to click "Make Offer" which opens `OrderModal`.
- Allows buyers to toggle wishlist.
- Shows seller rating via `reviewApi.getSellerReviews(sellerId)`.
- Shows `ReviewModal` if the current user has a completed order for this product.

### `SellerDashboardPage.jsx`
- Seller only (protected).
- Shows the seller's own listings via `productApi.getMyListings()`.
- "New Listing" button opens `ProductFormModal` in create mode.
- Each listing card has Edit, Delete, and Status-change controls.
- Shows incoming orders from buyers via `orderApi.getSellerOrders()`.
- Seller can accept, reject, or complete orders.

### `MyOrdersPage.jsx`
- Authenticated buyers only.
- Lists all orders placed by the current buyer via `orderApi.getBuyerOrders()`.
- Each order shows status badge, product info, and price.
- If order is `COMPLETED`, shows a "Write Review" button that opens `ReviewModal`.

### `WishlistPage.jsx`
- Authenticated users only.
- Fetches wishlisted products via `wishlistApi.getWishlist()`.
- Renders them as `ProductCard` components.
- Toggling saves back immediately.

### `LoginPage.jsx`
- Email + password login form.
- Also supports OTP login (sends OTP to email, then verifies).
- Calls `authApi.login()` or `authApi.loginWithOtp()` via `AuthContext.login/loginWithOtp`.
- Forgot password link → OTP send → OTP verify → password reset form.

### `RegisterPage.jsx`
- Full name, email, phone, city, role (Buyer/Seller), password, confirm password fields.
- Step 1: Send OTP to email (`authApi.sendOtp`).
- Step 2: Enter OTP + password to register (`authApi.register`).

---

## State Management and Contexts

Resellara uses React Context API for global state — no Redux or Zustand.

### `AuthContext.jsx`
**File:** [`frontend/src/context/AuthContext.jsx`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/frontend/src/context/AuthContext.jsx)

Provides:
- `user` — object `{ id, email, fullName, role, city, phone }` or `null`
- `token` — the JWT string or `null`
- `isAuthenticated` — `!!token && !!user`
- `isSeller` — `user?.role === 'ROLE_SELLER'`
- `isBuyer` — `user?.role === 'ROLE_BUYER'`
- `login(email, password)` — calls API, stores token in `localStorage`
- `loginWithOtp(email, otp)` — OTP-based login
- `register(userData)` — registers user, auto-logs in
- `logout()` — clears `localStorage` and context state

**Token persistence:** Both `sellara_token` and `sellara_user` are stored in `localStorage`. On page refresh, initial state reads directly from `localStorage`, so the user stays logged in.

### `WishlistContext.jsx`
- Stores the set of product IDs that the logged-in user has wishlisted.
- Provides `toggleWishlist(productId)` helper.
- Used by `ProductCard` to show the heart icon in filled/outline state.

### `ChatContext.jsx`
- Stores the list of conversations and the current open conversation.
- Provides `openChat(productId)` which creates or retrieves a conversation.
- Provides unread count for the navbar badge.

---

## API Communication

### `axiosClient.js`
**File:** [`frontend/src/api/axiosClient.js`](file:///C:/Users/harsh/.gemini/antigravity/scratch/sellara/frontend/src/api/axiosClient.js)

```js
const axiosClient = axios.create({ baseURL: '/api' });
```

The base URL is `/api` — Vite's dev server proxies this to `http://localhost:8080/api`.

**Request interceptor:**
```js
const token = localStorage.getItem('sellara_token');
if (token) config.headers.Authorization = `Bearer ${token}`;
```
Automatically attaches the JWT to every request.

**Response interceptor:**
```js
(response) => response.data   // unwraps the Axios envelope
(error) => {
  if (error.response?.status === 401) {
    // clears localStorage (outside login page)
  }
  return Promise.reject(new Error(message));
}
```
Unwraps `response.data` so API functions receive the `ApiResponse` body directly. On 401, auto-clears stale tokens.

### API Module Files

| File | Functions |
|------|-----------|
| `authApi.js` | `sendOtp`, `verifyOtp`, `register`, `login`, `loginWithOtp`, `resetPassword`, `me` |
| `productApi.js` | `getProducts`, `getProductById`, `getMyListings`, `createProduct`, `updateProduct`, `deleteProduct`, `toggleStatus`, `getPriceSuggestion` |
| `orderApi.js` | `createOrder`, `getBuyerOrders`, `getSellerOrders`, `updateOrderStatus` |
| `chatApi.js` | `getOrCreateConversation`, `getConversations`, `getMessages`, `sendMessage`, `getUnreadCount` |
| `wishlistApi.js` | `getWishlist`, `getWishlistedIds`, `toggleWishlist` |
| `reviewApi.js` | `createReview`, `getSellerReviews`, `getOrderReview` |
| `categoryApi.js` | `getCategories` |
| `locationApi.js` | `searchLocations`, `getPopularLocations` |

---

## Form Validation and Error Handling

- Client-side validation is done in each component before API calls (e.g., checking that password meets requirements, or that offer price is positive).
- The backend returns structured errors (field-level or message-level).
- `GlobalExceptionHandler` on the backend maps exceptions to JSON responses.
- `axiosClient` response interceptor extracts `error.response.data.message` and rejects with a plain `Error`.
- Components use `try/catch` around API calls and show `toast.error(err.message)` on failure.

---

## Token Storage and Logout

| Key | Value | Where |
|-----|-------|-------|
| `sellara_token` | JWT string | `localStorage` |
| `sellara_user` | JSON string of user object | `localStorage` |

**Logout (`AuthContext.logout()`):**
```js
localStorage.removeItem('sellara_token');
localStorage.removeItem('sellara_user');
setUser(null);
setToken(null);
```
No server-side session invalidation — the JWT simply expires after 24 hours (`86400000ms`). Logout is purely client-side.

---

## Running the Frontend

```powershell
# Install dependencies (first time only)
cd C:\Users\harsh\.gemini\antigravity\scratch\sellara\frontend
npm install

# Start dev server
npm run dev
```

Or use the batch file from the project root:
```
run-frontend.bat
```

The frontend will be available at **`http://localhost:5173`**.

---

## Common Frontend Errors and Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `ENOENT: node_modules not found` | `npm install` not run | Run `npm install` in `frontend/` |
| `Failed to fetch` / network error | Backend not running | Start backend first with `run-backend.bat` |
| `401 Unauthorized` | Token expired or missing | Log out and log in again |
| White page with React error | JS syntax error | Check browser console for details |
| Tailwind classes not applied | CSS not built | Restart Vite (`npm run dev`) |
| OTP not received | SMTP credentials not set | See [SETUP_AND_RUN.md](SETUP_AND_RUN.md) email section |
| Products not loading | Wrong API URL | Ensure `vite.config.js` has proxy to `:8080` |
