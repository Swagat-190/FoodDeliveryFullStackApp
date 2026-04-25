# 🍔 FoodDash — Food Delivery Application

A full-stack food delivery app built with **Spring Boot + React (Vite) + MySQL + JWT**.

---

## 📁 Project Structure

```
food-delivery/
├── backend/                   # Spring Boot (Java 17)
│   ├── pom.xml
│   └── src/main/java/com/fooddelivery/
│       ├── FoodDeliveryApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java        # Spring Security + CORS
│       │   └── GlobalExceptionHandler.java
│       ├── controller/
│       │   ├── AuthController.java        # /api/auth/**
│       │   ├── RestaurantController.java  # /api/restaurants/**
│       │   ├── MenuController.java        # /api/menu/**
│       │   ├── CartController.java        # /api/cart/**
│       │   └── OrderController.java       # /api/orders/**
│       ├── dto/                           # Request/Response objects
│       ├── entity/                        # JPA entities (DB tables)
│       ├── repository/                    # Spring Data JPA repos
│       ├── security/                      # JWT filter + utils
│       └── service/                       # Business logic
│
├── frontend/                  # React 18 + Vite
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx            # Routes
│       ├── index.css          # Global styles
│       ├── api/
│       │   ├── axios.js       # Axios instance with JWT interceptor
│       │   └── services.js    # All API call functions
│       ├── context/
│       │   ├── AuthContext.jsx # Global auth state
│       │   └── CartContext.jsx # Global cart count
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── RestaurantCard.jsx
│       │   └── MenuItemCard.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Home.jsx            # Restaurant listing
│           ├── RestaurantMenu.jsx  # Menu by restaurant
│           ├── Cart.jsx
│           └── Orders.jsx
│
└── database_schema.sql        # MySQL schema + sample data
```

---

## ⚙️ Prerequisites

| Tool | Version |
|------|---------|
| Java | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

---

## 🚀 Setup Instructions

### Step 1 — MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Option A: Let Spring Boot create tables automatically (recommended)
CREATE DATABASE food_delivery_db;
exit

# Option B: Run the full schema with sample data
mysql -u root -p < database_schema.sql
```

### Step 2 — Backend (Spring Boot)

```bash
cd backend

# Update DB credentials if needed:
# Edit src/main/resources/application.properties
#   spring.datasource.username=root
#   spring.datasource.password=YOUR_PASSWORD

# Build and run
mvn spring-boot:run

# Backend starts on http://localhost:8080
```

### Step 3 — Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend starts on http://localhost:5173
```

### Step 4 — Load Sample Data (optional)

If you used Option A above, seed the database:

```bash
mysql -u root -p food_delivery_db < database_schema.sql
```

---

## 🌐 API Endpoints

All protected endpoints require:  
`Authorization: Bearer <JWT_TOKEN>` header

### 🔐 Auth (`/api/auth`)

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/profile` | ✅ | Get current user profile |

**Register body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "+919876543210",
  "role": "USER",
  "password": "secret123"
}
```

Mobile rules:
- `mobileNumber` is required.
- It must be 10 to 13 digits.
- It is unique per role (`USER` and `SELLER` keep separate uniqueness scopes intentionally).

### 📱 Free Mobile Notifications

Order notifications are wired to mobile numbers:
- Customer (`USER`): gets notification when order status changes.
- Seller (`SELLER`): gets notification when a new order is placed for their restaurant.

Free mode defaults:
- `NOTIFICATION_MOBILE_PROVIDER=log` (simulation only, logs notification payloads; does not send SMS)

Optional free-tier SMS mode:
- `NOTIFICATION_MOBILE_PROVIDER=textbelt`
- `NOTIFICATION_TEXTBELT_URL=https://textbelt.com/text`
- `NOTIFICATION_TEXTBELT_KEY=textbelt`

Note: Textbelt free tier has quota limits.

### 🔔 Free Notification Channels (Recommended)

Default free-first notifications:
- In-app notifications (stored in DB and available via API)
- Email notifications (via SMTP)

Notification endpoints (authenticated):
- `GET /api/notifications`
- `GET /api/notifications/unread-count`
- `PUT /api/notifications/{id}/read`
- `PUT /api/notifications/read-all`

SMTP environment variables:
- `MAIL_HOST`
- `MAIL_PORT` (default `587`)
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_SMTP_AUTH` (default `true`)
- `MAIL_SMTP_STARTTLS` (default `true`)
- `NOTIFICATION_EMAIL_FROM`
- `NOTIFICATION_EMAIL_ENABLED` (default `true`)

Production migration guide:
- Use [backend/migrations/V2026_04_26__mobile_number_role_unique_safe.sql](backend/migrations/V2026_04_26__mobile_number_role_unique_safe.sql)
- The script normalizes old values, checks duplicates, then adds constraints safely.

**Login body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "email": "john@example.com",
    "name": "John Doe",
    "userId": 1
  }
}
```

---

### 🏪 Restaurants (`/api/restaurants`)

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| GET | `/api/restaurants` | ✅ | List all restaurants |
| GET | `/api/restaurants/{id}` | ✅ | Get one restaurant |
| POST | `/api/restaurants` | ✅ | Add restaurant |
| PUT | `/api/restaurants/{id}` | ✅ | Update restaurant |
| DELETE | `/api/restaurants/{id}` | ✅ | Delete restaurant |

**POST body:**
```json
{
  "name": "Spice Garden",
  "location": "MG Road, Bangalore",
  "cuisineType": "Indian",
  "rating": 4.5,
  "deliveryTime": 25
}
```

---

### 🍽 Menu (`/api/menu`)

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| GET | `/api/menu/restaurant/{restaurantId}` | ✅ | Get restaurant menu |
| POST | `/api/menu/restaurant/{restaurantId}` | ✅ | Add menu item |
| PUT | `/api/menu/{id}` | ✅ | Update menu item |
| DELETE | `/api/menu/{id}` | ✅ | Delete menu item |

**POST body:**
```json
{
  "name": "Butter Chicken",
  "description": "Creamy tomato chicken curry",
  "price": 320.00,
  "category": "Main Course"
}
```

---

### 🛒 Cart (`/api/cart`)

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| GET | `/api/cart` | ✅ | Get user's cart |
| POST | `/api/cart` | ✅ | Add item to cart |
| PUT | `/api/cart/{id}?quantity=2` | ✅ | Update quantity |
| DELETE | `/api/cart/{id}` | ✅ | Remove item |
| DELETE | `/api/cart/clear` | ✅ | Empty cart |

**POST body:**
```json
{
  "menuItemId": 1,
  "quantity": 2
}
```

---

### 📦 Orders (`/api/orders`)

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| POST | `/api/orders` | ✅ | Place order from cart |
| GET | `/api/orders` | ✅ | Order history |
| GET | `/api/orders/{id}` | ✅ | Get single order |

**POST body:**
```json
{
  "deliveryAddress": "123 Main St, Bangalore 560001"
}
```

---

## 🔑 How JWT Authentication Works

```
1. User POSTs to /api/auth/login with email+password
2. Spring Security verifies credentials (BCrypt comparison)
3. If valid → server generates JWT token (signed with secret key)
4. Client stores token in localStorage
5. Every subsequent request includes:
   Authorization: Bearer <token>
6. JwtAuthFilter intercepts the request:
   - Extracts token from header
   - Validates signature and expiry
   - Sets authentication in Spring SecurityContext
7. Controllers access authenticated user via @AuthenticationPrincipal
```

---

## 🧪 Quick Test with cURL

```bash
# 1. Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# 2. Login (save the token!)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# 3. Use token (replace TOKEN below)
TOKEN="eyJhbGci..."

# Get restaurants
curl http://localhost:8080/api/restaurants \
  -H "Authorization: Bearer $TOKEN"

# Add to cart
curl -X POST http://localhost:8080/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"menuItemId":1,"quantity":2}'

# Place order
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deliveryAddress":"123 MG Road, Bangalore"}'
```

---

## 🗄️ Database Tables

```
users          → id, name, email, password (BCrypt), role
restaurants    → id, name, location, cuisine_type, rating, delivery_time
menu_items     → id, restaurant_id (FK), name, description, price, category, available
cart_items     → id, user_id (FK), menu_item_id (FK), quantity
orders         → id, user_id (FK), total_amount, status, created_at, delivery_address, items_snapshot
```

---

## 🧩 Architecture

```
Frontend (React)          Backend (Spring Boot)           Database
─────────────────         ──────────────────────          ─────────
React Pages         →     Controller Layer          →     MySQL
  + Axios (JWT)           Service Layer
  + Context API           Repository Layer (JPA)
                          Security (JWT Filter)
```

---

## 💡 Default Credentials (from sample data)

| Email | Password | Role |
|-------|----------|------|
| admin@food.com | password123 | ADMIN |
| test@food.com  | password123 | USER |

---

---

## 🌍 Environment Variables

All sensitive configuration uses **environment variables** (no hardcoding secrets!).

### Create `.env` file (local development):

```bash
# Copy from .env.example
cp .env.example .env

# Edit .env with your values
DB_HOST=localhost
DB_PORT=3306
DB_NAME=food_delivery_db
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your-super-secret-256-bit-key
VITE_API_BASE_URL=http://localhost:8080/api
```

### Production (Railway/Cloud):

Set these as **environment variables** in your deployment platform:
- `DB_HOST` → Database host (auto-set by Railway MySQL)
- `DB_PASSWORD` → Your database password
- `JWT_SECRET` → Strong random 256-bit key (use a generator)
- `CORS_ALLOWED_ORIGINS` → Your frontend domain
- `VITE_API_BASE_URL` → Your backend API URL

---

## 🚀 Deploy to Railway (Production Ready)

**Railway is perfect for portfolio projects!** Free tier, GitHub auto-deploy, live in minutes.

### Quick Start:
1. Push to GitHub: `git push origin main`
2. [Open Railway](https://railway.app) → Connect GitHub repo
3. Add MySQL service + Set environment variables
4. Deploy! Backend and frontend auto-deploy.

**Full guide:** See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for step-by-step instructions.

### What's Included:
✅ Environment-based configuration  
✅ Production Spring profile (no SQL logging, proper error handling)  
✅ MySQL connection pooling (HikariCP)  
✅ Frontend environment variable support  
✅ `.gitignore` to protect secrets  

---

## 🔧 Common Issues

**MySQL connection failed:**  
→ Check `DB_PASSWORD` in `.env` or environment variables  
→ Ensure MySQL service is running

**Port already in use:**  
→ Set `JAVA_PORT` environment variable to different port  
→ Or kill process: `netstat -ano | findstr :8080` (Windows)

**CORS error in browser:**  
→ Frontend must be running (http://localhost:5173 for dev)  
→ Update `CORS_ALLOWED_ORIGINS` for production domain

**JWT token expired:**  
→ Login again to get fresh token (24 hours by default)

**Frontend shows "Cannot reach API":**  
→ Check `VITE_API_BASE_URL` environment variable  
→ Ensure backend is running and accessible

---

## 📝 Portfolio Highlights

This project demonstrates:
- **Full-stack development:** Spring Boot + React with shared API
- **Authentication:** JWT-based stateless auth with Spring Security
- **Database design:** Relational schema with proper FK relationships
- **API design:** RESTful endpoints with proper HTTP status codes
- **Security:** Password hashing (BCrypt), CORS configuration, role-based access
- **Deployment:** Environment-based config, production-ready setup
- **Best practices:** Service layer separation, global exception handling, DTO pattern

---

## 📚 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite + Axios + React Router |
| **Backend** | Spring Boot 3.2 + Spring Security + JPA |
| **Database** | MySQL 8.0 |
| **Authentication** | JWT (jjwt 0.11.5) |
| **Styling** | CSS (custom, no framework) |
| **Build** | Maven + npm |

---

**Built as a CSE fresher portfolio project** 🎓 — Ready to impress! 🚀
