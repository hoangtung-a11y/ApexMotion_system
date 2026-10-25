import React, { useState, useEffect, useRef } from 'react'
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Shield,
  Star,
  Filter,
  PackageCheck,
  LogIn,
  UserPlus,
  RotateCcw,
  Sparkles,
  Check,
  MapPin,
  Database,
} from 'lucide-react'
import {
  Address,
  ApexDatabase,
  Category,
  ChatMessage,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductVariant,
  User,
} from './types/models'
import { INITIAL_DATABASE, computeSemanticVector } from './services/initialData'
import { ChatbotAIWidget } from './components/ChatbotAIWidget'
import { ProfileEditView } from './components/ProfileEditView'
import { CheckoutView } from './components/CheckoutView'
import { AdminDashboardView } from './components/AdminDashboardView'
import {
  attachDialogLightDismissFallback,
  setupFormValidationEnhancements,
} from './utils/webGuidanceHelpers'

const STORAGE_KEY = 'apexmotion_db_v1'

export function App() {
  const [db, setDb] = useState<ApexDatabase>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return INITIAL_DATABASE
  })

  // Tác nhân hiện tại: mặc định đăng nhập Nguyễn Minh Anh (TV-008246) để trải nghiệm ngay, có thể chuyển sang Guest hoặc Admin 1-click
  const [currentUserId, setCurrentUserId] = useState<string | null>('TV-008246')
  const [activeNav, setActiveNav] = useState<'shop' | 'checkout' | 'orders' | 'profile' | 'admin'>('shop')

  // Bộ lọc & Tìm kiếm sản phẩm (UC 2.3.6 & 2.3.7)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [brandFilter, setBrandFilter] = useState<string>('ALL')
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(3000000)
  const [sizeFilter, setSizeFilter] = useState<string>('ALL')

  // Modal Xem chi tiết sản phẩm (UC 2.3.8 & Mục 3.1.5)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [detailQty, setDetailQty] = useState<number>(1)
  const productDialogRef = useRef<HTMLDialogElement>(null)

  // Modal Đăng nhập / Đăng ký (UC 2.3.1 & 2.3.2)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authFullName, setAuthFullName] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const authDialogRef = useRef<HTMLDialogElement>(null)

  // Modal Đánh giá sản phẩm (UC 2.3.13)
  const [reviewTarget, setReviewTarget] = useState<{
    orderItemId: string
    productId: string
    productName: string
  } | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const reviewDialogRef = useRef<HTMLDialogElement>(null)

  const [toast, setToast] = useState<string | null>(null)

  const currentUser = db.users.find((u) => u.id === currentUserId) || null

  // Đồng bộ CSDL xuống localStorage và REST API (/api/db -> database/apexmotion_db.json)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
      fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(db, null, 2),
      }).catch(() => {})
    } catch {
      // ignore
    }
  }, [db])

  // Khởi tạo Modern Web Guidance fallbacks (:user-invalid + <dialog closedby="any">)
  useEffect(() => {
    const cleanupForm = setupFormValidationEnhancements(document)
    const cl1 = attachDialogLightDismissFallback(productDialogRef.current)
    const cl2 = attachDialogLightDismissFallback(authDialogRef.current)
    const cl3 = attachDialogLightDismissFallback(reviewDialogRef.current)
    return () => {
      cleanupForm()
      cl1?.()
      cl2?.()
      cl3?.()
    }
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleOpenProductDetail = (product: Product) => {
    setSelectedProduct(product)
    const vars = db.product_variants.filter((v) => v.product_id === product.id)
    setSelectedVariantId(vars[0]?.id || '')
    setDetailQty(1)
    productDialogRef.current?.showModal()
  }

  const handleAddToCart = (variantId: string, quantity = 1) => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập tài khoản Khách hàng để thêm vào giỏ hàng!')
      setAuthMode('login')
      authDialogRef.current?.showModal()
      return
    }
    const variant = db.product_variants.find((v) => v.id === variantId)
    const product = variant ? db.products.find((p) => p.id === variant.product_id) : undefined
    if (!variant || !product) return

    setDb((prev) => {
      const existing = prev.cart_items.find(
        (c) => c.user_id === currentUser.id && c.product_variant_id === variantId
      )
      const nextCart = existing
        ? prev.cart_items.map((c) =>
            c.user_id === currentUser.id && c.product_variant_id === variantId
              ? { ...c, quantity: c.quantity + quantity }
              : c
          )
        : [
            ...prev.cart_items,
            { user_id: currentUser.id, product_variant_id: variantId, quantity },
          ]
      return { ...prev, cart_items: nextCart }
    })

    showToast(`Đã thêm "${product.name} (${variant.size})" vào giỏ hàng!`)
  }

  const handleAddToCartFromChat = (product: Product, preferredSize?: string) => {
    const vars = db.product_variants.filter((v) => v.product_id === product.id)
    const matchedVar =
      (preferredSize &&
        vars.find((v) => v.size.toLowerCase().includes(preferredSize.toLowerCase()))) ||
      vars[0]
    if (matchedVar) {
      handleAddToCart(matchedVar.id, 1)
    }
  }

  const handleUpdateCartQuantity = (variantId: string, delta: number) => {
    if (!currentUser) return
    setDb((prev) => ({
      ...prev,
      cart_items: prev.cart_items
        .map((c) =>
          c.user_id === currentUser.id && c.product_variant_id === variantId
            ? { ...c, quantity: c.quantity + delta }
            : c
        )
        .filter((c) => c.quantity > 0),
    }))
  }

  const handleRemoveCartItem = (variantId: string) => {
    if (!currentUser) return
    setDb((prev) => ({
      ...prev,
      cart_items: prev.cart_items.filter(
        (c) => !(c.user_id === currentUser.id && c.product_variant_id === variantId)
      ),
    }))
  }

  const handlePlaceOrder = (payload: {
    receiverName: string
    receiverPhone: string
    shippingAddress: string
    paymentMethod: PaymentMethod
    note: string
    saveAddress?: {
      province: string
      district: string
      ward: string
      streetAddress: string
    }
  }): string => {
    if (!currentUser) return ''
    const userCart = db.cart_items.filter((c) => c.user_id === currentUser.id)
    const orderId = `ORD-2026-00${db.orders.length + 1}`

    let subtotal = 0
    const newOrderItems = userCart.map((ci, idx) => {
      const variant = db.product_variants.find((v) => v.id === ci.product_variant_id)!
      const product = db.products.find((p) => p.id === variant.product_id)!
      subtotal += variant.price * ci.quantity
      return {
        id: `OIT-${Date.now()}-${idx}`,
        product_name: product.name,
        variant_info: `${variant.color} / ${variant.size}`,
        unit_price: variant.price,
        quantity: ci.quantity,
        product_variant_id: variant.id,
        order_id: orderId,
      }
    })

    const newOrder = {
      id: orderId,
      receiver_name: payload.receiverName,
      receiver_phone: payload.receiverPhone,
      shipping_address: payload.shippingAddress,
      subtotal,
      shipping_fee: 0,
      total_amount: subtotal,
      status: (payload.paymentMethod === 'COD' ? 'PENDING' : 'CONFIRMED') as OrderStatus,
      payment_method: payload.paymentMethod,
      payment_status: (payload.paymentMethod === 'COD' ? 'UNPAID' : 'PAID') as 'UNPAID' | 'PAID',
      note: payload.note,
      created_at: new Date().toISOString(),
      user_id: currentUser.id,
      fraud_score: 0.05,
    }

    setDb((prev) => {
      const nextAddresses = payload.saveAddress
        ? [
            ...prev.addresses,
            {
              id: `ADDR-${Date.now()}`,
              receiver_name: payload.receiverName,
              receiver_phone: payload.receiverPhone,
              province: payload.saveAddress.province,
              district: payload.saveAddress.district,
              ward: payload.saveAddress.ward,
              street_address: payload.saveAddress.streetAddress,
              is_default: false,
              user_id: currentUser.id,
            },
          ]
        : prev.addresses

      // Trừ tồn kho biến thể
      const nextVariants = prev.product_variants.map((v) => {
        const bought = userCart.find((c) => c.product_variant_id === v.id)
        return bought
          ? { ...v, stock_quantity: Math.max(0, v.stock_quantity - bought.quantity) }
          : v
      })

      return {
        ...prev,
        orders: [newOrder, ...prev.orders],
        order_items: [...newOrderItems, ...prev.order_items],
        product_variants: nextVariants,
        addresses: nextAddresses,
        cart_items: prev.cart_items.filter((c) => c.user_id !== currentUser.id),
      }
    })

    showToast(`Đã tạo đơn hàng ${orderId} thành công!`)
    return orderId
  }

  // Xử lý Đăng nhập / Đăng ký (UC 2.3.1 & 2.3.2)
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (authMode === 'login') {
      const found = db.users.find(
        (u) => u.email.toLowerCase() === authEmail.trim().toLowerCase()
      )
      if (found) {
        setCurrentUserId(found.id)
        authDialogRef.current?.close()
        showToast(`Xin chào ${found.full_name} (${found.role})!`)
      } else {
        showToast('Email chưa đăng ký. Vui lòng chuyển sang tab Đăng ký!')
      }
    } else {
      const newUser: User = {
        id: `TV-${Math.floor(100000 + Math.random() * 900000)}`,
        email: authEmail.trim(),
        password_hash: authPassword,
        full_name: authFullName.trim() || 'Khách hàng mới',
        phone: authPhone.trim() || '0988888888',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        role: 'CUSTOMER',
        occupation: 'Khách hàng thành viên',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setDb((prev) => ({ ...prev, users: [...prev.users, newUser] }))
      setCurrentUserId(newUser.id)
      authDialogRef.current?.close()
      showToast(`Đăng ký tài khoản thành công! Mã thành viên: ${newUser.id}`)
    }
  }

  // Xử lý gửi đánh giá sản phẩm (UC 2.3.13)
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewTarget || !currentUser) return
    const newRev = {
      id: `REV-${Date.now()}`,
      rating: reviewRating,
      comment: reviewComment.trim() || 'Sản phẩm chất lượng tốt, rất đáng tiền!',
      created_at: new Date().toISOString(),
      user_id: currentUser.id,
      order_item_id: reviewTarget.orderItemId,
      product_id: reviewTarget.productId,
    }

    setDb((prev) => {
      const nextReviews = [newRev, ...prev.reviews]
      const prodReviews = nextReviews.filter((r) => r.product_id === reviewTarget.productId)
      const avg =
        prodReviews.reduce((s, r) => s + r.rating, 0) / Math.max(1, prodReviews.length)

      const nextProducts = prev.products.map((p) =>
        p.id === reviewTarget.productId
          ? {
              ...p,
              avg_rating: Number(avg.toFixed(1)),
              review_count: prodReviews.length,
            }
          : p
      )
      return { ...prev, reviews: nextReviews, products: nextProducts }
    })

    reviewDialogRef.current?.close()
    setReviewTarget(null)
    setReviewComment('')
    showToast('Cảm ơn bạn đã đánh giá sản phẩm! Điểm sao trung bình đã được cập nhật.')
  }

  // Lọc danh sách sản phẩm hiển thị
  const filteredProducts = db.products.filter((prod) => {
    if (!prod.is_active) return false
    if (selectedCategoryId !== 'ALL' && prod.category_id !== selectedCategoryId) return false
    if (brandFilter !== 'ALL' && prod.brand !== brandFilter) return false
    if (prod.base_price > maxPriceFilter) return false
    if (searchKeyword.trim()) {
      const kw = searchKeyword.toLowerCase()
      const matchText = `${prod.name} ${prod.description} ${prod.brand} ${prod.id}`.toLowerCase()
      if (!matchText.includes(kw)) return false
    }
    if (sizeFilter !== 'ALL') {
      const vars = db.product_variants.filter((v) => v.product_id === prod.id)
      if (!vars.some((v) => v.size.toUpperCase().includes(sizeFilter))) return false
    }
    return true
  })

  const cartCount = currentUser
    ? db.cart_items
        .filter((c) => c.user_id === currentUser.id)
        .reduce((s, c) => s + c.quantity, 0)
    : 0

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Thanh chuyển đổi nhanh Tác nhân (Guest / Người sử dụng / Quản trị viên) để kiểm thử Use Case */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs border-b border-slate-800">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-blue-400 flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              Chế độ kiểm thử Tác nhân (Bảng 2.1):
            </span>
            <button
              type="button"
              onClick={() => {
                setCurrentUserId(null)
                if (activeNav === 'admin' || activeNav === 'profile') setActiveNav('shop')
                showToast('Đã chuyển sang vai trò: Khách vãng lai (Guest)')
              }}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                currentUserId === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              1. Khách vãng lai (Guest)
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentUserId('TV-008246')
                showToast('Đã chuyển sang: Người sử dụng (Nguyễn Minh Anh - TV-008246)')
              }}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                currentUserId === 'TV-008246'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              2. Người sử dụng (Nguyễn Minh Anh - TV-008246)
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentUserId('USR-ADMIN-001')
                setActiveNav('admin')
                showToast('Đã chuyển sang: Quản trị viên (Admin)')
              }}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                currentUserId === 'USR-ADMIN-001'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              3. Quản trị viên (Admin)
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY)
                setDb(INITIAL_DATABASE)
                setCurrentUserId('TV-008246')
                showToast('Đã khôi phục dữ liệu mẫu gốc (Seed Data)!')
              }}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
              title="Khôi phục dữ liệu mẫu ban đầu"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset dữ liệu mẫu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActiveNav('shop')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white font-black text-lg shadow">
              A
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">ApexMotion</span>
              <span className="block text-[11px] font-medium text-slate-500">
                Sports &amp; AI RAG Recommendation
              </span>
            </div>
          </button>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveNav('shop')}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeNav === 'shop'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cửa Hàng Thể Thao
            </button>

            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  showToast('Vui lòng đăng nhập để truy cập Giỏ hàng & Thanh toán!')
                  setAuthMode('login')
                  authDialogRef.current?.showModal()
                  return
                }
                setActiveNav('checkout')
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeNav === 'checkout'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Giỏ Hàng &amp; Thanh Toán</span>
              {cartCount > 0 && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  showToast('Vui lòng đăng nhập để xem Lịch sử đơn hàng!')
                  setAuthMode('login')
                  authDialogRef.current?.showModal()
                  return
                }
                setActiveNav('orders')
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeNav === 'orders'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PackageCheck className="h-3.5 w-3.5" />
              <span>Lịch Sử Đơn &amp; Đánh Giá</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!currentUser) {
                  showToast('Vui lòng đăng nhập để sửa thông tin cá nhân!')
                  setAuthMode('login')
                  authDialogRef.current?.showModal()
                  return
                }
                setActiveNav('profile')
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeNav === 'profile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Tài Khoản Cá Nhân (Hình 3.2)</span>
            </button>

            {currentUser?.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => setActiveNav('admin')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeNav === 'admin'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Quản Trị Hệ Thống (Hình 3.5-3.7)</span>
              </button>
            )}
          </nav>

          {/* User Action */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 pl-1.5 pr-3 py-1">
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.full_name}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 leading-none">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] font-semibold text-blue-600">
                    {currentUser.role} • {currentUser.id}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login')
                    authDialogRef.current?.showModal()
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register')
                    authDialogRef.current?.showModal()
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Đăng ký</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Thông báo nổi (Toast) */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-xl ring-1 ring-white/15">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Nội dung trang chính */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8">
        {/* =================================================================
            TRANG 1: CỬA HÀNG, DANH MỤC & BỘ LỌC SẢN PHẨM (UC 2.3.6, 2.3.7, 2.3.8)
           ================================================================= */}
        {activeNav === 'shop' && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 md:p-10 text-white shadow-lg">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Hệ thống 15 cửa hàng toàn quốc • Tích hợp Trợ lý ảo RAG AI</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                  Bứt Phá Giới Hạn Thể Thao Cùng ApexMotion
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Chuyên trang phục, giày chạy bộ Marathon và thiết bị thể thao chính hãng. Trải nghiệm tư vấn chọn Size &amp; sản phẩm cá nhân hóa bằng công nghệ <strong>RAG + pgvector</strong> ở góc phải màn hình.
                </p>
                <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-400" />
                    Trụ sở chính: Phường Minh Khai, Quận Bắc Từ Liêm, Hà Nội
                  </span>
                </div>
              </div>
            </div>

            {/* Khu vực Danh mục sản phẩm (UC 2.3.6 & Sơ đồ trình tự Hình 2.8) */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">
                  Danh Mục Sản Phẩm Thể Thao
                </h2>
                <span className="text-xs text-slate-500">
                  Hiển thị {filteredProducts.length} / {db.products.length} sản phẩm
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId('ALL')}
                  className={`rounded-2xl border p-3.5 text-left transition ${
                    selectedCategoryId === 'ALL'
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="text-xs font-bold uppercase opacity-75">Tất cả</div>
                  <div className="mt-1 text-sm font-extrabold">Toàn bộ kho hàng</div>
                </button>

                {db.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`rounded-2xl border p-3.5 text-left transition ${
                      selectedCategoryId === cat.id
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-blue-400'
                    }`}
                  >
                    <div className="text-[11px] font-mono opacity-75">{cat.id}</div>
                    <div className="mt-1 text-sm font-extrabold line-clamp-1">{cat.name}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* Thanh Tìm kiếm và Bộ lọc (UC 2.3.7 - Bảng 2.8) */}
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4 relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm tên sản phẩm, môn thể thao, mã SP..."
                  aria-label="Tìm kiếm sản phẩm"
                  className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  aria-label="Lọc theo thương hiệu"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                >
                  <option value="ALL">Tất cả thương hiệu</option>
                  <option value="ApexMotion">ApexMotion</option>
                  <option value="Yonex">Yonex</option>
                  <option value="PEAK">PEAK</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <select
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                  aria-label="Lọc theo kích thước Size"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium"
                >
                  <option value="ALL">Mọi kích cỡ (Size)</option>
                  <option value="39">Size 39</option>
                  <option value="40">Size 40</option>
                  <option value="41">Size 41</option>
                  <option value="42">Size 42</option>
                  <option value="43">Size 43</option>
                  <option value="M">Size M</option>
                  <option value="L">Size L</option>
                  <option value="4U">Size 4U (Vợt)</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex items-center gap-2 text-xs">
                <span className="text-slate-500 whitespace-nowrap">
                  Giá &le; {(maxPriceFilter / 1000).toLocaleString('vi-VN')}k
                </span>
                <input
                  type="range"
                  min={250000}
                  max={3000000}
                  step={50000}
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  aria-label="Khoảng giá tối đa"
                  className="w-full accent-blue-600"
                />
              </div>
            </section>

            {/* Danh sách sản phẩm */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
                <div className="text-base font-bold text-slate-800">
                  Sản phẩm không tồn tại với tiêu chí lọc hiện tại (Luồng thay thế 4.1 Bảng 2.7)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId('ALL')
                    setSearchKeyword('')
                    setBrandFilter('ALL')
                    setSizeFilter('ALL')
                    setMaxPriceFilter(3000000)
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredProducts.map((product) => {
                  const variants = db.product_variants.filter((v) => v.product_id === product.id)
                  const totalStock = variants.reduce((s, v) => s + v.stock_quantity, 0)

                  return (
                    <div
                      key={product.id}
                      className="group rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => handleOpenProductDetail(product)}
                          className="relative block h-52 w-full overflow-hidden rounded-2xl bg-slate-100"
                        >
                          <img
                            src={product.thumbnail_url}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <span className="absolute left-3 top-3 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                            {product.brand}
                          </span>
                          <span className="absolute right-3 top-3 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-700">
                            {product.id}
                          </span>
                        </button>

                        <div className="mt-3.5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {product.avg_rating} ({product.review_count})
                            </span>
                            <span>Tồn kho: {totalStock}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleOpenProductDetail(product)}
                            className="text-left text-sm font-extrabold text-slate-900 hover:text-blue-600 line-clamp-2"
                          >
                            {product.name}
                          </button>

                          <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {variants.map((v) => (
                              <span
                                key={v.id}
                                className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600"
                              >
                                {v.size}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-base font-black text-blue-600">
                          {product.base_price.toLocaleString('vi-VN')} ₫
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenProductDetail(product)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            Chi tiết
                          </button>
                          {variants[0] && (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(variants[0].id, 1)}
                              className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-600"
                            >
                              + Giỏ
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* =================================================================
            TRANG 2: GIỎ HÀNG & THANH TOÁN (Hình 3.4 - UC 2.3.9, 2.3.10, 2.3.11)
           ================================================================= */}
        {activeNav === 'checkout' && currentUser && (
          <CheckoutView
            db={db}
            currentUser={currentUser}
            userAddresses={db.addresses.filter((a) => a.user_id === currentUser.id)}
            onUpdateCartQuantity={handleUpdateCartQuantity}
            onRemoveCartItem={handleRemoveCartItem}
            onPlaceOrder={handlePlaceOrder}
            onNavigateOrders={() => setActiveNav('orders')}
          />
        )}

        {/* =================================================================
            TRANG 3: LỊCH SỬ ĐƠN HÀNG & ĐÁNH GIÁ SẢN PHẨM (UC 2.3.12 & 2.3.13)
           ================================================================= */}
        {activeNav === 'orders' && currentUser && (
          <div className="mx-auto max-w-4xl space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Lịch Sử Đơn Hàng &amp; Đánh Giá Sản Phẩm
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Theo dõi tiến trình giao nhận theo thời gian thực và gửi đánh giá cho các đơn hàng đã hoàn thành.
              </p>
            </div>

            {db.orders.filter((o) => o.user_id === currentUser.id).length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Bạn chưa có đơn hàng nào.
              </div>
            ) : (
              <div className="space-y-4">
                {db.orders
                  .filter((o) => o.user_id === currentUser.id)
                  .map((order) => {
                    const items = db.order_items.filter((oi) => oi.order_id === order.id)
                    return (
                      <div
                        key={order.id}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className="font-mono text-sm font-black text-blue-600">
                              {order.id}
                            </span>
                            <span className="mx-2 text-slate-300">•</span>
                            <span className="text-xs text-slate-500">
                              Ngày đặt: {new Date(order.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                              {order.payment_method} ({order.payment_status})
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                                order.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : order.status === 'CANCELLED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {items.map((item) => {
                            const variant = db.product_variants.find(
                              (v) => v.id === item.product_variant_id
                            )
                            const productId = variant?.product_id || 'SP-001'
                            const alreadyReviewed = db.reviews.some(
                              (r) => r.order_item_id === item.id && r.user_id === currentUser.id
                            )

                            return (
                              <div
                                key={item.id}
                                className="py-3 flex flex-wrap items-center justify-between gap-3"
                              >
                                <div>
                                  <div className="text-sm font-bold text-slate-900">
                                    {item.product_name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Phân loại: {item.variant_info} &times; {item.quantity}
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-sm font-bold text-slate-900">
                                    {(item.unit_price * item.quantity).toLocaleString('vi-VN')} ₫
                                  </span>

                                  {order.status === 'COMPLETED' && (
                                    <button
                                      type="button"
                                      disabled={alreadyReviewed}
                                      onClick={() => {
                                        setReviewTarget({
                                          orderItemId: item.id,
                                          productId,
                                          productName: item.product_name,
                                        })
                                        setReviewRating(5)
                                        setReviewComment('')
                                        reviewDialogRef.current?.showModal()
                                      }}
                                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                                        alreadyReviewed
                                          ? 'bg-slate-100 text-slate-400'
                                          : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                                      }`}
                                    >
                                      {alreadyReviewed ? 'Đã đánh giá' : '★ Đánh giá sản phẩm'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                          <span>Giao tới: {order.shipping_address}</span>
                          <span className="text-base font-black text-slate-900">
                            Tổng tiền: {order.total_amount.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* =================================================================
            TRANG 4: SỬA THÔNG TIN CÁ NHÂN & ĐỊA CHỈ (Hình 3.2 - UC 2.3.3, 2.3.4, 2.3.5)
           ================================================================= */}
        {activeNav === 'profile' && currentUser && (
          <ProfileEditView
            user={currentUser}
            addresses={db.addresses.filter((a) => a.user_id === currentUser.id)}
            onUpdateUser={(updated, updatedDefaultAddress) => {
              setDb((prev) => ({
                ...prev,
                users: prev.users.map((u) =>
                  u.id === currentUser.id
                    ? { ...u, ...updated, updated_at: new Date().toISOString() }
                    : u
                ),
                addresses: updatedDefaultAddress
                  ? prev.addresses.map((a) =>
                      a.user_id === currentUser.id && a.is_default
                        ? { ...a, street_address: updatedDefaultAddress }
                        : a
                    )
                  : prev.addresses,
              }))
            }}
            onAddAddress={(newAddr) => {
              setDb((prev) => ({
                ...prev,
                addresses: [
                  ...prev.addresses,
                  { ...newAddr, id: `ADDR-${Date.now()}` } as Address,
                ],
              }))
              showToast('Đã thêm địa chỉ nhận hàng mới!')
            }}
            onDeleteAddress={(addrId) => {
              setDb((prev) => ({
                ...prev,
                addresses: prev.addresses.filter((a) => a.id !== addrId),
              }))
              showToast('Đã xóa địa chỉ nhận hàng!')
            }}
            onSetDefaultAddress={(addrId) => {
              setDb((prev) => ({
                ...prev,
                addresses: prev.addresses.map((a) =>
                  a.user_id === currentUser.id
                    ? { ...a, is_default: a.id === addrId }
                    : a
                ),
              }))
              showToast('Đã cập nhật địa chỉ giao hàng mặc định!')
            }}
          />
        )}

        {/* =================================================================
            TRANG 5: QUẢN TRỊ VIÊN - ADMIN DASHBOARD (Hình 3.5, 3.6, 3.7)
           ================================================================= */}
        {activeNav === 'admin' && (
          <AdminDashboardView
            db={db}
            onSaveProduct={(data, isEdit) => {
              setDb((prev) => {
                if (isEdit && data.id) {
                  const nextProducts = prev.products.map((p) =>
                    p.id === data.id
                      ? {
                          ...p,
                          name: data.name,
                          base_price: data.price,
                          category_id: data.categoryId,
                          thumbnail_url: data.thumbnailUrl,
                          description: data.description,
                        }
                      : p
                  )
                  const nextVariants = prev.product_variants.map((v) =>
                    v.product_id === data.id
                      ? { ...v, price: data.price, stock_quantity: data.stockQuantity }
                      : v
                  )
                  const embText = `${data.name} ${data.description} giá ${data.price}đ`
                  const nextEmbeddings = prev.product_embeddings.map((e) =>
                    e.product_id === data.id
                      ? {
                          ...e,
                          content_text: embText,
                          embedding_preview: computeSemanticVector(embText),
                          updated_at: new Date().toISOString(),
                        }
                      : e
                  )
                  return {
                    ...prev,
                    products: nextProducts,
                    product_variants: nextVariants,
                    product_embeddings: nextEmbeddings,
                  }
                } else {
                  const newId = `SP-00${prev.products.length + 1}`
                  const slug = data.name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]+/g, '-')
                  const newProd: Product = {
                    id: newId,
                    name: data.name,
                    slug: `${slug}-${Date.now().toString().slice(-3)}`,
                    description: data.description,
                    brand: data.brand,
                    base_price: data.price,
                    thumbnail_url: data.thumbnailUrl,
                    avg_rating: 5.0,
                    review_count: 1,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    category_id: data.categoryId,
                  }
                  const newVariant: ProductVariant = {
                    id: `VAR-${newId}-STD`,
                    size: 'FreeSize / 42',
                    color: 'Tiêu chuẩn',
                    sku: `SKU-${newId}`,
                    price: data.price,
                    stock_quantity: data.stockQuantity,
                    is_active: true,
                    product_id: newId,
                  }
                  const embText = `${data.name} ${data.description} giá ${data.price}đ`
                  const newEmb = {
                    id: `EMB-${newId}`,
                    content_text: embText,
                    content_hash: `hash-${newId}`,
                    embedding_preview: computeSemanticVector(embText),
                    updated_at: new Date().toISOString(),
                    product_id: newId,
                  }
                  return {
                    ...prev,
                    products: [...prev.products, newProd],
                    product_variants: [...prev.product_variants, newVariant],
                    product_embeddings: [...prev.product_embeddings, newEmb],
                  }
                }
              })
            }}
            onDeleteProduct={(productId) => {
              setDb((prev) => ({
                ...prev,
                products: prev.products.filter((p) => p.id !== productId),
                product_variants: prev.product_variants.filter((v) => v.product_id !== productId),
                product_embeddings: prev.product_embeddings.filter((e) => e.product_id !== productId),
              }))
            }}
            onSaveCategory={(cat, isEdit) => {
              setDb((prev) => ({
                ...prev,
                categories: isEdit
                  ? prev.categories.map((c) => (c.id === cat.id ? cat : c))
                  : [...prev.categories, cat],
              }))
            }}
            onDeleteCategory={(catId) => {
              setDb((prev) => ({
                ...prev,
                categories: prev.categories.filter((c) => c.id !== catId),
              }))
            }}
            onSaveVariant={(variant, isEdit) => {
              setDb((prev) => ({
                ...prev,
                product_variants: isEdit
                  ? prev.product_variants.map((v) => (v.id === variant.id ? variant : v))
                  : [...prev.product_variants, variant],
              }))
            }}
            onDeleteVariant={(variantId) => {
              setDb((prev) => ({
                ...prev,
                product_variants: prev.product_variants.filter((v) => v.id !== variantId),
              }))
            }}
            onUpdateOrderStatus={(orderId, status) => {
              setDb((prev) => ({
                ...prev,
                orders: prev.orders.map((o) =>
                  o.id === orderId
                    ? {
                        ...o,
                        status,
                        payment_status: status === 'COMPLETED' ? 'PAID' : o.payment_status,
                      }
                    : o
                ),
              }))
            }}
            onDeleteOrder={(orderId) => {
              setDb((prev) => ({
                ...prev,
                orders: prev.orders.filter((o) => o.id !== orderId),
                order_items: prev.order_items.filter((oi) => oi.order_id !== orderId),
              }))
            }}
          />
        )}
      </main>

      {/* =====================================================================
          MODAL 1: XEM CHI TIẾT SẢN PHẨM (UC 2.3.8 & Mục 3.1.5)
          Sử dụng <dialog closedby="any"> + showModal() theo chuẩn light-dismiss-a-dialog
         ===================================================================== */}
      <dialog
        ref={productDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="product-detail-title"
        className="rounded-3xl border border-slate-200 bg-white p-0 shadow-2xl max-w-3xl w-full overflow-hidden"
      >
        {selectedProduct && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-slate-100 overflow-hidden h-72">
                <img
                  src={selectedProduct.thumbnail_url}
                  alt={selectedProduct.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>{selectedProduct.brand}</span>
                    <span className="font-mono text-slate-400">{selectedProduct.id}</span>
                  </div>
                  <h2 id="product-detail-title" className="text-xl font-black text-slate-900">
                    {selectedProduct.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
                    <span>★ {selectedProduct.avg_rating} / 5.0</span>
                    <span className="text-slate-400">
                      ({selectedProduct.review_count} đánh giá đã xác thực)
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-600">
                    {(
                      db.product_variants.find((v) => v.id === selectedVariantId)?.price ||
                      selectedProduct.base_price
                    ).toLocaleString('vi-VN')}{' '}
                    ₫
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {/* Chọn biến thể Size / Màu sắc (Bảng product_variants) */}
                  <div className="pt-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Chọn biến thể (Màu sắc / Kích thước):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {db.product_variants
                        .filter((v) => v.product_id === selectedProduct.id)
                        .map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => setSelectedVariantId(v.id)}
                            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                              selectedVariantId === v.id
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {v.color} / Size {v.size} (Còn {v.stock_quantity})
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={detailQty}
                    onChange={(e) => setDetailQty(Math.max(1, Number(e.target.value)))}
                    aria-label="Số lượng mua"
                    className="w-16 rounded-xl border border-slate-300 px-3 py-2.5 text-center text-sm font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedVariantId) {
                        handleAddToCart(selectedVariantId, detailQty)
                        productDialogRef.current?.close()
                      }
                    }}
                    className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                  >
                    Thêm vào Giỏ hàng
                  </button>
                  <button
                    type="button"
                    onClick={() => productDialogRef.current?.close()}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>

            {/* Danh sách đánh giá của sản phẩm (Bảng reviews) */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Đánh giá từ khách hàng đã mua ({db.reviews.filter((r) => r.product_id === selectedProduct.id).length})
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {db.reviews
                  .filter((r) => r.product_id === selectedProduct.id)
                  .map((rev) => {
                    const reviewer = db.users.find((u) => u.id === rev.user_id)
                    return (
                      <div key={rev.id} className="rounded-xl bg-slate-50 p-3 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{reviewer?.full_name || rev.user_id}</span>
                          <span className="text-amber-500">{'★'.repeat(rev.rating)}</span>
                        </div>
                        <p className="text-slate-600">{rev.comment}</p>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        )}
      </dialog>

      {/* =====================================================================
          MODAL 2: ĐĂNG NHẬP / ĐĂNG KÝ (UC 2.3.1 & 2.3.2)
          Áp dụng chuẩn validate-input-after-interaction (:user-invalid + pattern lookahead)
         ===================================================================== */}
      <dialog
        ref={authDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="auth-dialog-title"
        className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl max-w-md w-full"
      >
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 id="auth-dialog-title" className="text-lg font-extrabold text-slate-900">
              {authMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên Mới'}
            </h3>
            <button
              type="button"
              onClick={() => authDialogRef.current?.close()}
              className="text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              Đóng ✕
            </button>
          </div>

          {authMode === 'register' && (
            <div className="field">
              <label htmlFor="auth-fullname" className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên *
              </label>
              <input
                id="auth-fullname"
                type="text"
                required
                value={authFullName}
                onChange={(e) => setAuthFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
              />
              <div className="error-msg">Vui lòng nhập họ và tên.</div>
            </div>
          )}

          {/* Email Validation theo chuẩn validate-input-after-interaction */}
          <div className="field">
            <label htmlFor="auth-email" className="block text-xs font-bold text-slate-700">
              Địa chỉ Email *
            </label>
            <span id="auth-email-hint" className="hint">
              Định dạng: minhanh@apexmotion.vn hoặc admin@apexmotion.vn
            </span>
            <input
              type="email"
              id="auth-email"
              name="email"
              required
              autoComplete="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              aria-describedby="auth-email-hint"
              aria-errormessage="auth-email-error"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
            <div id="auth-email-error" className="error-msg">
              <span aria-hidden="true">❌</span> Vui lòng nhập địa chỉ email hợp lệ.
            </div>
          </div>

          {/* Password Complexity theo chuẩn validate-input-after-interaction */}
          <div className="field">
            <label htmlFor="auth-password" className="block text-xs font-bold text-slate-700">
              Mật khẩu *
            </label>
            <ul id="password-rules" className="rules-list">
              <li>Tối thiểu 8 ký tự</li>
              <li>Ít nhất 1 chữ hoa &amp; 1 chữ thường</li>
              <li>Ít nhất 1 chữ số &amp; 1 ký tự đặc biệt (VD: MinhAnh@123)</li>
            </ul>
            <input
              type="password"
              id="auth-password"
              autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              required
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}"
              minLength={8}
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              aria-describedby="password-rules"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="font-bold text-blue-600 hover:underline"
            >
              {authMode === 'login'
                ? 'Chưa có tài khoản? Đăng ký ngay'
                : 'Đã có tài khoản? Đăng nhập'}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2.5 font-bold text-white hover:bg-blue-600"
            >
              {authMode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </dialog>

      {/* =====================================================================
          MODAL 3: ĐÁNH GIÁ SẢN PHẨM (UC 2.3.13 - Bảng 2.14)
         ===================================================================== */}
      <dialog
        ref={reviewDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="review-dialog-title"
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl max-w-md w-full"
      >
        {reviewTarget && (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <h3 id="review-dialog-title" className="text-lg font-extrabold text-slate-900">
              Đánh giá sản phẩm đã mua
            </h3>
            <p className="text-xs font-semibold text-blue-600">{reviewTarget.productName}</p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chấm điểm sao (1 - 5 sao):
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                      reviewRating >= star
                        ? 'border-amber-400 bg-amber-50 text-amber-600'
                        : 'border-slate-200 text-slate-400'
                    }`}
                  >
                    {star} ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhận xét chất lượng sản phẩm:
              </label>
              <textarea
                rows={3}
                required
                placeholder="Chia sẻ trải nghiệm của bạn về form dáng, độ êm, chất liệu..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => reviewDialogRef.current?.close()}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white"
              >
                Gửi đánh giá
              </button>
            </div>
          </form>
        )}
      </dialog>

      {/* =====================================================================
          CHATBOT AI WIDGET (Hình 3.3 & Hình 2.10 - Luôn hiển thị ở góc phải)
         ===================================================================== */}
      <ChatbotAIWidget
        db={db}
        currentUserId={currentUserId}
        onSendMessage={(userMsg: ChatMessage, botMsg: ChatMessage) => {
          setDb((prev) => ({
            ...prev,
            chat_messages: [...prev.chat_messages, userMsg, botMsg],
          }))
        }}
        onAddToCartFromChat={handleAddToCartFromChat}
        onSelectProduct={handleOpenProductDetail}
      />

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <strong>ApexMotion Sports System</strong> — Học phần Thực tập cơ sở ngành (IT6055) • Nhóm 1 - Khóa 19 - HaUI
          </div>
          <div>
            Kiến trúc MVC • React 18 + TypeScript + Tailwind CSS • Spring Boot + PostgreSQL (pgvector RAG AI)
          </div>
        </div>
      </footer>
    </div>
  )
}
