import React, { useState } from 'react'
import { User as UserIcon, Shield, Bell, Smartphone, MapPin, Check, ArrowRight, Plus, Trash2, HelpCircle } from 'lucide-react'
import { Address, User } from '../types/models'

interface ProfileEditViewProps {
  user: User
  addresses: Address[]
  onUpdateUser: (updated: Partial<User>, updatedDefaultAddress?: string) => void
  onAddAddress: (addr: Omit<Address, 'id'>) => void
  onDeleteAddress: (id: string) => void
  onSetDefaultAddress: (id: string) => void
}

export const ProfileEditView: React.FC<ProfileEditViewProps> = ({
  user,
  addresses,
  onUpdateUser,
  onAddAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'addresses' | 'security'>('profile')
  // 3 bước theo Hình 3.2 & Sơ đồ trình tự Hình 2.7: 1 (Chọn thông tin) -> 2 (Chỉnh sửa) -> 3 (Xác nhận)
  const [step, setStep] = useState<1 | 2 | 3>(2)

  const defaultAddr = addresses.find((a) => a.is_default) || addresses[0]
  const [selectedFields, setSelectedFields] = useState({
    phone: true,
    address: true,
    occupation: true,
    fullName: false,
  })

  const [phone, setPhone] = useState(user.phone || '0987654321')
  const [contactAddress, setContactAddress] = useState(
    defaultAddr ? `${defaultAddr.street_address}, ${defaultAddr.province}` : '128 Nguyễn Văn Linh, Đà Nẵng'
  )
  const [occupation, setOccupation] = useState(user.occupation || 'Trưởng nhóm marketing')
  const [fullName, setFullName] = useState(user.full_name)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)

  // State thêm địa chỉ giao hàng mới (UC 2.3.5)
  const [newReceiverName, setNewReceiverName] = useState(user.full_name)
  const [newReceiverPhone, setNewReceiverPhone] = useState(user.phone)
  const [newProvince, setNewProvince] = useState('Hà Nội')
  const [newDistrict, setNewDistrict] = useState('Quận Bắc Từ Liêm')
  const [newWard, setNewWard] = useState('Phường Minh Khai')
  const [newStreet, setNewStreet] = useState('')

  const selectedCount = Object.values(selectedFields).filter(Boolean).length

  const handleConfirmSave = () => {
    onUpdateUser(
      {
        full_name: fullName.trim() || user.full_name,
        phone: phone.replace(/\s+/g, ''),
        occupation: occupation.trim(),
        avatar_url: avatarUrl.trim() || user.avatar_url,
      },
      contactAddress.trim()
    )
    setSavedNotice('Cập nhật thông tin cá nhân thành công! (Đã lưu vào bảng USERS & ADDRESSES)')
    setStep(2)
    setTimeout(() => setSavedNotice(null), 4000)
  }

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStreet.trim()) return
    onAddAddress({
      receiver_name: newReceiverName,
      receiver_phone: newReceiverPhone,
      province: newProvince,
      district: newDistrict,
      ward: newWard,
      street_address: newStreet,
      is_default: addresses.length === 0,
      user_id: user.id,
    })
    setNewStreet('')
  }

  return (
    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header Không gian cá nhân theo Hình 3.2 */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
            a
          </div>
          <span className="font-bold text-slate-900">ApexMotion</span>
          <span className="text-slate-300">|</span>
          <span className="text-sm text-slate-500">Không gian cá nhân</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {user.full_name
              .split(' ')
              .slice(-2)
              .map((w) => w[0])
              .join('')}
          </div>
          <span className="text-sm font-semibold text-slate-800">{user.full_name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[600px]">
        {/* Sidebar trái theo Hình 3.2 */}
        <aside className="md:col-span-3 border-r border-slate-100 p-5 flex flex-col justify-between bg-slate-50/40">
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              QUẢN LÝ TÀI KHOẢN
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('profile')}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                activeSubTab === 'profile'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Thông tin cá nhân</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('addresses')}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                activeSubTab === 'addresses'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Địa chỉ giao hàng ({addresses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('security')}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                activeSubTab === 'security'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Bảo mật</span>
            </button>

            <div className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-slate-400">
              <Bell className="h-4 w-4" />
              <span>Thông báo</span>
            </div>

            <div className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-slate-400">
              <Smartphone className="h-4 w-4" />
              <span>Thiết bị đăng nhập</span>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-indigo-50/60 p-4 text-xs text-slate-600 space-y-1.5 border border-indigo-100">
            <HelpCircle className="h-4 w-4 text-indigo-600" />
            <div className="font-bold text-slate-800">Bạn cần hỗ trợ?</div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Chúng tôi luôn sẵn sàng giúp bạn quản lý tài khoản.
            </p>
            <span className="inline-block font-semibold text-indigo-600">Trung tâm trợ giúp ↗</span>
          </div>
        </aside>

        {/* Nội dung chính */}
        <div className="md:col-span-9 p-6 md:p-10 bg-slate-50/30">
          {activeSubTab === 'profile' && (
            <div className="max-w-2xl space-y-6">
              {/* Breadcrumb */}
              <div className="text-xs font-medium text-slate-400">
                Tài khoản <span className="mx-1">/</span> Thông tin cá nhân <span className="mx-1">/</span>{' '}
                <span className="text-slate-600">Chỉnh sửa</span>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">Sửa thông tin cá nhân</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Cập nhật {selectedCount} thông tin đã chọn, sau đó tiếp tục để kiểm tra thay đổi.
                </p>
              </div>

              {/* Thanh tiến trình 3 bước theo Hình 3.2 & Sơ đồ trình tự Hình 2.7 */}
              <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-slate-600 hover:text-indigo-600"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      step > 1 ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-600 text-white'
                    }`}
                  >
                    {step > 1 ? <Check className="h-3.5 w-3.5" /> : '1'}
                  </span>
                  <span>Chọn thông tin</span>
                </button>

                <div className="h-px w-10 bg-slate-200" />

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 text-indigo-700"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      step === 2
                        ? 'bg-indigo-600 text-white'
                        : step > 2
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    2
                  </span>
                  <span>Chỉnh sửa</span>
                </button>

                <div className="h-px w-10 bg-slate-200" />

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 text-slate-500"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      step === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    3
                  </span>
                  <span>Xác nhận</span>
                </button>
              </div>

              {savedNotice && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>{savedNotice}</span>
                </div>
              )}

              {/* Bước 1: Lựa chọn thông tin cần sửa (Bước 8-10 trong Sơ đồ trình tự Hình 2.7) */}
              {step === 1 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900">
                    Bước 1: Lựa chọn thông tin cá nhân cần sửa
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { key: 'phone', label: 'Số điện thoại liên hệ' },
                      { key: 'address', label: 'Địa chỉ liên hệ' },
                      { key: 'occupation', label: 'Nghề nghiệp' },
                      { key: 'fullName', label: 'Họ và tên & Ảnh đại diện' },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 cursor-pointer hover:bg-indigo-50/40"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFields[item.key as keyof typeof selectedFields]}
                          onChange={(e) =>
                            setSelectedFields({
                              ...selectedFields,
                              [item.key]: e.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                        />
                        <span className="text-sm font-medium text-slate-800">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      <span>Chuyển sang Chỉnh sửa</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Bước 2: Biểu mẫu Chỉnh sửa theo đúng Hình 3.2 */}
              {step === 2 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setStep(3)
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-5"
                >
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Cập nhật thông tin đã chọn</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {user.full_name} - {user.id} &nbsp;/&nbsp; Dấu * là thông tin bắt buộc.
                    </p>
                  </div>

                  {selectedFields.fullName && (
                    <div className="field space-y-1">
                      <label htmlFor="profile-fullname" className="block text-xs font-semibold text-slate-700">
                        Họ và tên *
                      </label>
                      <span id="fullname-hint" className="hint">
                        Nhập họ và tên đầy đủ trên giấy tờ tùy thân.
                      </span>
                      <input
                        id="profile-fullname"
                        type="text"
                        required
                        minLength={2}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        aria-describedby="fullname-hint"
                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <div className="error-msg">Vui lòng nhập họ và tên hợp lệ (tối thiểu 2 ký tự).</div>
                    </div>
                  )}

                  {/* Số điện thoại * */}
                  <div className="field space-y-1">
                    <label htmlFor="profile-phone" className="block text-xs font-semibold text-slate-700">
                      Số điện thoại *
                    </label>
                    {/* MANDATORY theo validate-input-after-interaction: Đặt hint phía trên input */}
                    <span id="phone-hint" className="hint">
                      Dùng số điện thoại Việt Nam gồm 10 chữ số.
                    </span>
                    <input
                      id="profile-phone"
                      type="tel"
                      required
                      pattern="^[0-9\s]{10,13}$"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-describedby="phone-hint"
                      aria-errormessage="phone-error"
                      className="w-full rounded-xl border-2 border-indigo-500 px-4 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                    <div id="phone-error" className="error-msg">
                      <span aria-hidden="true">❌</span> Vui lòng nhập số điện thoại hợp lệ gồm 10 chữ số.
                    </div>
                  </div>

                  {/* Địa chỉ liên hệ * */}
                  <div className="field space-y-1">
                    <label htmlFor="profile-address" className="block text-xs font-semibold text-slate-700">
                      Địa chỉ liên hệ *
                    </label>
                    <span id="address-hint" className="hint">
                      Địa chỉ hiện tại để chúng tôi liên hệ khi cần.
                    </span>
                    <input
                      id="profile-address"
                      type="text"
                      required
                      minLength={5}
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                      aria-describedby="address-hint"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                    <div className="error-msg">Vui lòng nhập địa chỉ liên hệ hợp lệ.</div>
                  </div>

                  {/* Nghề nghiệp * */}
                  <div className="field space-y-1">
                    <label htmlFor="profile-occupation" className="block text-xs font-semibold text-slate-700">
                      Nghề nghiệp *
                    </label>
                    <span id="occupation-hint" className="hint">
                      Thông tin nghề nghiệp hiện tại của bạn.
                    </span>
                    <input
                      id="profile-occupation"
                      type="text"
                      required
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      aria-describedby="occupation-hint"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                    <div className="error-msg">Vui lòng không để trống nghề nghiệp.</div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400">Các thay đổi chưa được lưu.</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPhone(user.phone)
                          setOccupation(user.occupation || 'Trưởng nhóm marketing')
                          setFullName(user.full_name)
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>Tiếp tục</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Bước 3: Bảng thông báo xác nhận và nút Lưu (Bước 13-19 trong Sơ đồ trình tự Hình 2.7) */}
              {step === 3 && (
                <div className="rounded-2xl border border-indigo-200 bg-white p-6 md:p-8 shadow-sm space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Xác nhận lưu thông tin cá nhân mới
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Vui lòng kiểm tra lại các thông tin dưới đây trước khi cập nhật vào cơ sở dữ liệu (Bảng USERS).
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mã thành viên:</span>
                      <span className="font-semibold text-slate-900">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Họ và tên:</span>
                      <span className="font-semibold text-slate-900">{fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số điện thoại mới:</span>
                      <span className="font-semibold text-indigo-700">{phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Địa chỉ liên hệ:</span>
                      <span className="font-semibold text-slate-900">{contactAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nghề nghiệp:</span>
                      <span className="font-semibold text-slate-900">{occupation}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Quay lại sửa
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmSave}
                      className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700"
                    >
                      Lưu thông tin mới
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Quản lý địa chỉ giao hàng (UC 2.3.5 - Bảng 4.1 addresses) */}
          {activeSubTab === 'addresses' && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Quản lý địa chỉ giao hàng</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Danh sách địa chỉ nhận hàng lưu trong bảng <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">addresses</code> (Bảng 4.1).
                </p>
              </div>

              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{addr.receiver_name}</span>
                        <span className="text-slate-300">|</span>
                        <span className="text-sm text-slate-600">{addr.receiver_phone}</span>
                        {addr.is_default && (
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {addr.street_address}, {addr.ward}, {addr.district}, {addr.province}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!addr.is_default && (
                        <button
                          type="button"
                          onClick={() => onSetDefaultAddress(addr.id)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Đặt mặc định
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteAddress(addr.id)}
                        className="rounded-lg border border-rose-200 p-1.5 text-rose-600 hover:bg-rose-50"
                        title="Xóa địa chỉ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleCreateAddress}
                className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm"
              >
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-600" />
                  <span>Thêm địa chỉ nhận hàng mới</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Người nhận *</label>
                    <input
                      type="text"
                      required
                      value={newReceiverName}
                      onChange={(e) => setNewReceiverName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      value={newReceiverPhone}
                      onChange={(e) => setNewReceiverPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tỉnh / Thành phố *</label>
                    <input
                      type="text"
                      required
                      value={newProvince}
                      onChange={(e) => setNewProvince(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quận / Huyện *</label>
                    <input
                      type="text"
                      required
                      value={newDistrict}
                      onChange={(e) => setNewDistrict(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phường / Xã *</label>
                    <input
                      type="text"
                      required
                      value={newWard}
                      onChange={(e) => setNewWard(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số nhà, tên đường *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Số 15 Cầu Diễn"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  + Lưu địa chỉ mới
                </button>
              </form>
            </div>
          )}

          {activeSubTab === 'security' && (
            <div className="max-w-xl space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Bảo mật &amp; Xác thực JWT</h2>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 text-sm text-slate-600">
                <p>
                  • <strong>Tài khoản:</strong> {user.email}
                </p>
                <p>
                  • <strong>Vai trò phân quyền (Spring Security Role):</strong>{' '}
                  <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-xs font-bold text-indigo-700">
                    {user.role}
                  </span>
                </p>
                <p>
                  • <strong>Trạng thái mã hóa mật khẩu:</strong> BCrypt Hash + Phiên đăng nhập JWT Token hợp lệ.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
