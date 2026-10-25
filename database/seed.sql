-- ============================================================================
-- DỮ LIỆU MẪU (SEED DATA) HỆ THỐNG APEXMOTION
-- ============================================================================

-- 1. Người dùng (Admin & Khách hàng mẫu theo Hình 3.2)
INSERT INTO users (id, email, password_hash, full_name, phone, avatar_url, role, occupation) VALUES
('USR-ADMIN-001', 'admin@apexmotion.vn', '$2a$10$ApexAdminHash1234567890', 'Quản Trị Viên ApexMotion', '0901234567', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'ADMIN', 'Quản trị hệ thống'),
('TV-008246', 'minhanh@apexmotion.vn', '$2a$10$CustomerHash1234567890', 'Nguyễn Minh Anh', '0987654321', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', 'CUSTOMER', 'Trưởng nhóm marketing'),
('TV-008247', 'quangnd@apexmotion.vn', '$2a$10$CustomerHash1234567890', 'Nguyễn Đức Quang', '0912345678', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200', 'CUSTOMER', 'Vận động viên bán chuyên');

-- 2. Địa chỉ giao hàng (addresses)
INSERT INTO addresses (id, receiver_name, receiver_phone, province, district, ward, street_address, is_default, user_id) VALUES
('ADDR-001', 'Nguyễn Minh Anh', '0987654321', 'Đà Nẵng', 'Quận Hải Châu', 'Phường Thạch Thang', '128 Nguyễn Văn Linh', TRUE, 'TV-008246'),
('ADDR-002', 'Nguyễn Minh Anh', '0987654321', 'Hà Nội', 'Quận Bắc Từ Liêm', 'Phường Minh Khai', 'Số 298 Cầu Diễn', FALSE, 'TV-008246'),
('ADDR-003', 'Nguyễn Đức Quang', '0912345678', 'Hà Nội', 'Quận Cầu Giấy', 'Phường Dịch Vọng', 'Số 85 Xuân Thủy', TRUE, 'TV-008247');

-- 3. Danh mục sản phẩm (categories)
INSERT INTO categories (id, name, slug, description, img_url, display_order) VALUES
('CAT-SHOES', 'Giày Chạy Bộ & Thể Thao', 'giay-chay-bo', 'Giày chạy bộ marathon, chạy địa hình và tập luyện hiệu suất cao', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 1),
('CAT-APPAREL', 'Trang Phục Tập Gym & Thể Thao', 'trang-phuc-the-thao', 'Áo thun thể thao, quần chạy bộ thoáng khí công nghệ Dry-Fit', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600', 2),
('CAT-BADMINTON', 'Vợt & Phụ Kiện Cầu Lông', 'vot-cau-long', 'Vợt cầu lông chuyên nghiệp, cầu lông, túi đựng và phụ kiện sân đấu', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600', 3),
('CAT-EQUIP', 'Dụng Cụ Tập Luyện & Phụ Kiện', 'dung-cu-the-thao', 'Tạ tay, thảm yoga, bình nước thể thao, đồng hồ bấm giờ và băng bảo vệ', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600', 4);

-- 4. Sản phẩm (products) - Bao gồm các SP trong Hình 3.3, 3.4, 3.5, 3.6, 3.7
INSERT INTO products (id, name, slug, description, brand, base_price, thumbnail_url, avg_rating, review_count, category_id) VALUES
('SP-001', 'Vợt cầu lông Yonex Astrox 77 Pro', 'vot-cau-long-yonex-astrox-77', 'Vợt cầu lông chuyên công thiên về sức mạnh đập cầu, thân vợt Namd đàn hồi cao, phù hợp người chơi phong trào nâng cao và bán chuyên.', 'Yonex', 250000, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600', 4.9, 18, 'CAT-BADMINTON'),
('SP-002', 'Áo thể thao Apex Dry-Fit Pro', 'ao-the-thao-apex-dry-fit-pro', 'Áo thun tập gym và chạy bộ chất liệu Polyester pha Spandex siêu nhẹ, thấm hút mồ hôi nhanh và kháng khuẩn khử mùi.', 'ApexMotion', 350000, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600', 4.8, 24, 'CAT-APPAREL'),
('SP-003', 'Giày Thể Thao Apex Velocity X', 'giay-the-thao-apex-velocity-x', 'Giày thể thao đa năng hỗ trợ tập gym, đi bộ và chạy cự ly ngắn 5km-10km, đệm EVA êm ái chống trượt.', 'ApexMotion', 500000, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 4.7, 15, 'CAT-SHOES'),
('SP-004', 'Apex Nitro Pro v2 - Royal Blue', 'apex-nitro-pro-v2-blue', 'Giày chạy bộ marathon nam/nữ tích hợp đệm bọt Nitơ siêu nảy và tấm sợi Carbon hỗ trợ bứt tốc cự ly 21km - 42km, giá dưới 2 triệu.', 'ApexMotion', 1650000, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600', 5.0, 32, 'CAT-SHOES'),
('SP-005', 'Apex Nitro Pro v2 - Silver Edition', 'apex-nitro-pro-v2-silver', 'Phiên bản màu bạc phản quang của dòng giày chạy bộ đường dài Apex Nitro Pro v2, cổ giày ôm chân, thoáng khí tối đa cho chạy marathon.', 'ApexMotion', 1650000, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600', 4.9, 19, 'CAT-SHOES'),
('SP-006', 'Giày Chạy Bộ Nam Slip-On PEAK TAICHI ET59305H', 'giay-chay-bo-nam-slip-on-peak-taichi-et59305h', 'Giày chạy bộ không dây tiện lợi sử dụng công nghệ đệm thông minh PEAK TAICHI tự thích ứng theo tốc độ bước chạy.', 'PEAK', 999000, 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600', 4.8, 27, 'CAT-SHOES'),
('SP-007', 'Bộ Đồ Tập Gym Nam Compression Pro', 'bo-do-tap-gym-nam-compression-pro', 'Bộ quần áo tập gym ôm cơ co giãn 4 chiều giúp cố định cơ bắp, giảm chấn thương khi nâng tạ nặng và cardio cường độ cao.', 'ApexMotion', 590000, 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600', 4.8, 14, 'CAT-APPAREL'),
('SP-008', 'Thảm Tập Yoga & Fitness TPE 8mm Cao Cấp', 'tham-tap-yoga-fitness-tpe-8mm', 'Thảm tập TPE 2 lớp chống trượt tuyệt đối, độ dày 8mm bảo vệ khớp gối và cột sống khi tập Yoga, Pilates và Plank tại nhà.', 'ApexMotion', 420000, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600', 4.9, 21, 'CAT-EQUIP');

-- 5. Hình ảnh sản phẩm (product_images)
INSERT INTO product_images (id, image_url, is_primary, display_order, product_id) VALUES
('IMG-001', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800', TRUE, 1, 'SP-001'),
('IMG-002', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', TRUE, 1, 'SP-002'),
('IMG-003', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', TRUE, 1, 'SP-003'),
('IMG-004', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800', TRUE, 1, 'SP-004'),
('IMG-005', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800', TRUE, 1, 'SP-005'),
('IMG-006', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800', TRUE, 1, 'SP-006'),
('IMG-007', 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800', TRUE, 1, 'SP-007'),
('IMG-008', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800', TRUE, 1, 'SP-008');

-- 6. Biến thể sản phẩm (product_variants)
INSERT INTO product_variants (id, size, color, sku, price, stock_quantity, product_id) VALUES
('VAR-001-4U', '4U (83g)', 'Đỏ Đen', 'YNX-AX77-4U', 250000, 30, 'SP-001'),
('VAR-001-3U', '3U (88g)', 'Vàng Xanh', 'YNX-AX77-3U', 250000, 20, 'SP-001'),
('VAR-002-M', 'M', 'Đen', 'APX-DRY-M-BLK', 350000, 15, 'SP-002'),
('VAR-002-L', 'L', 'Xanh Navy', 'APX-DRY-L-NVY', 350000, 15, 'SP-002'),
('VAR-003-41', '41', 'Đỏ Trắng', 'APX-VEL-41', 500000, 8, 'SP-003'),
('VAR-003-42', '42', 'Đỏ Trắng', 'APX-VEL-42', 500000, 7, 'SP-003'),
('VAR-004-41', '41', 'Xanh Royal', 'APX-NP2-BL-41', 1650000, 12, 'SP-004'),
('VAR-004-42', '42', 'Xanh Royal', 'APX-NP2-BL-42', 1650000, 20, 'SP-004'),
('VAR-004-43', '43', 'Xanh Royal', 'APX-NP2-BL-43', 1650000, 10, 'SP-004'),
('VAR-005-42', '42', 'Bạc Trắng', 'APX-NP2-SV-42', 1650000, 18, 'SP-005'),
('VAR-005-40', '40', 'Bạc Trắng', 'APX-NP2-SV-40', 1650000, 14, 'SP-005'),
('VAR-006-39', '39', 'Đen ghi trắng', 'PEAK-TC-39', 999000, 15, 'SP-006'),
('VAR-006-42', '42', 'Đen ghi trắng', 'PEAK-TC-42', 999000, 12, 'SP-006'),
('VAR-007-L', 'L', 'Đen Xám', 'APX-COMP-L', 590000, 22, 'SP-007'),
('VAR-007-XL', 'XL', 'Đen Xám', 'APX-COMP-XL', 590000, 18, 'SP-007'),
('VAR-008-STD', '183x61cm (8mm)', 'Xanh Ngọc', 'APX-YOGA-8MM', 420000, 40, 'SP-008');

-- 7. Vector nhúng ngữ nghĩa sản phẩm (product_embeddings)
INSERT INTO product_embeddings (id, content_text, product_id) VALUES
('EMB-001', 'Vợt cầu lông Yonex Astrox 77 Pro chuyên công đập cầu mạnh mẽ giá 250000đ size 3U 4U', 'SP-001'),
('EMB-002', 'Áo thể thao Apex Dry-Fit Pro tập gym chạy bộ thoáng khí thấm mồ hôi giá 350000đ size M L', 'SP-002'),
('EMB-003', 'Giày Thể Thao Apex Velocity X chạy bộ tập gym giá rẻ dưới 1 triệu 500000đ size 41 42', 'SP-003'),
('EMB-004', 'Giày chạy bộ nam nữ marathon Apex Nitro Pro v2 màu xanh Royal Blue size 41 42 43 dưới 2 triệu giá 1650000đ đệm carbon', 'SP-004'),
('EMB-005', 'Giày chạy bộ nam nữ marathon Apex Nitro Pro v2 Silver Edition màu bạc size 40 42 dưới 2 triệu giá 1650000đ ưu đãi hot', 'SP-005'),
('EMB-006', 'Giày Chạy Bộ Nam Slip-On PEAK TAICHI ET59305H đen ghi trắng size 39 42 giá 999000đ dưới 1 triệu êm chân', 'SP-006'),
('EMB-007', 'Bộ đồ tập gym nam Compression Pro co giãn 4 chiều nâng tạ cardio giá 590000đ size L XL', 'SP-007'),
('EMB-008', 'Thảm tập Yoga Fitness TPE 8mm chống trượt tập tại nhà giá 420000đ ưu đãi hot', 'SP-008');

-- 8. Đơn hàng mẫu (orders & order_items)
INSERT INTO orders (id, receiver_name, receiver_phone, shipping_address, subtotal, shipping_fee, total_amount, status, payment_method, payment_status, note, user_id) VALUES
('ORD-2026-001', 'Nguyễn Minh Anh', '0987654321', '128 Nguyễn Văn Linh, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng', 999000, 0, 999000, 'COMPLETED', 'QR', 'PAID', 'Giao giờ hành chính', 'TV-008246'),
('ORD-2026-002', 'Nguyễn Minh Anh', '0987654321', '128 Nguyễn Văn Linh, Phường Thạch Thang, Quận Hải Châu, Đà Nẵng', 1650000, 30000, 1680000, 'SHIPPING', 'COD', 'UNPAID', 'Gọi trước khi giao 15 phút', 'TV-008246'),
('ORD-2026-003', 'Nguyễn Đức Quang', '0912345678', 'Số 85 Xuân Thủy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội', 600000, 0, 600000, 'COMPLETED', 'VNPAY', 'PAID', 'Đóng gói kỹ vợt cầu lông', 'TV-008247');

INSERT INTO order_items (id, product_name, variant_info, unit_price, quantity, product_variant_id, order_id) VALUES
('OIT-001', 'Giày Chạy Bộ Nam Slip-On PEAK TAICHI ET59305H', 'Đen ghi trắng / 39', 999000, 1, 'VAR-006-39', 'ORD-2026-001'),
('OIT-002', 'Apex Nitro Pro v2 - Royal Blue', 'Xanh Royal / 42', 1650000, 1, 'VAR-004-42', 'ORD-2026-002'),
('OIT-003', 'Vợt cầu lông Yonex Astrox 77 Pro', 'Đỏ Đen / 4U (83g)', 250000, 1, 'VAR-001-4U', 'ORD-2026-003'),
('OIT-004', 'Áo thể thao Apex Dry-Fit Pro', 'Đen / M', 350000, 1, 'VAR-002-M', 'ORD-2026-003');

-- 9. Đánh giá sản phẩm (reviews)
INSERT INTO reviews (id, rating, comment, user_id, order_item_id, product_id) VALUES
('REV-001', 5, 'Giày PEAK TAICHI đi cực kỳ êm chân, form Slip-On xỏ vào rất tiện khi đi chạy bộ buổi sáng!', 'TV-008246', 'OIT-001', 'SP-006'),
('REV-002', 5, 'Vợt cầu lông cầm đầm tay, đập cầu rất thoát và chắc chắn. Giao hàng nhanh!', 'TV-008247', 'OIT-003', 'SP-001'),
('REV-003', 5, 'Áo Dry-Fit mặc mát, tập gym không bị bí mồ hôi. Sẽ ủng hộ ApexMotion thêm.', 'TV-008247', 'OIT-004', 'SP-002');

-- 10. Lịch sử Chatbot AI mẫu (chat_sessions & chat_messages theo Hình 3.3)
INSERT INTO chat_sessions (id, title, user_id) VALUES
('CHAT-SES-001', 'Tư vấn giày chạy nam size 42 < 2tr', 'TV-008246');

INSERT INTO chat_messages (id, role, content, product_ids_json, chat_session_id) VALUES
('MSG-001', 'ASSISTANT', 'Xin chào! Tôi có thể tư vấn giày chạy bộ hoặc trang phục thể thao cho bạn.', '[]', 'CHAT-SES-001'),
('MSG-002', 'USER', 'Tư vấn giày chạy nam size 42 < 2tr', '[]', 'CHAT-SES-001'),
('MSG-003', 'ASSISTANT', 'Dựa trên nhu cầu giày chạy bộ nam size 42 với ngân sách dưới 2 triệu đồng, hệ thống RAG AI gợi ý cho bạn 2 mẫu Apex Nitro Pro v2 đang có sẵn size 42 với đệm Nitơ êm ái và hỗ trợ chạy đường dài tốt nhất:', '["SP-004","SP-005"]', 'CHAT-SES-001');
