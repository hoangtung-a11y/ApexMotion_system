package vn.edu.haui.apexmotion.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Các lớp thực thể (Entities) và Enum theo Biểu đồ lớp (Hình 2.6, 2.12) và Thiết kế CSDL (Chương 4).
 */
public class DomainEntities {

    public enum Role {
        CUSTOMER, ADMIN
    }

    public enum OrderStatus {
        PENDING, CONFIRMED, PACKING, SHIPPING, COMPLETED, CANCELLED
    }

    public enum PaymentStatus {
        UNPAID, PAID, REFUNDED
    }

    public enum PaymentMethod {
        COD, VNPAY, QR
    }

    @Entity
    @Table(name = "users")
    public static class User {
        @Id
        @Column(length = 30)
        private String id;

        @Column(length = 50, nullable = false, unique = true)
        private String email;

        @Column(name = "password_hash", length = 100, nullable = false)
        private String passwordHash;

        @Column(name = "full_name", length = 50, nullable = false)
        private String fullName;

        @Column(length = 11)
        private String phone;

        @Column(name = "avatar_url", length = 100)
        private String avatarUrl;

        @Enumerated(EnumType.STRING)
        @Column(length = 20, nullable = false)
        private Role role = Role.CUSTOMER;

        @Column(name = "is_active")
        private Boolean isActive = true;

        @Column(name = "created_at")
        private LocalDateTime createdAt = LocalDateTime.now();

        @Column(name = "updated_at")
        private LocalDateTime updatedAt = LocalDateTime.now();

        // Phương thức theo Biểu đồ lớp chi tiết (Hình 2.12)
        public void register() {}
        public boolean login(String rawPassword) { return true; }
        public void updateProfile(String fullName, String phone, String avatarUrl) {
            this.fullName = fullName;
            this.phone = phone;
            this.avatarUrl = avatarUrl;
            this.updatedAt = LocalDateTime.now();
        }
    }

    @Entity
    @Table(name = "addresses")
    public static class Address {
        @Id
        @Column(length = 30)
        private String id;

        @Column(name = "receiver_name", length = 50)
        private String receiverName;

        @Column(name = "receiver_phone", length = 20)
        private String receiverPhone;

        @Column(length = 50)
        private String province;

        @Column(length = 50)
        private String district;

        @Column(length = 50)
        private String ward;

        @Column(name = "street_address", length = 100)
        private String streetAddress;

        @Column(name = "is_default")
        private Boolean isDefault = false;

        @Column(name = "user_id", length = 30, nullable = false)
        private String userId;
    }

    @Entity
    @Table(name = "categories")
    public static class Category {
        @Id
        @Column(length = 20)
        private String id;

        @Column(length = 50, nullable = false)
        private String name;

        @Column(length = 50, nullable = false, unique = true)
        private String slug;

        @Column(length = 500)
        private String description;

        @Column(name = "img_url", length = 100)
        private String imageUrl;

        @Column(name = "display_order")
        private Integer displayOrder = 0;

        @Column(name = "is_active")
        private Boolean isActive = true;
    }

    @Entity
    @Table(name = "products")
    public static class Product {
        @Id
        @Column(length = 30)
        private String id;

        @Column(length = 100, nullable = false)
        private String name;

        @Column(length = 100, nullable = false, unique = true)
        private String slug;

        @Column(length = 500)
        private String description;

        @Column(length = 50)
        private String brand;

        @Column(name = "base_price", precision = 12, scale = 2)
        private BigDecimal basePrice;

        @Column(name = "thumbnail_url", length = 150)
        private String thumbnailUrl;

        @Column(name = "avg_rating")
        private Float avgRating = 5.0f;

        @Column(name = "review_count")
        private Integer reviewCount = 0;

        @Column(name = "is_active")
        private Boolean isActive = true;

        @Column(name = "created_at")
        private LocalDateTime createdAt = LocalDateTime.now();

        @Column(name = "category_id", length = 20, nullable = false)
        private String categoryId;
    }

    @Entity
    @Table(name = "product_variants")
    public static class ProductVariant {
        @Id
        @Column(length = 30)
        private String id;

        @Column(length = 30)
        private String size;

        @Column(length = 30)
        private String color;

        @Column(length = 30, unique = true)
        private String sku;

        @Column(precision = 12, scale = 2)
        private BigDecimal price;

        @Column(name = "stock_quantity")
        private Integer stockQuantity;

        @Column(name = "is_active")
        private Boolean isActive = true;

        @Column(name = "product_id", length = 30, nullable = false)
        private String productId;
    }

    @Entity
    @Table(name = "product_images")
    public static class ProductImage {
        @Id
        @Column(length = 30)
        private String id;

        @Column(name = "image_url", length = 150)
        private String imageUrl;

        @Column(name = "is_primary")
        private Boolean isPrimary = false;

        @Column(name = "display_order")
        private Integer displayOrder = 0;

        @Column(name = "product_id", length = 30, nullable = false)
        private String productId;
    }

    @Entity
    @Table(name = "product_embeddings")
    public static class ProductEmbedding {
        @Id
        @Column(length = 30)
        private String id;

        @Column(name = "content_text", length = 500)
        private String contentText;

        @Column(name = "content_hash", length = 64)
        private String contentHash;

        @Column(name = "updated_at")
        private LocalDateTime updatedAt = LocalDateTime.now();

        @Column(name = "product_id", length = 30, nullable = false)
        private String productId;
    }

    @Entity
    @Table(name = "orders")
    public static class Order {
        @Id
        @Column(length = 30)
        private String id;

        @Column(name = "receiver_name", length = 50)
        private String receiverName;

        @Column(name = "receiver_phone", length = 20)
        private String receiverPhone;

        @Column(name = "shipping_address", length = 200)
        private String shippingAddress;

        @Column(precision = 12, scale = 2)
        private BigDecimal subtotal;

        @Column(name = "shipping_fee", precision = 12, scale = 2)
        private BigDecimal shippingFee;

        @Column(name = "total_amount", precision = 12, scale = 2)
        private BigDecimal totalAmount;

        @Enumerated(EnumType.STRING)
        @Column(length = 30)
        private OrderStatus status = OrderStatus.PENDING;

        @Enumerated(EnumType.STRING)
        @Column(name = "payment_method", length = 30)
        private PaymentMethod paymentMethod = PaymentMethod.COD;

        @Enumerated(EnumType.STRING)
        @Column(name = "payment_status", length = 30)
        private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

        @Column(length = 300)
        private String note;

        @Column(name = "created_at")
        private LocalDateTime createdAt = LocalDateTime.now();

        @Column(name = "user_id", length = 30, nullable = false)
        private String userId;

        public void createOrder() {}
        public void cancelOrder() { this.status = OrderStatus.CANCELLED; }
        public void updateStatus(OrderStatus newStatus) { this.status = newStatus; }
    }

    @Entity
    @Table(name = "order_items")
    public static class OrderItem {
        @Id
        @Column(length = 30)
        private String id;

        @Column(name = "product_name", length = 100)
        private String productName;

        @Column(name = "variant_info", length = 100)
        private String variantInfo;

        @Column(name = "unit_price", precision = 12, scale = 2)
        private BigDecimal unitPrice;

        private Integer quantity;

        @Column(name = "product_variant_id", length = 30, nullable = false)
        private String productVariantId;

        @Column(name = "order_id", length = 30, nullable = false)
        private String orderId;
    }

    @Entity
    @Table(name = "reviews")
    public static class Review {
        @Id
        @Column(length = 30)
        private String id;

        private Integer rating;

        @Column(length = 500)
        private String comment;

        @Column(name = "created_at")
        private LocalDateTime createdAt = LocalDateTime.now();

        @Column(name = "user_id", length = 30, nullable = false)
        private String userId;

        @Column(name = "order_item_id", length = 30, nullable = false)
        private String orderItemId;

        @Column(name = "product_id", length = 30, nullable = false)
        private String productId;
    }

    @Entity
    @Table(name = "chat_sessions")
    public static class ChatSession {
        @Id
        @Column(length = 30)
        private String id;

        @Column(length = 100)
        private String title;

        @Column(name = "user_id", length = 30)
        private String userId;
    }

    @Entity
    @Table(name = "chat_messages")
    public static class ChatMessage {
        @Id
        @Column(length = 30)
        private String id;

        @Column(length = 20)
        private String role;

        @Column(length = 500)
        private String content;

        @Column(name = "chat_session_id", length = 30, nullable = false)
        private String chatSessionId;
    }
}
