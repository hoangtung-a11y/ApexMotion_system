import React, { useState, useRef, useEffect } from 'react'
import {
  Package,
  Layers,
  ShoppingBag,
  BarChart3,
  Sliders,
  Plus,
  Printer,
  Trash2,
  Edit3,
  CheckCircle2,
} from 'lucide-react'
import {
  ApexDatabase,
  Category,
  Order,
  OrderStatus,
  Product,
  ProductVariant,
} from '../types/models'
import { attachDialogLightDismissFallback } from '../utils/webGuidanceHelpers'

interface AdminDashboardViewProps {
  db: ApexDatabase
  onSaveProduct: (
    productData: {
      id?: string
      name: string
      price: number
      stockQuantity: number
      categoryId: string
      thumbnailUrl: string
      description: string
      brand: string
    },
    isEdit: boolean
  ) => void
  onDeleteProduct: (productId: string) => void
  onSaveCategory: (cat: Category, isEdit: boolean) => void
  onDeleteCategory: (catId: string) => void
  onSaveVariant: (variant: ProductVariant, isEdit: boolean) => void
  onDeleteVariant: (variantId: string) => void
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void
  onDeleteOrder: (orderId: string) => void
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  db,
  onSaveProduct,
  onDeleteProduct,
  onSaveCategory,
  onDeleteCategory,
  onSaveVariant,
  onDeleteVariant,
  onUpdateOrderStatus,
  onDeleteOrder,
}) => {
  const [adminTab, setAdminTab] = useState<'products' | 'variants' | 'categories' | 'orders' | 'revenue'>('products')
  const [productMode, setProductMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  // State biểu mẫu Thêm / Sửa sản phẩm (Hình 3.6 & 3.7)
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodStock, setProdStock] = useState('')
  const [prodCategory, setProdCategory] = useState('')
  const [prodImage, setProdImage] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodBrand, setProdBrand] = useState('ApexMotion')

  // Dialog xác nhận xóa sản phẩm (Luồng thay thế 3.3 - 8.3 Bảng 2.17)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)

  // Dialog xuất hóa đơn (Hình 2.5 Use case quản lý đơn hàng -> Xuất hóa đơn)
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null)
  const invoiceDialogRef = useRef<HTMLDialogElement>(null)

  // State Quản lý danh mục (UC 2.3.15)
  const [catName, setCatName] = useState('')
  const [catDesc, setCatDesc] = useState('')
  const [catImg, setCatImg] = useState('')

  // State Quản lý biến thể (UC 2.3.17)
  const [varProductId, setVarProductId] = useState(db.products[0]?.id || 'SP-001')
  const [varSize, setVarSize] = useState('')
  const [varColor, setVarColor] = useState('')
  const [varSku, setVarSku] = useState('')
  const [varPrice, setVarPrice] = useState('')
  const [varStock, setVarStock] = useState('')

  useEffect(() => {
    const cl1 = attachDialogLightDismissFallback(deleteDialogRef.current)
    const cl2 = attachDialogLightDismissFallback(invoiceDialogRef.current)
    return () => {
      cl1?.()
      cl2?.()
    }
  }, [])

  const notify = (msg: string) => {
    setStatusMessage(msg)
    setTimeout(() => setStatusMessage(null), 3500)
  }

  const getProductTotalStock = (productId: string) => {
    const vars = db.product_variants.filter((v) => v.product_id === productId)
    return vars.reduce((acc, v) => acc + v.stock_quantity, 0)
  }

  const openAddProductForm = () => {
    setEditingProduct(null)
    setProdName('')
    setProdPrice('')
    setProdStock('50')
    setProdCategory('')
    setProdImage('')
    setProdDesc('')
    setProdBrand('ApexMotion')
    setProductMode('add')
  }

  const openEditProductForm = (product: Product) => {
    setEditingProduct(product)
    setProdName(product.name)
    setProdPrice(String(product.base_price))
    setProdStock(String(getProductTotalStock(product.id) || 15))
    setProdCategory(product.category_id)
    setProdImage(product.thumbnail_url)
    setProdDesc(product.description)
    setProdBrand(product.brand || 'ApexMotion')
    setProductMode('edit')
  }

  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prodName.trim() || !prodPrice || !prodCategory) return

    onSaveProduct(
      {
        id: editingProduct?.id,
        name: prodName.trim(),
        price: Number(prodPrice),
        stockQuantity: Number(prodStock) || 20,
        categoryId: prodCategory,
        thumbnailUrl:
          prodImage.trim() ||
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        description: prodDesc.trim() || prodName.trim(),
        brand: prodBrand.trim() || 'ApexMotion',
      },
      productMode === 'edit'
    )

    notify(
      productMode === 'edit'
        ? `Đã cập nhật sản phẩm ${editingProduct?.id} và đồng bộ vector nhúng RAG!`
        : 'Đã thêm sản phẩm mới vào CSDL và sinh vector ngữ nghĩa RAG!'
    )
    setProductMode('list')
  }

  const confirmDeleteProduct = (product: Product) => {
    setProductToDelete(product)
    deleteDialogRef.current?.showModal()
  }

  const executeDeleteProduct = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete.id)
      notify(`Đã xóa sản phẩm ${productToDelete.id} (${productToDelete.name}) khỏi hệ thống.`)
      setProductToDelete(null)
      deleteDialogRef.current?.close()
    }
  }

  const openInvoiceModal = (order: Order) => {
    setInvoiceOrder(order)
    invoiceDialogRef.current?.showModal()
  }

  // Tính toán thống kê doanh thu (UC 2.3.19)
  const validOrders = db.orders.filter((o) => o.status !== 'CANCELLED')
  const totalRevenue = validOrders.reduce((sum, o) => sum + o.total_amount, 0)
  const completedOrdersCount = db.orders.filter((o) => o.status === 'COMPLETED').length

  return (
    <div className="space-y-6">
      {/* Thanh điều hướng các phân hệ Quản trị viên (Bảng 2.1 STT 3) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setAdminTab('products')
              setProductMode('list')
            }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              adminTab === 'products'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Quản lý sản phẩm (UC 2.3.16)</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('variants')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              adminTab === 'variants'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Biến thể &amp; Tồn kho (UC 2.3.17)</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('categories')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              adminTab === 'categories'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Quản lý danh mục (UC 2.3.15)</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('orders')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              adminTab === 'orders'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Quản lý đơn hàng (UC 2.3.18)</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminTab('revenue')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              adminTab === 'revenue'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Thống kê doanh thu (UC 2.3.19)</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* =====================================================================
          1. PHÂN HỆ QUẢN LÝ SẢN PHẨM (Theo đúng Hình 3.5, 3.6, 3.7 & Hình 2.11)
         ===================================================================== */}
      {adminTab === 'products' && (
        <div className="mx-auto max-w-5xl border-2 border-slate-900 bg-white p-6 md:p-10 shadow-sm">
          {productMode === 'list' && (
            <div className="space-y-6">
              <div className="border-b-[3px] border-black pb-4 text-center">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide text-black uppercase">
                  QUẢN LÝ SẢN PHẨM
                </h2>
              </div>

              <div>
                <button
                  type="button"
                  onClick={openAddProductForm}
                  className="bg-black px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-slate-800"
                >
                  + THÊM SẢN PHẨM MỚI
                </button>
              </div>

              {/* Bảng dữ liệu áp dụng chuẩn responsive-table từ modern-web-guidance */}
              <div
                tabIndex={0}
                role="region"
                aria-labelledby="admin-product-table-caption"
                className="table-wrapper border border-slate-400"
              >
                <table>
                  <caption id="admin-product-table-caption" className="sr-only">
                    Danh sách quản lý sản phẩm kho hàng ApexMotion
                  </caption>
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="border border-slate-600 px-4 py-3 text-center text-xs font-bold uppercase">
                        MÃ SP
                      </th>
                      <th className="border border-slate-600 px-4 py-3 text-center text-xs font-bold uppercase">
                        HÌNH ẢNH
                      </th>
                      <th className="border border-slate-600 px-4 py-3 text-center text-xs font-bold uppercase">
                        TÊN SẢN PHẨM
                      </th>
                      <th className="border border-slate-600 px-4 py-3 text-center text-xs font-bold uppercase">
                        GIÁ BÁN
                      </th>
                      <th className="border border-slate-600 px-4 py-3 text-center text-xs font-bold uppercase">
                        SỐ LƯỢNG
                      </th>
                      <th className="border border-slate-600 px-4 py-3 text-center text-xs font-bold uppercase">
                        THAO TÁC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {db.products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50">
                        {/* Row header sticky theo chuẩn responsive-table */}
                        <th className="border border-slate-300 px-4 py-4 text-center text-sm font-semibold text-slate-900">
                          {prod.id}
                        </th>
                        <td className="border border-slate-300 px-4 py-3 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-slate-400 bg-slate-200 overflow-hidden">
                            {prod.thumbnail_url ? (
                              <img
                                src={prod.thumbnail_url}
                                alt={prod.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-[11px] font-bold text-slate-600">IMG</span>
                            )}
                          </div>
                        </td>
                        <td className="border border-slate-300 px-4 py-4 text-center text-sm font-medium text-slate-900">
                          {prod.name}
                        </td>
                        <td className="border border-slate-300 px-4 py-4 text-center text-sm text-slate-900">
                          {prod.base_price.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="border border-slate-300 px-4 py-4 text-center text-sm text-slate-900">
                          {getProductTotalStock(prod.id)}
                        </td>
                        <td className="border border-slate-300 px-4 py-4 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditProductForm(prod)}
                              className="border border-black bg-white px-3 py-1 text-xs font-bold text-black hover:bg-slate-100"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => confirmDeleteProduct(prod)}
                              className="border border-black bg-white px-3 py-1 text-xs font-bold text-black hover:bg-rose-50 hover:text-rose-700"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Giao diện THÊM SẢN PHẨM MỚI (Hình 3.6) & SỬA THÔNG TIN SẢN PHẨM (Hình 3.7) */}
          {(productMode === 'add' || productMode === 'edit') && (
            <form onSubmit={handleProductFormSubmit} className="mx-auto max-w-2xl space-y-5">
              <div className="border-b-[3px] border-black pb-4 text-center">
                <h2 className="text-2xl md:text-3xl font-extrabold uppercase text-black">
                  {productMode === 'add' ? 'THÊM SẢN PHẨM MỚI' : 'SỬA THÔNG TIN SẢN PHẨM'}
                </h2>
              </div>

              {productMode === 'edit' && editingProduct && (
                <div className="text-center text-sm font-bold text-slate-600">
                  Đang chỉnh sửa: {editingProduct.id}
                </div>
              )}

              <div className="field space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-black">
                  TÊN SẢN PHẨM (*)
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Vợt cầu lông Yonex Astrox..."
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full border border-slate-500 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                />
                <div className="error-msg">Tên sản phẩm không được để trống.</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="field space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-black">
                    GIÁ BÁN (VNĐ) (*)
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    placeholder="VD: 250000"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    className="w-full border border-slate-500 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                  />
                  <div className="error-msg">Vui lòng nhập giá bán hợp lệ.</div>
                </div>

                <div className="field space-y-1.5">
                  <label className="block text-xs font-extrabold uppercase text-black">
                    SỐ LƯỢNG (*)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="VD: 50"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full border border-slate-500 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                  />
                  <div className="error-msg">Vui lòng nhập số lượng tồn kho.</div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-black">
                  DANH MỤC (*)
                </label>
                <select
                  required
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)}
                  className="w-full border border-slate-500 bg-white px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                >
                  <option value="">-- Chọn danh mục ApexMotion --</option>
                  {db.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-black">
                  HÌNH ẢNH SẢN PHẨM
                </label>
                <div className="border-2 border-dashed border-black bg-slate-100 p-6 text-center space-y-3">
                  {productMode === 'edit' && (
                    <div className="mx-auto flex h-20 w-20 items-center justify-center border border-slate-500 bg-slate-300 overflow-hidden">
                      {prodImage ? (
                        <img src={prodImage} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-extrabold text-black">IMG CŨ</span>
                      )}
                    </div>
                  )}
                  <div className="text-xs font-extrabold uppercase text-black">
                    {productMode === 'add'
                      ? '+ KÉO THẢ HOẶC CLICK ĐỂ TẢI ẢNH LÊN'
                      : '+ CLICK ĐỂ TẢI ẢNH MỚI LÊN ĐỂ THAY THẾ'}
                  </div>
                  <input
                    type="url"
                    placeholder="Hoặc dán URL hình ảnh sản phẩm (https://...)"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="mx-auto block w-full max-w-md border border-slate-400 bg-white px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-black">
                  MÔ TẢ CHI TIẾT
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập thông số kỹ thuật, chất liệu..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full border border-slate-500 p-4 text-sm text-black focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3">
                <button
                  type="button"
                  onClick={() => setProductMode('list')}
                  className="border-2 border-black bg-white py-3.5 text-xs font-extrabold uppercase text-black hover:bg-slate-100"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="bg-black py-3.5 text-xs font-extrabold uppercase text-white hover:bg-slate-800"
                >
                  LƯU SẢN PHẨM
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* =====================================================================
          2. PHÂN HỆ QUẢN LÝ BIẾN THỂ SẢN PHẨM (UC 2.3.17 - Bảng 4.9)
         ===================================================================== */}
      {adminTab === 'variants' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Quản lý biến thể sản phẩm &amp; Tồn kho (Bảng product_variants)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thêm/sửa/xóa Size, Màu sắc, mã SKU, Giá biến thể và Số lượng tồn kho chính xác.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!varSize.trim() || !varColor.trim() || !varSku.trim()) return
              onSaveVariant(
                {
                  id: `VAR-${Date.now()}`,
                  product_id: varProductId,
                  size: varSize.trim(),
                  color: varColor.trim(),
                  sku: varSku.trim().toUpperCase(),
                  price: Number(varPrice) || 500000,
                  stock_quantity: Number(varStock) || 10,
                  is_active: true,
                },
                false
              )
              setVarSize('')
              setVarColor('')
              setVarSku('')
              notify('Đã thêm biến thể sản phẩm mới!')
            }}
            className="grid grid-cols-1 sm:grid-cols-6 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200"
          >
            <select
              value={varProductId}
              onChange={(e) => setVarProductId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium sm:col-span-2"
            >
              {db.products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              required
              placeholder="Size (VD: 42, L)"
              value={varSize}
              onChange={(e) => setVarSize(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Màu sắc"
              value={varColor}
              onChange={(e) => setVarColor(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Mã SKU"
              value={varSku}
              onChange={(e) => setVarSku(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <div className="flex gap-2">
              <input
                type="number"
                required
                placeholder="Tồn kho"
                value={varStock}
                onChange={(e) => setVarStock(e.target.value)}
                className="w-20 rounded-lg border border-slate-300 px-2 py-2 text-xs"
              />
              <button
                type="submit"
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                + Thêm
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 uppercase">
                <tr>
                  <th className="p-3 border-b">Mã Biến Thể</th>
                  <th className="p-3 border-b">Sản Phẩm</th>
                  <th className="p-3 border-b">Size</th>
                  <th className="p-3 border-b">Màu Sắc</th>
                  <th className="p-3 border-b">SKU</th>
                  <th className="p-3 border-b">Giá Bán</th>
                  <th className="p-3 border-b">Tồn Kho</th>
                  <th className="p-3 border-b">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {db.product_variants.map((v) => {
                  const prod = db.products.find((p) => p.id === v.product_id)
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-semibold">{v.id}</td>
                      <td className="p-3 font-medium text-slate-900">{prod?.name || v.product_id}</td>
                      <td className="p-3">
                        <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                          {v.size}
                        </span>
                      </td>
                      <td className="p-3">{v.color}</td>
                      <td className="p-3 font-mono">{v.sku}</td>
                      <td className="p-3 font-semibold">{v.price.toLocaleString('vi-VN')} ₫</td>
                      <td className="p-3">
                        <input
                          type="number"
                          min={0}
                          value={v.stock_quantity}
                          onChange={(e) =>
                            onSaveVariant({ ...v, stock_quantity: Number(e.target.value) }, true)
                          }
                          className="w-16 rounded border border-slate-300 px-2 py-1 text-center font-bold"
                        />
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => onDeleteVariant(v.id)}
                          className="text-rose-600 hover:underline font-semibold"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          3. PHÂN HỆ QUẢN LÝ DANH MỤC (UC 2.3.15 & Hình 2.3 - Bảng 4.2)
         ===================================================================== */}
      {adminTab === 'categories' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Quản lý danh mục sản phẩm (Bảng categories)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thêm, sửa, xóa các nhóm danh mục đồ thể thao theo Hình 2.3.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!catName.trim()) return
              const slug = catName
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
              onSaveCategory(
                {
                  id: `CAT-${Date.now().toString().slice(-4)}`,
                  name: catName.trim(),
                  slug,
                  description: catDesc.trim() || catName.trim(),
                  img_url:
                    catImg.trim() ||
                    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80',
                  display_order: db.categories.length + 1,
                  is_active: true,
                },
                false
              )
              setCatName('')
              setCatDesc('')
              setCatImg('')
              notify('Đã thêm danh mục sản phẩm mới!')
            }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-xl bg-slate-50 p-4 border border-slate-200"
          >
            <input
              type="text"
              required
              placeholder="Tên danh mục mới..."
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <input
              type="text"
              placeholder="Mô tả danh mục..."
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs sm:col-span-2"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
            >
              + Thêm Danh Mục
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {db.categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={cat.img_url}
                    alt={cat.name}
                    className="h-14 w-14 rounded-xl object-cover bg-slate-100"
                  />
                  <div>
                    <div className="text-xs font-mono text-slate-400">{cat.id}</div>
                    <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{cat.description}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(cat.id)}
                  className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                  title="Xóa danh mục"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          4. PHÂN HỆ QUẢN LÝ ĐƠN HÀNG & XUẤT HÓA ĐƠN (UC 2.3.18 & Hình 2.5)
         ===================================================================== */}
      {adminTab === 'orders' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Quản lý đơn hàng &amp; Cập nhật tiến trình xử lý (Bảng orders)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Theo dõi đơn hàng, cập nhật trạng thái (Chờ xác nhận &rarr; Đang đóng gói &rarr; Đang giao hàng &rarr; Thành công / Đã hủy) và Xuất hóa đơn.
            </p>
          </div>

          <div className="space-y-4">
            {db.orders.map((order) => {
              const items = db.order_items.filter((oi) => oi.order_id === order.id)
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 p-5 space-y-3 hover:border-slate-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono text-sm font-extrabold text-blue-700">{order.id}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="text-sm font-bold text-slate-900">{order.receiver_name}</span>
                      <span className="ml-2 text-xs text-slate-500">({order.receiver_phone})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                          notify(`Đã cập nhật trạng thái đơn hàng ${order.id} -> ${e.target.value}`)
                        }}
                        aria-label={`Trạng thái đơn hàng ${order.id}`}
                        className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800"
                      >
                        <option value="PENDING">PENDING - Chờ xác nhận</option>
                        <option value="CONFIRMED">CONFIRMED - Đã xác nhận</option>
                        <option value="PACKING">PACKING - Đang đóng gói</option>
                        <option value="SHIPPING">SHIPPING - Đang giao hàng</option>
                        <option value="COMPLETED">COMPLETED - Thành công</option>
                        <option value="CANCELLED">CANCELLED - Đã hủy</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => openInvoiceModal(order)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Xuất hóa đơn</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteOrder(order.id)}
                        className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                        title="Xóa đơn hàng"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600">
                    <strong>Địa chỉ giao:</strong> {order.shipping_address} &bull;{' '}
                    <strong>Thanh toán:</strong> {order.payment_method} ({order.payment_status})
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                    <div className="text-slate-600">
                      {items.map((it) => `${it.product_name} (${it.variant_info}) x${it.quantity}`).join(' • ')}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900">
                      Tổng: {order.total_amount.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          5. PHÂN HỆ XEM THỐNG KÊ DOANH THU (UC 2.3.19 - Bảng 2.20)
         ===================================================================== */}
      {adminTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-bold uppercase text-slate-400">Tổng doanh thu ghi nhận</div>
              <div className="mt-2 text-2xl font-extrabold text-blue-600">
                {totalRevenue.toLocaleString('vi-VN')} ₫
              </div>
              <div className="mt-1 text-xs text-emerald-600 font-medium">
                Từ {validOrders.length} đơn hàng hợp lệ
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-bold uppercase text-slate-400">Đơn hàng hoàn thành</div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">
                {completedOrdersCount} / {db.orders.length} đơn
              </div>
              <div className="mt-1 text-xs text-slate-500">Tỷ lệ hoàn tất giao hàng</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-xs font-bold uppercase text-slate-400">Tổng sản phẩm &amp; Biến thể</div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">
                {db.products.length} SP ({db.product_variants.length} SKU)
              </div>
              <div className="mt-1 text-xs text-slate-500">Đã đồng bộ Vector RAG pgvector</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Báo cáo thống kê doanh số theo sản phẩm
            </h3>
            <div className="space-y-3">
              {db.products.map((prod) => {
                const variantIds = db.product_variants
                  .filter((v) => v.product_id === prod.id)
                  .map((v) => v.id)
                const soldItems = db.order_items.filter((oi) =>
                  variantIds.includes(oi.product_variant_id)
                )
                const soldQty = soldItems.reduce((s, i) => s + i.quantity, 0)
                const revenue = soldItems.reduce((s, i) => s + i.unit_price * i.quantity, 0)
                const pct = Math.min(100, Math.round((revenue / Math.max(1, totalRevenue)) * 100))

                return (
                  <div key={prod.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800">
                        {prod.id} — {prod.name} (Đã bán: {soldQty})
                      </span>
                      <span className="text-blue-600">{revenue.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${Math.max(6, pct)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dialog Xác nhận xóa sản phẩm (Theo chuẩn light-dismiss-a-dialog: closedby="any" + showModal()) */}
      <dialog
        ref={deleteDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="delete-dialog-title"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-w-md w-full"
      >
        <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-900">
          Xác nhận xóa sản phẩm
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          Bạn có chắc chắn muốn xóa sản phẩm{' '}
          <strong>
            {productToDelete?.id} - {productToDelete?.name}
          </strong>{' '}
          không? (Bước 6.3 Bảng 2.17)
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => deleteDialogRef.current?.close()}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700"
          >
            Hủy (Bước 7.3.1)
          </button>
          <button
            type="button"
            onClick={executeDeleteProduct}
            className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700"
          >
            Xác nhận Xóa (Bước 7.3)
          </button>
        </div>
      </dialog>

      {/* Dialog Xuất hóa đơn (Theo chuẩn light-dismiss-a-dialog: closedby="any" + showModal()) */}
      <dialog
        ref={invoiceDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby="invoice-dialog-title"
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl max-w-lg w-full"
      >
        {invoiceOrder && (
          <div className="space-y-4">
            <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
              <div>
                <h3 id="invoice-dialog-title" className="text-lg font-extrabold text-slate-900">
                  HÓA ĐƠN BÁN HÀNG APEXMOTION
                </h3>
                <p className="text-xs text-slate-500">
                  Trụ sở: Phường Minh Khai, Quận Bắc Từ Liêm, Hà Nội
                </p>
              </div>
              <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded">
                {invoiceOrder.id}
              </span>
            </div>
            <div className="text-xs space-y-1 text-slate-700">
              <div>
                <strong>Khách hàng:</strong> {invoiceOrder.receiver_name} ({invoiceOrder.receiver_phone})
              </div>
              <div>
                <strong>Địa chỉ nhận:</strong> {invoiceOrder.shipping_address}
              </div>
              <div>
                <strong>Phương thức TT:</strong> {invoiceOrder.payment_method} ({invoiceOrder.payment_status})
              </div>
            </div>
            <div className="border-t border-b border-slate-200 py-3 space-y-2 text-xs">
              {db.order_items
                .filter((i) => i.order_id === invoiceOrder.id)
                .map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.product_name} ({item.variant_info}) x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      {(item.unit_price * item.quantity).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                ))}
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900">
              <span>TỔNG THANH TOÁN:</span>
              <span>{invoiceOrder.total_amount.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
              >
                In Hóa Đơn
              </button>
              <button
                type="button"
                onClick={() => invoiceDialogRef.current?.close()}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
