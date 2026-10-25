// ============================================================================
// MÔ HÌNH DỮ LIỆU TYPESCRIPT (Theo Biểu đồ lớp Hình 2.6, 2.12 & CSDL Chương 4)
// ============================================================================

export type Role = 'CUSTOMER' | 'ADMIN'

export type OrderStatus =
  | 'PENDING'    // Chờ xác nhận
  | 'CONFIRMED'  // Đã xác nhận
  | 'PACKING'    // Đang đóng gói
  | 'SHIPPING'   // Đang giao hàng
  | 'COMPLETED'  // Thành công
  | 'CANCELLED'  // Đã hủy

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED'

export type PaymentMethod = 'COD' | 'QR' | 'VNPAY'

// Bảng 4.12: users
export interface User {
  id: string
  email: string
  password_hash: string
  full_name: string
  phone: string
  avatar_url: string
  role: Role
  occupation?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Bảng 4.1: addresses
export interface Address {
  id: string
  receiver_name: string
  receiver_phone: string
  province: string
  district: string
  ward: string
  street_address: string
  is_default: boolean
  user_id: string
}

// Bảng 4.2: categories
export interface Category {
  id: string
  name: string
  slug: string
  description: string
  img_url: string
  display_order: number
  is_active: boolean
}

// Bảng 4.10: products
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  brand: string
  base_price: number
  thumbnail_url: string
  avg_rating: number
  review_count: number
  is_active: boolean
  created_at: string
  category_id: string
}

// Bảng 4.8: product_images
export interface ProductImage {
  id: string
  image_url: string
  is_primary: boolean
  display_order: number
  product_id: string
}

// Bảng 4.9: product_variants
export interface ProductVariant {
  id: string
  size: string
  color: string
  sku: string
  price: number
  stock_quantity: number
  is_active: boolean
  product_id: string
}

// Bảng 4.7: product_embeddings (Vector 1536 chiều mô phỏng cho RAG pgvector)
export interface ProductEmbedding {
  id: string
  content_text: string
  content_hash: string
  embedding_preview: number[] // Vector đặc trưng để tính Cosine Similarity
  updated_at: string
  product_id: string
}

// Hình 2.6: Cart Item
export interface CartItem {
  user_id: string
  product_variant_id: string
  quantity: number
}

// Bảng 4.6: orders
export interface Order {
  id: string
  receiver_name: string
  receiver_phone: string
  shipping_address: string
  subtotal: number
  shipping_fee: number
  total_amount: number
  status: OrderStatus
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  note: string
  created_at: string
  user_id: string
  fraud_score?: number // Điểm đánh giá bất thường Isolation Forest (Mục 1.3.2.10)
}

// Bảng 4.5: order_items
export interface OrderItem {
  id: string
  product_name: string
  variant_info: string
  unit_price: number
  quantity: number
  product_variant_id: string
  order_id: string
}

// Bảng 4.11: reviews
export interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  user_id: string
  order_item_id: string
  product_id: string
}

// Bảng 4.4: chat_sessions
export interface ChatSession {
  id: string
  title: string
  created_at: string
  user_id: string
}

// Bảng 4.3: chat_messages
export interface ChatMessage {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  product_ids_json: string // JSON array of recommended product IDs
  recommended_size?: string
  rag_trace?: {
    extracted_keywords: string[]
    max_price?: number
    size_filter?: string
    cosine_scores: { product_id: string; score: number }[]
  }
  created_at: string
  chat_session_id: string
}

export interface ApexDatabase {
  users: User[]
  addresses: Address[]
  categories: Category[]
  products: Product[]
  product_images: ProductImage[]
  product_variants: ProductVariant[]
  product_embeddings: ProductEmbedding[]
  cart_items: CartItem[]
  orders: Order[]
  order_items: OrderItem[]
  reviews: Review[]
  chat_sessions: ChatSession[]
  chat_messages: ChatMessage[]
}
