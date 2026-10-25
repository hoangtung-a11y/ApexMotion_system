# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG & TRIỂN KHAI HỆ THỐNG APEXMOTION TRÊN VISUAL STUDIO CODE (VS CODE)

> **Đề tài:** Phân tích, thiết kế hệ thống website **ApexMotion** bán đồ thể thao và tích hợp **Chatbot AI** gợi ý sản phẩm (RAG + pgvector)  
> **Học phần:** Thực tập cơ sở ngành (IT6055) — Trường Công nghệ Thông tin và Truyền thông (HaUI)  
> **Nhóm thực hiện:** Nhóm 1 - Khóa 19 | **GVHD:** TS. Nguyễn Hoa Huệ

---

## 1. Cấu trúc thư mục dự án trên VS Code

Khi mở thư mục `ApexMotion_system` trên Visual Studio Code, cấu trúc dự án được tổ chức theo đúng kiến trúc **MVC** và công nghệ đặc tả trong báo cáo:

```text
ApexMotion_system/
├── .vscode/                          # Cấu hình chạy tự động trên VS Code
│   ├── tasks.json                    # Các tác vụ chạy nhanh (Ctrl + Shift + B)
│   ├── launch.json                   # Cấu hình Debug mở trình duyệt Chrome (F5)
│   └── extensions.json               # Danh sách Extension khuyến nghị cho VS Code
├── database/                         # Thiết kế & Cài đặt Cơ sở dữ liệu (Chương 4)
│   ├── schema.sql                    # Script tạo 12 bảng PostgreSQL + pgvector (Bảng 4.1 -> 4.12)
│   ├── seed.sql                      # Dữ liệu mẫu (Sản phẩm, Biến thể, Đơn hàng, Vector RAG)
│   └── apexmotion_db.json            # CSDL JSON đồng bộ thời gian thực khi chạy local
├── backend-springboot/               # Phân hệ Backend Spring Boot 3 (Mục 1.3.2 & Chương 2-3)
│   ├── pom.xml                       # Cấu hình Maven (Spring Web, Security, JPA, JWT, Validation)
│   └── src/main/
│       ├── java/vn/edu/haui/apexmotion/
│       │   ├── ApexMotionApplication.java
│       │   ├── entity/DomainEntities.java       # 12 Entity + Enum theo Biểu đồ lớp (Hình 2.6, 2.12)
│       │   ├── service/ChatbotAIService.java    # Xử lý RAG Vector 1536 chiều (Hình 2.10)
│       │   └── controller/ApexMotionRestController.java
│       └── resources/application.yml # Cấu hình kết nối PostgreSQL, Redis, JWT, VNPay Sandbox
├── src/                              # Phân hệ Giao diện React 18 + TypeScript + Tailwind CSS
│   ├── types/models.ts               # Định nghĩa kiểu dữ liệu khớp 100% với 12 bảng CSDL
│   ├── services/
│   │   ├── initialData.ts            # Dữ liệu khởi tạo & hàm nhúng Vector ngữ nghĩa
│   │   └── ragChatbotService.ts      # Thuật toán Cosine Similarity (RAG) & Isolation Forest
│   ├── components/
│   │   ├── ChatbotAIWidget.tsx       # Giao diện Chatbot AI tư vấn sản phẩm (Hình 3.3)
│   │   ├── ProfileEditView.tsx       # Giao diện sửa thông tin cá nhân 3 bước (Hình 3.2)
│   │   ├── CheckoutView.tsx          # Giao diện giỏ hàng & thanh toán COD/QR (Hình 3.4)
│   │   └── AdminDashboardView.tsx    # Giao diện Quản lý sản phẩm, đơn hàng, doanh thu (Hình 3.5-3.7)
│   ├── utils/webGuidanceHelpers.ts   # Tiện ích hỗ trợ chuẩn HTML5 Dialog & Form Validation
│   ├── App.tsx                       # Luồng điều hướng chính & Chuyển đổi tác nhân
│   └── index.css                     # CSS chuẩn Responsive Table, Dialog Backdrop & Validation
├── package.json                      # Quản lý thư viện Node.js / Vite
├── vite.config.ts                    # Cấu hình Vite kèm Middleware REST API (/api/db)
└── HUONG_DAN_SU_DUNG_VSCODE.md       # Tài liệu hướng dẫn sử dụng trên VS Code (File này)
```

---

## 2. Yêu cầu môi trường & Tiện ích mở rộng (Extensions) trên VS Code

### 2.1. Phần mềm cần có
1. **Visual Studio Code**: Đã cài đặt trên máy tính.
2. **Node.js (v18 trở lên)**: Máy hiện tại đã cài sẵn **Node.js v24.19.0**.
3. *(Tùy chọn cho Backend Java & PostgreSQL)*: **JDK 25 LTS** (dự án biên dịch và chạy trên Java 25) và **PostgreSQL 15+ (kèm pgvector)**.

### 2.2. Các Extension nên cài trong VS Code
Khi mở thư mục dự án trong VS Code, nhấn `Ctrl + Shift + X` (mục Extensions) và gõ `@recommended` để cài đặt các tiện ích được gợi ý sẵn trong `.vscode/extensions.json`:
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`): Gợi ý class giao diện Tailwind CSS.
- **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`): Hỗ trợ viết nhanh React/TypeScript.
- **Extension Pack for Java** & **Spring Boot Extension Pack**: Hỗ trợ đọc và chạy mã nguồn trong thư mục `backend-springboot/`.
- **PostgreSQL Explorer**: Hỗ trợ chạy trực tiếp file `database/schema.sql` và `database/seed.sql`.

---

## 3. Hướng dẫn khởi chạy hệ thống trên VS Code (3 Cách)

### Cách 1: Chạy bằng Terminal tích hợp trong VS Code (Khuyên dùng)

1. Mở **VS Code**, chọn **File -> Open Folder...** và chọn thư mục `ApexMotion_system`.
2. Mở Terminal trong VS Code bằng tổ hợp phím `` Ctrl + ` `` (hoặc chọn menu **Terminal -> New Terminal**).
3. *(Lưu ý trên Windows PowerShell)*: Nếu PowerShell báo lỗi chặn script `npm.ps1` (ExecutionPolicy), hãy dùng lệnh `npm.cmd` thay cho `npm`, hoặc chạy lệnh mở khóa tạm thời:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
4. Cài đặt thư viện (chỉ cần chạy lần đầu):
   ```powershell
   npm.cmd install
   ```
5. Khởi chạy hệ thống (Frontend + Tích hợp REST API Server):
   ```powershell
   npm.cmd run dev
   ```
6. Nhấn giữ phím `Ctrl` và click vào đường dẫn hiển thị trên Terminal:  
   👉 **`http://localhost:5173`**

### Cách 2: Chạy nhanh bằng phím tắt Build Task của VS Code (`Ctrl + Shift + B`)

Dự án đã được cấu hình sẵn trong `.vscode/tasks.json`. Bạn chỉ cần:
1. Nhấn tổ hợp phím **`Ctrl + Shift + B`** trên VS Code.
2. Hệ thống sẽ tự động thực thi tác vụ **"2. Chạy hệ thống ApexMotion (Dev Server + REST API)"** và mở cổng `http://localhost:5173`.
3. Hoặc nhấn `Ctrl + Shift + P` -> Gõ `Tasks: Run Task` -> Chọn tác vụ số `1`, `2` hoặc `3`.

### Cách 3: Khởi tạo CSDL PostgreSQL & Chạy Spring Boot Backend (Tùy chọn)

Nếu muốn chạy riêng hệ quản trị CSDL PostgreSQL và Spring Boot:
1. Mở **pgAdmin 4** hoặc **psql**, tạo database `apexmotion_db`:
   ```sql
   CREATE DATABASE apexmotion_db;
   ```
2. Chạy lần lượt 2 file SQL trong thư mục `database/`:
   - `database/schema.sql` (Tạo 12 bảng chuẩn theo Chương 4).
   - `database/seed.sql` (Nạp dữ liệu mẫu).
3. Mở thư mục `backend-springboot` trong VS Code, kiểm tra thông tin kết nối tại `src/main/resources/application.yml` và nhấn **Run** trên file `ApexMotionApplication.java`.

---

## 4. Hướng dẫn kiểm thử đầy đủ 19 Use Case theo Tài liệu Kỹ thuật

Trên thanh công cụ trên cùng màu tối của website (`Chế độ kiểm thử Tác nhân - Bảng 2.1`), bạn có thể chuyển đổi tức thì giữa **3 vai trò** mà không cần nhập lại mật khẩu:

### 4.1. Vai trò 1: Khách vãng lai (Guest)
- **Xem sản phẩm theo danh mục (UC 2.3.6 - Hình 2.8)**: Nhấn vào các thẻ danh mục (`Giày Chạy Bộ & Thể Thao`, `Trang Phục Tập Gym & Thể Thao`, `Vợt & Phụ Kiện Cầu Lông`, `Dụng Cụ Tập Luyện & Phụ Kiện`).
- **Tìm kiếm và lọc sản phẩm (UC 2.3.7)**: Tìm theo từ khóa (VD: `Nitro`, `Yonex`, `PEAK`), lọc theo Thương hiệu, Kích cỡ (`Size 42`, `Size 39`, `Size M`...) và kéo thanh trượt khoảng giá.
- **Xem chi tiết sản phẩm (UC 2.3.8 - Mục 3.1.5)**: Nhấn vào ảnh hoặc nút **"Chi tiết"** trên thẻ sản phẩm để mở hộp thoại xem mô tả, chọn biến thể Màu sắc/Size, xem tồn kho và đọc đánh giá từ người mua trước.
- **Đăng ký & Đăng nhập (UC 2.3.1 & 2.3.2)**: Khi đang ở chế độ Guest, nhấn nút **Đăng nhập** hoặc **Đăng ký** ở góc phải trên cùng. Biểu mẫu tích hợp kiểm tra định dạng Email và độ mạnh mật khẩu sau khi tương tác (`:user-invalid`).

### 4.2. Vai trò 2: Người sử dụng / Khách hàng đã đăng nhập (`Nguyễn Minh Anh - TV-008246`)
- **Sửa thông tin cá nhân 3 bước (UC 2.3.4 - Hình 3.2 & Hình 2.7)**:
  1. Chọn menu **"Tài Khoản Cá Nhân (Hình 3.2)"**.
  2. Giao diện hiển thị đúng thiết kế **Hình 3.2** với hồ sơ `Nguyễn Minh Anh - TV-008246`, thanh tiến trình 3 bước (`1. Chọn thông tin` &rarr; `2. Chỉnh sửa` &rarr; `3. Xác nhận`).
  3. Chỉnh sửa `Số điện thoại *` (`0987 654 321`), `Địa chỉ liên hệ *` (`128 Nguyễn Văn Linh, Đà Nẵng`), `Nghề nghiệp *` (`Trưởng nhóm marketing`) &rarr; Nhấn **Tiếp tục** &rarr; Nhấn **Lưu thông tin mới**.
- **Quản lý địa chỉ giao hàng (UC 2.3.5 - Bảng 4.1)**: Tại menu bên trái trang Tài khoản, chọn **"Địa chỉ giao hàng"** để thêm mới, xóa hoặc đặt địa chỉ mặc định.
- **Quản lý giỏ hàng, Đặt hàng & Thanh toán (UC 2.3.9, 2.3.10, 2.3.11 - Hình 3.4 & Hình 2.9)**:
  1. Chọn menu **"Giỏ Hàng & Thanh Toán"**.
  2. Giao diện hiển thị đúng bố cục **Hình 3.4**: Cột trái gồm `Địa chỉ giao hàng`, `Thông tin liên lạc`, `Phương thức thanh toán` (`Thanh toán khi giao hàng` hoặc `Thanh toán qua QR`); Cột phải gồm `Giỏ hàng` (mặc định có sẵn mẫu *Giày Chạy Bộ Nam Slip-On PEAK TAICHI ET59305H - Đen ghi trắng / 39 - 999,000 ₫*) và `Tóm tắt đơn hàng` kèm đánh giá an toàn giao dịch bằng thuật toán **Isolation Forest**.
  3. Nhấn nút **Thanh toán** để hoàn tất đặt hàng.
- **Xem lịch sử đơn hàng & Đánh giá sản phẩm (UC 2.3.12 & 2.3.13)**:
  1. Chọn menu **"Lịch Sử Đơn & Đánh Giá"**.
  2. Với các đơn hàng ở trạng thái `COMPLETED`, nhấn nút **`★ Đánh giá sản phẩm`** để chấm điểm sao (1–5 sao) và viết nhận xét. Điểm trung bình của sản phẩm sẽ tự động cập nhật ngay lập tức.

### 4.3. Tư vấn trực tuyến với Trợ lý ảo Chatbot AI (UC 2.3.14 - Hình 3.3 & Hình 2.10)
- Khung chat **ApexMotion AI Assistant** nằm ở góc dưới bên phải màn hình (thiết kế theo đúng **Hình 3.3**):
  - Nhấn vào các chip gợi ý nhanh: `👟 Giày chạy marathon`, `🏋️ Đồ tập gym`, `🔥 Ưu đãi hot`, `🏸 Vợt cầu lông` hoặc nhập câu hỏi tự nhiên như:  
    *`"Tư vấn giày chạy nam size 42 < 2tr"`*
  - Hệ thống thực thi pipeline RAG: trích xuất thực thể (`size 42`, `< 2tr`), tính độ tương đồng **Cosine Similarity** trên bảng `product_embeddings` và hiển thị thanh trượt ngang các thẻ sản phẩm gợi ý (`Apex Nitro Pro v2`, giá `1.650.000 ₫`, nhãn `Size 42`) kèm nút **`🛒 Add to Cart`**.
  - Nhấn nút **"Xem RAG Trace"** trên thanh tiêu đề khung chat để quan sát trực tiếp thông số kỹ thuật Vector & điểm tương đồng Cosine của từng sản phẩm.

### 4.4. Vai trò 3: Quản trị viên (`Admin`)
Nhấn nút **"3. Quản trị viên (Admin)"** trên thanh công cụ trên cùng hoặc chọn tab **"Quản Trị Hệ Thống (Hình 3.5-3.7)"**:
1. **Quản lý sản phẩm (UC 2.3.16 - Hình 3.5, 3.6, 3.7 & Hình 2.11)**:
   - Xem bảng **QUẢN LÝ SẢN PHẨM** (`SP-001 Vợt cầu lông`, `SP-002 Áo thể thao`, `SP-003 Giày Thể Thao`...) theo đúng **Hình 3.5**.
   - Nhấn **`+ THÊM SẢN PHẨM MỚI`** để mở biểu mẫu **Hình 3.6**.
   - Nhấn nút **`Sửa`** trên từng dòng để mở biểu mẫu **SỬA THÔNG TIN SẢN PHẨM (Hình 3.7)**.
   - Nhấn nút **`Xóa`** để mở hộp thoại xác nhận xóa sản phẩm (Bước 6.3 Bảng 2.17).
2. **Quản lý biến thể & tồn kho (UC 2.3.17 - Bảng 4.9)**: Thêm biến thể Size/Màu/SKU mới hoặc chỉnh sửa trực tiếp số lượng tồn kho trên bảng.
3. **Quản lý danh mục (UC 2.3.15 - Hình 2.3)**: Xem, thêm mới và xóa danh mục sản phẩm.
4. **Quản lý đơn hàng & Xuất hóa đơn (UC 2.3.18 - Hình 2.5)**: Cập nhật trạng thái đơn hàng (`PENDING` &rarr; `CONFIRMED` &rarr; `PACKING` &rarr; `SHIPPING` &rarr; `COMPLETED` / `CANCELLED`) và nhấn nút **Xuất hóa đơn** để xem/in phiếu hóa đơn.
5. **Xem thống kê doanh thu (UC 2.3.19)**: Xem tổng doanh thu, tỷ lệ đơn hoàn thành và biểu đồ doanh số theo từng mặt hàng.

---

## 5. Xử lý sự cố thường gặp trên VS Code

| Sự cố | Nguyên nhân | Cách khắc phục |
| :--- | :--- | :--- |
| Lỗi `npm.ps1 cannot be loaded because running scripts is disabled` | Windows PowerShell chặn thực thi file `.ps1` mặc định | Sử dụng `npm.cmd install` và `npm.cmd run dev` (hoặc chạy `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`) |
| Cổng `5173` đang bận | Có một tiến trình Vite khác đang chạy | Vite sẽ tự động chuyển sang cổng `5174` hoặc bạn nhấn `Ctrl + C` trong Terminal cũ để tắt |
| Muốn khôi phục lại toàn bộ dữ liệu gốc | Đã xóa hoặc sửa nhiều sản phẩm/đơn hàng khi thử nghiệm | Nhấn nút **"Reset dữ liệu mẫu"** ở góc trên bên phải thanh công cụ màu đen trên giao diện web |
