package vn.edu.haui.apexmotion.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.haui.apexmotion.service.ChatbotAIService;

import java.util.Map;

/**
 * Các Controller điều phối nghiệp vụ theo mô hình MVC (Hình 3.1) và Sơ đồ trình tự (Hình 2.7 - 2.11):
 * - SuaThongTinCaNhanController
 * - XemSPTheoDanhMucController
 * - ThanhToanController (kèm kiểm tra bất thường giao dịch Isolation Forest)
 * - ChatController (/api/chat/send)
 * - QuanLySanPhamController
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApexMotionRestController {

    @Autowired
    private ChatbotAIService chatbotAIService;

    @PostMapping("/chat/send")
    public ResponseEntity<Map<String, Object>> sendChatMessage(@RequestBody Map<String, String> payload) {
        String userId = payload.getOrDefault("userId", "GUEST");
        String message = payload.getOrDefault("message", "");
        return ResponseEntity.ok(chatbotAIService.processUserMessage(userId, message));
    }
}
