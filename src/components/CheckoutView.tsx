import React, { useState } from 'react'
import { ShieldCheck, QrCode, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react'
import { Address, ApexDatabase, PaymentMethod, User } from '../types/models'
import { evaluateTransactionIsolationForest } from '../services/ragChatbotService'

interface CheckoutViewProps {
  db: ApexDatabase
  currentUser: User
  userAddresses: Address[]
  onUpdateCartQuantity: (variantId: string, delta: number) => void
  onRemoveCartItem: (variantId: string) => void
  onPlaceOrder: (orderPayload: {
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
  }) => string
  onNavigateOrders: () => void
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  db,
  currentUser,
  userAddresses,
  onUpdateCartQuantity,
  onRemoveCartItem,
  onPlaceOrder,
  onNavigateOrders,
}) => {
  const defaultAddr = userAddresses.find((a) => a.is_default) || userAddresses[0]

  const [receiverName, setReceiverName] = useState(defaultAddr?.receiver_name || currentUser.full_name)
  const [streetAddress, setStreetAddress] = useState(defaultAddr?.street_address || '128 Nguyễn Văn Linh')
  const [province, setProvince] = useState(defaultAddr?.province || 'Đà Nẵng')
  const [district, setDistrict] = useState(defaultAddr?.district || 'Quận Hải Châu')
  const [ward, setWard] = useState(defaultAddr?.ward || 'Phường Thạch Thang')
  const [saveInfo, setSaveInfo] = useState(false)

  const [email, setEmail] = useState(currentUser.email)
  const [phone, setPhone] = useState(defaultAddr?.receiver_phone || currentUser.phone || '0987654321')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [showQrGateway, setShowQrGateway] = useState(false)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  const userCart = db.cart_items.filter((c) => c.user_id === currentUser.id)

  const detailedItems = userCart
    .map((ci) => {
      const variant = db.product_variants.find((v) => v.id === ci.product_variant_id)
      const product = variant ? db.products.find((p) => p.id === variant.product_id) : undefined
      return {
        cartItem: ci,
        variant,
        product,
      }
    })
    .filter((x) => x.variant && x.product)

  const subtotal = detailedItems.reduce(
    (sum, item) => sum + (item.variant?.price || 0) * item.cartItem.quantity,
    0
  )
  const shippingFee: number = 0
  const totalAmount = subtotal + shippingFee
  const totalQuantity = detailedItems.reduce((sum, item) => sum + item.cartItem.quantity, 0)

  const fraudEvaluation = evaluateTransactionIsolationForest({
    totalAmount,
    itemCount: totalQuantity,
    paymentMethod,
  })

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (detailedItems.length === 0) return

    if (paymentMethod === 'QR' || paymentMethod === 'VNPAY') {
      setShowQrGateway(true)
      return
    }

    finalizeOrder()
  }

  const finalizeOrder = () => {
    const fullAddress = `${streetAddress}, ${ward}, ${district}, ${province}`
    const orderId = onPlaceOrder({
      receiverName,
      receiverPhone: phone,
      shippingAddress: fullAddress,
      paymentMethod,
      note,
      saveAddress: saveInfo
        ? {
            province,
            district,
            ward,
            streetAddress,
          }
        : undefined,
    })
    setShowQrGateway(false)
    setCreatedOrderId(orderId)
  }

  if (createdOrderId) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Đặt hàng &amp; Thanh toán thành công!</h2>
        <p className="text-sm text-slate-600">
          Đơn hàng <span className="font-mono font-bold text-slate-900">{createdOrderId}</span> đã được ghi nhận vào bảng{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">orders</code> và{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">order_items</code>.
        </p>
        <div className="rounded-2xl bg-slate-50 p-4 text-left text-xs text-slate-600 space-y-1.5">
          <div>
            • <strong>Người nhận:</strong> {receiverName} ({phone})
          </div>
          <div>
            • <strong>Địa chỉ nhận hàng:</strong> {streetAddress}, {ward}, {district}, {province}
          </div>
          <div>
            • <strong>Phương thức thanh toán:</strong>{' '}
            {paymentMethod === 'COD' ? 'Thanh toán khi giao hàng (COD)' : 'Thanh toán qua QR / VNPay'}
          </div>
          <div>
            • <strong>Kiểm duyệt AI (Isolation Forest):</strong> {fraudEvaluation.reason}
          </div>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={onNavigateOrders}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow hover:bg-slate-800"
          >
            Xem Lịch Sử Đơn Hàng
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
      {/* Header Thanh toán theo đúng Hình 3.4 */}
      <div className="flex items-center justify-between border-b border-slate-900 px-6 md:px-12 py-5 bg-white">
        <div className="text-2xl md:text-3xl font-normal tracking-tight text-slate-900">ApexMotion</div>
        <div className="flex items-center gap-2 rounded-full border border-sky-500 bg-sky-50 px-3.5 py-1.5 text-sky-700">
          <ShieldCheck className="h-5 w-5 text-sky-600" />
          <div className="text-[10px] font-extrabold leading-tight uppercase">
            ĐÃ THÔNG BÁO
            <br />
            BỘ CÔNG THƯƠNG
          </div>
        </div>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10">
        {/* Cột trái: Địa chỉ giao hàng, Thông tin liên lạc, Phương thức thanh toán (Hình 3.4) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Khung 1: Địa chỉ giao hàng */}
          <div className="border border-slate-300 p-6 space-y-4">
            <h2 className="text-base font-medium text-slate-900">Địa chỉ giao hàng</h2>

            {userAddresses.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-1">
                {userAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      setReceiverName(addr.receiver_name)
                      setPhone(addr.receiver_phone)
                      setStreetAddress(addr.street_address)
                      setProvince(addr.province)
                      setDistrict(addr.district)
                      setWard(addr.ward)
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:border-slate-900"
                  >
                    Chọn nhanh: {addr.street_address}, {addr.province}
                  </button>
                ))}
              </div>
            )}

            <div className="field">
              <label htmlFor="checkout-name" className="sr-only">
                Họ và tên
              </label>
              <input
                id="checkout-name"
                type="text"
                required
                placeholder="Họ và tên"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
              <div className="error-msg">Vui lòng nhập họ và tên người nhận.</div>
            </div>

            <div className="field">
              <label htmlFor="checkout-street" className="sr-only">
                Địa chỉ
              </label>
              <input
                id="checkout-street"
                type="text"
                required
                placeholder="Địa chỉ"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
              <div className="error-msg">Vui lòng nhập số nhà, tên đường.</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                aria-label="Tỉnh/ thành"
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
              >
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Hải Phòng">Hải Phòng</option>
              </select>

              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                aria-label="Quận/ huyện"
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
              >
                <option value="Quận Hải Châu">Quận Hải Châu</option>
                <option value="Quận Bắc Từ Liêm">Quận Bắc Từ Liêm</option>
                <option value="Quận Cầu Giấy">Quận Cầu Giấy</option>
                <option value="Quận 1">Quận 1</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                aria-label="Phường/ xã"
                className="w-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 focus:border-slate-900 focus:outline-none"
              >
                <option value="Phường Thạch Thang">Phường Thạch Thang</option>
                <option value="Phường Minh Khai">Phường Minh Khai</option>
                <option value="Phường Dịch Vọng">Phường Dịch Vọng</option>
                <option value="Phường Bến Nghé">Phường Bến Nghé</option>
              </select>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveInfo}
                  onChange={(e) => setSaveInfo(e.target.checked)}
                  className="h-5 w-5 border-2 border-slate-900 accent-slate-900"
                />
                <span className="text-xs font-medium text-slate-600">Lưu Thông Tin Này</span>
              </label>
            </div>
          </div>

          {/* Khung 2: Thông tin liên lạc */}
          <div className="border border-slate-300 p-6 space-y-4">
            <h2 className="text-base font-medium text-slate-900">Thông tin liên lạc</h2>
            <div className="field">
              <span id="checkout-email-hint" className="hint">
                Định dạng: ban@example.com (Nhận hóa đơn điện tử)
              </span>
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-describedby="checkout-email-hint"
                className="w-full border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
              <div className="error-msg">Vui lòng nhập địa chỉ email hợp lệ.</div>
            </div>
            <div className="field">
              <span id="checkout-phone-hint" className="hint">
                Số điện thoại người nhận hàng (10 chữ số)
              </span>
              <input
                type="tel"
                required
                pattern="^[0-9\s]{9,12}$"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-describedby="checkout-phone-hint"
                className="w-full border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
              <div className="error-msg">Vui lòng nhập số điện thoại hợp lệ.</div>
            </div>
          </div>

          {/* Khung 3: Phương thức thanh toán theo Hình 3.4 */}
          <div className="border border-slate-300 p-6 space-y-4">
            <h2 className="text-base font-medium text-slate-900">Phương thức thanh toán</h2>

            <label
              onClick={() => setPaymentMethod('COD')}
              className={`flex items-center justify-between border px-4 py-3.5 cursor-pointer transition ${
                paymentMethod === 'COD' ? 'border-slate-900 bg-slate-50' : 'border-slate-300'
              }`}
            >
              <span className="text-xs font-medium text-slate-700">Thanh toán khi giao hàng (COD)</span>
              <input
                type="checkbox"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="h-5 w-5 border-2 border-slate-900 accent-slate-900"
              />
            </label>

            <label
              onClick={() => setPaymentMethod('QR')}
              className={`flex items-center justify-between border px-4 py-3.5 cursor-pointer transition ${
                paymentMethod === 'QR' ? 'border-slate-900 bg-slate-50' : 'border-slate-300'
              }`}
            >
              <span className="text-xs font-medium text-slate-700">
                Thanh toán qua QR (Chuyển khoản ngân hàng / VNPay Sandbox)
              </span>
              <input
                type="checkbox"
                checked={paymentMethod === 'QR'}
                onChange={() => setPaymentMethod('QR')}
                className="h-5 w-5 border-2 border-slate-900 accent-slate-900"
              />
            </label>
          </div>
        </div>

        {/* Cột phải: Giỏ hàng & Tóm tắt đơn hàng theo Hình 3.4 */}
        <div className="lg:col-span-5 space-y-6">
          {/* Khung Giỏ hàng */}
          <div className="border border-slate-300 p-6 space-y-4">
            <h2 className="text-base font-medium text-slate-900">Giỏ hàng</h2>

            {detailedItems.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">Giỏ hàng của bạn đang trống.</p>
            ) : (
              <div className="space-y-4 divide-y divide-slate-200">
                {detailedItems.map(({ cartItem, variant, product }) => (
                  <div key={cartItem.product_variant_id} className="flex gap-4 pt-4 first:pt-0">
                    <div className="h-20 w-20 shrink-0 border border-slate-300 bg-slate-50 overflow-hidden">
                      <img
                        src={product!.thumbnail_url}
                        alt={product!.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-bold text-slate-900 leading-snug">{product!.name}</h3>
                          <button
                            type="button"
                            onClick={() => onRemoveCartItem(cartItem.product_variant_id)}
                            className="text-slate-400 hover:text-rose-600"
                            title="Xóa khỏi giỏ hàng"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {variant!.color} / {variant!.size}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs font-semibold text-slate-900">
                          {variant!.price.toLocaleString('vi-VN')} ₫
                        </span>

                        <div className="inline-flex items-center border border-slate-400 text-xs">
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(cartItem.product_variant_id, -1)}
                            className="px-2 py-0.5 hover:bg-slate-100"
                          >
                            -
                          </button>
                          <span className="px-3 py-0.5 font-medium border-x border-slate-400">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateCartQuantity(cartItem.product_variant_id, 1)}
                            className="px-2 py-0.5 hover:bg-slate-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Khung Tóm tắt đơn hàng theo Hình 3.4 */}
          <div className="border border-slate-300 p-6 space-y-4">
            <h2 className="text-base font-medium text-slate-900">Tóm tắt đơn hàng</h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tổng tiền hàng</span>
                <span className="font-medium text-slate-900">{subtotal.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span>{shippingFee === 0 ? '-' : `${shippingFee.toLocaleString('vi-VN')} ₫`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Tổng thanh toán</span>
                <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            {/* Chỉ báo thuật toán AI Isolation Forest (Mục 1.3.2.10) */}
            <div
              className={`rounded-lg px-3 py-2 text-[11px] flex items-center gap-2 ${
                fraudEvaluation.isSafe
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {fraudEvaluation.isSafe ? (
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              )}
              <span>{fraudEvaluation.reason}</span>
            </div>

            <button
              type="submit"
              disabled={detailedItems.length === 0}
              className="w-full rounded-lg bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-40"
            >
              Thanh toán
            </button>
          </div>

          {/* Cổng xác nhận QR / VNPay Sandbox khi chọn Thanh toán qua QR */}
          {showQrGateway && (
            <div className="border-2 border-blue-600 bg-blue-50/40 p-6 rounded-xl space-y-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm font-bold text-blue-900">
                <QrCode className="h-5 w-5 text-blue-600" />
                <span>Cổng Thanh Toán QR / VNPay Sandbox</span>
              </div>
              <p className="text-xs text-slate-600">
                Ngân hàng: <strong>Vietcombank - CN Hà Nội</strong> | Chủ TK:{' '}
                <strong>CTCP THE THAO APEXMOTION</strong>
                <br />
                Số tiền: <strong>{totalAmount.toLocaleString('vi-VN')} ₫</strong> | Nội dung:{' '}
                <strong>APEX {phone}</strong>
              </p>
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-xl border border-slate-300 bg-white p-3 shadow-sm">
                <QrCode className="h-28 w-28 text-slate-900" />
              </div>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowQrGateway(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Hủy giao dịch (Luồng 7.1)
                </button>
                <button
                  type="button"
                  onClick={finalizeOrder}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700"
                >
                  Xác nhận đã thanh toán QR
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
