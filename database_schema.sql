-- ============================================================
--  Food Delivery Application - MySQL Database Schema
--  Run this manually OR let Spring Boot auto-create via JPA
--  (spring.jpa.hibernate.ddl-auto=update in application.properties)
-- ============================================================

-- Create and use the database
CREATE DATABASE IF NOT EXISTS food_delivery_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE food_delivery_db;

-- ─── USERS TABLE ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100)  NOT NULL,
    email    VARCHAR(150)  NOT NULL UNIQUE,
    mobile_number VARCHAR(20),
    password VARCHAR(255)  NOT NULL,   -- BCrypt hash, never plain text
    role     VARCHAR(20)   NOT NULL DEFAULT 'USER',
    UNIQUE KEY uq_user_role_mobile (role, mobile_number)
);

-- ─── RESTAURANTS TABLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS restaurants (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(150) NOT NULL,
    location      VARCHAR(255) NOT NULL,
    cuisine_type  VARCHAR(100),
    rating        DOUBLE       DEFAULT 4.0,
    delivery_time INT          DEFAULT 30    -- minutes
);

-- ─── MENU ITEMS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id BIGINT         NOT NULL,
    name          VARCHAR(150)   NOT NULL,
    description   VARCHAR(500),
    price         DOUBLE         NOT NULL,
    category      VARCHAR(100),              -- e.g. Starters, Main Course
    available     BOOLEAN        DEFAULT TRUE,
    CONSTRAINT fk_menu_restaurant
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
        ON DELETE CASCADE
);

-- ─── CART ITEMS TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id      BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    quantity     INT    NOT NULL DEFAULT 1,
    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id)      REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_cart_menu_item
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    -- Prevent duplicate entries for same user+item combo
    UNIQUE KEY uq_cart_user_item (user_id, menu_item_id)
);

-- ─── ORDERS TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT         NOT NULL,
    total_amount     DOUBLE         NOT NULL,
    status           VARCHAR(30)    NOT NULL DEFAULT 'PENDING',
    -- PENDING | CONFIRMED | PREPARING | DELIVERED | CANCELLED
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivery_address VARCHAR(500),
    items_snapshot   TEXT,           -- JSON-like string of ordered items
    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── NOTIFICATIONS TABLE ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT        NOT NULL,
    title      VARCHAR(120)  NOT NULL,
    message    VARCHAR(1000) NOT NULL,
    type       VARCHAR(40)   NOT NULL,
    is_read    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── SAMPLE DATA (Optional — for testing) ────────────────────
-- Note: passwords are BCrypt hashes. Plain text: "password123"

INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin User',  'admin@food.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
('Test User',   'test@food.com',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER');

INSERT IGNORE INTO restaurants (name, location, cuisine_type, rating, delivery_time) VALUES
('Spice Garden',      'MG Road, Bangalore',     'Indian',    4.5, 25),
('Dragon Palace',     'Koramangala, Bangalore',  'Chinese',   4.2, 35),
('Pizza Pronto',      'Indiranagar, Bangalore',  'Italian',   4.7, 20),
('Taco Fiesta',       'HSR Layout, Bangalore',   'Mexican',   4.3, 30),
('Sushi Zen',         'Whitefield, Bangalore',   'Japanese',  4.6, 40),
('Burger Barn',       'Electronic City',         'Fast Food', 4.0, 15);

-- Menu for Spice Garden (id=1)
INSERT IGNORE INTO menu_items (restaurant_id, name, description, price, category) VALUES
(1, 'Butter Chicken',   'Creamy tomato-based chicken curry',      320.00, 'Main Course'),
(1, 'Paneer Tikka',     'Grilled cottage cheese with spices',     280.00, 'Starters'),
(1, 'Dal Makhani',      'Slow-cooked black lentils',              220.00, 'Main Course'),
(1, 'Garlic Naan',      'Soft bread with garlic butter',           60.00, 'Breads'),
(1, 'Mango Lassi',      'Sweet yogurt mango drink',                90.00, 'Drinks'),
(1, 'Gulab Jamun',      'Deep-fried milk solid dessert',          120.00, 'Desserts');

-- Menu for Dragon Palace (id=2)
INSERT IGNORE INTO menu_items (restaurant_id, name, description, price, category) VALUES
(2, 'Kung Pao Chicken', 'Spicy stir-fried chicken with peanuts',  290.00, 'Main Course'),
(2, 'Spring Rolls',     'Crispy vegetable filled rolls',          160.00, 'Starters'),
(2, 'Fried Rice',       'Wok-tossed rice with vegetables',        200.00, 'Main Course'),
(2, 'Dim Sum (6 pcs)',  'Steamed dumplings with dipping sauce',   220.00, 'Starters'),
(2, 'Hot & Sour Soup',  'Classic Chinese soup',                   140.00, 'Soups');

-- Menu for Pizza Pronto (id=3)
INSERT IGNORE INTO menu_items (restaurant_id, name, description, price, category) VALUES
(3, 'Margherita Pizza', 'Classic tomato and mozzarella, 10"',     350.00, 'Pizza'),
(3, 'Pepperoni Pizza',  'Loaded with pepperoni, 10"',             420.00, 'Pizza'),
(3, 'Pasta Arrabbiata', 'Spicy tomato pasta',                     280.00, 'Pasta'),
(3, 'Garlic Bread',     'Toasted baguette with garlic butter',    120.00, 'Sides'),
(3, 'Tiramisu',         'Classic Italian coffee dessert',         200.00, 'Desserts');

-- Menu for Burger Barn (id=6)
INSERT IGNORE INTO menu_items (restaurant_id, name, description, price, category) VALUES
(6, 'Classic Burger',   'Beef patty with lettuce and tomato',     180.00, 'Burgers'),
(6, 'Cheese Burger',    'Double cheese, extra sauce',             220.00, 'Burgers'),
(6, 'Veggie Burger',    'Aloo tikki with coriander chutney',      150.00, 'Burgers'),
(6, 'French Fries',     'Crispy golden fries',                     90.00, 'Sides'),
(6, 'Milkshake',        'Thick chocolate/vanilla shake',          140.00, 'Drinks');
