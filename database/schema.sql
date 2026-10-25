-- ============================================================================
-- HỆ THỐNG BÁN ĐỒ THỂ THAO APEXMOTION & CHATBOT AI GỢI Ý SẢN PHẨM
-- CƠ SỞ DỮ LIỆU POSTGRESQL (Theo thiết kế Chương 4 & Biểu đồ lớp Chương 2)
-- ============================================================================

-- Kích hoạt extension pgvector cho tính năng RAG Chatbot AI (Vector 1536 chiều)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Bảng người dùng (users) - Bảng 4.12
CREATE TABLE IF NOT EXISTS users (
    id CHAR(30) PRIMARY KEY,
    email CHAR(50) NOT NULL UNIQUE,
    password_hash CHAR(100) NOT NULL,
    full_name VARCHAR(50) NOT NULL,
    phone CHAR(11),
    avatar_url CHAR(100),
    role CHAR(20) NOT NULL DEFAULT 'CUSTOMER', -- CUSTOMER | ADMIN
    occupation VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng địa chỉ giao hàng (addresses) - Bảng 4.1
CREATE TABLE IF NOT EXISTS addresses (
    id CHAR(30) PRIMARY KEY,
    receiver_name VARCHAR(50) NOT NULL,
    receiver_phone VARCHAR(20) NOT NULL,
    province VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    ward VARCHAR(50) NOT NULL,
    street_address VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    user_id CHAR(30) NOT NULL,
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Bảng danh mục (categories) - Bảng 4.2
CREATE TABLE IF NOT EXISTS categories (
    id CHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    img_url CHAR(100),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Bảng sản phẩm (products) - Bảng 4.10
CREATE TABLE IF NOT EXISTS products (
    id CHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    brand VARCHAR(50),
    base_price NUMERIC(12, 2) NOT NULL,
    thumbnail_url CHAR(150),
    avg_rating FLOAT DEFAULT 5.0,
    review_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id CHAR(20) NOT NULL,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 5. Bảng hình ảnh sản phẩm (product_images) - Bảng 4.8
CREATE TABLE IF NOT EXISTS product_images (
    id CHAR(30) PRIMARY KEY,
    image_url CHAR(150) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    product_id CHAR(30) NOT NULL,
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Bảng biến thể sản phẩm (product_variants) - Bảng 4.9
CREATE TABLE IF NOT EXISTS product_variants (
    id CHAR(30) PRIMARY KEY,
    size VARCHAR(30) NOT NULL,
    color VARCHAR(30) NOT NULL,
    sku VARCHAR(30) NOT NULL UNIQUE,
    price NUMERIC(12, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    product_id CHAR(30) NOT NULL,
    CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 7. Bảng vector nhúng sản phẩm (product_embeddings) - Bảng 4.7
CREATE TABLE IF NOT EXISTS product_embeddings (
    id CHAR(30) PRIMARY KEY,
    content_text VARCHAR(500) NOT NULL,
    content_hash VARCHAR(64),
    -- Vector ngữ nghĩa 1536 chiều phục vụ tìm kiếm tương đồng Cosine (pgvector)
    embedding vector(1536),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    product_id CHAR(30) NOT NULL UNIQUE,
    CONSTRAINT fk_product_embeddings_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 8. Bảng giỏ hàng (cart_items) - Theo Biểu đồ lớp Hình 2.6 & 2.12
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id CHAR(30) NOT NULL,
    product_variant_id CHAR(30) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_variant UNIQUE (user_id, product_variant_id)
);

-- 9. Bảng đơn hàng (orders) - Bảng 4.6
CREATE TABLE IF NOT EXISTS orders (
    id CHAR(30) PRIMARY KEY,
    receiver_name VARCHAR(50) NOT NULL,
    receiver_phone CHAR(20) NOT NULL,
    shipping_address VARCHAR(200) NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    shipping_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    status CHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING | CONFIRMED | PACKING | SHIPPING | COMPLETED | CANCELLED
    payment_method VARCHAR(30) NOT NULL DEFAULT 'COD', -- COD | VNPAY | QR
    payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID', -- UNPAID | PAID | REFUNDED
    note VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id CHAR(30) NOT NULL,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 10. Bảng chi tiết đơn hàng (order_items) - Bảng 4.5
CREATE TABLE IF NOT EXISTS order_items (
    id CHAR(30) PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    variant_info VARCHAR(100),
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL,
    product_variant_id CHAR(30) NOT NULL,
    order_id CHAR(30) NOT NULL,
    CONSTRAINT fk_order_items_variant FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 11. Bảng đánh giá sản phẩm (reviews) - Bảng 4.11
CREATE TABLE IF NOT EXISTS reviews (
    id CHAR(30) PRIMARY KEY,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id CHAR(30) NOT NULL,
    order_item_id CHAR(30) NOT NULL,
    product_id CHAR(30) NOT NULL,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_order_item FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 12. Bảng phiên trò chuyện chatbot (chat_sessions) - Bảng 4.4
CREATE TABLE IF NOT EXISTS chat_sessions (
    id CHAR(30) PRIMARY KEY,
    title VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id CHAR(30),
    CONSTRAINT fk_chat_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 13. Bảng tin nhắn chatbot (chat_messages) - Bảng 4.3
CREATE TABLE IF NOT EXISTS chat_messages (
    id CHAR(30) PRIMARY KEY,
    role CHAR(20) NOT NULL, -- USER | ASSISTANT
    content VARCHAR(500) NOT NULL,
    product_ids_json VARCHAR(300),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chat_session_id CHAR(30) NOT NULL,
    CONSTRAINT fk_chat_messages_session FOREIGN KEY (chat_session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- Indexes tối ưu hóa truy vấn
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
