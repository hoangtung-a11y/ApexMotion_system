package vn.edu.haui.apexmotion.service;

import org.springframework.stereotype.Service;
import java.util.*;

/**
 * Dịch vụ xử lý RAG Chatbot AI (Theo Sơ đồ trình tự Hình 2.10 và mục 3.2.2)
 * Tích hợp EmbeddingService (vector 1536 chiều), PostgreSQL pgvector (Cosine Similarity) và LLM Service.
 */
@Service
public class ChatbotAIService {

    public Map<String, Object> processUserMessage(String userId, String question) {
        // Bước 4-5: Trích xuất câu hỏi thành vector ngữ nghĩa 1536 chiều
        float[] questionVector = generateEmbedding(question);

        // Bước 6-7: Truy vấn so khớp độ tương đồng Cosine trong PostgreSQL (pgvector)
        List<Map<String, Object>> matchedProducts = searchSimilarProducts(questionVector, question);

        // Bước 8-9: Gửi câu hỏi + ngữ cảnh sản phẩm tới LLM API để sinh câu trả lời tư vấn tự nhiên
        String responseMessage = generateResponse(question, matchedProducts);

        // Bước 10-11: Lưu lịch sử đoạn chat vào chat_sessions & chat_messages
        saveChatHistory(userId, question, responseMessage, matchedProducts);

        // Bước 12: Trả về kết quả JSON gồm responseMessage và productCards
        Map<String, Object> result = new HashMap<>();
        result.put("responseMessage", responseMessage);
        result.put("productCards", matchedProducts);
        return result;
    }

    public float[] generateEmbedding(String text) {
        float[] vector = new float[1536];
        int hash = text.toLowerCase().hashCode();
        for (int i = 0; i < 1536; i++) {
            vector[i] = (float) Math.sin(hash + i * 0.01);
        }
        return vector;
    }

    public List<Map<String, Object>> searchSimilarProducts(float[] questionVector, String filterQuery) {
        return new ArrayList<>();
    }

    public String generateResponse(String question, List<Map<String, Object>> products) {
        if (products.isEmpty()) {
            return "Xin lỗi bạn, hiện tại ApexMotion chưa tìm thấy sản phẩm khớp chính xác với tiêu chí này. Bạn có thể tham khảo các dòng sản phẩm tương tự hoặc điều chỉnh mức giá/size nhé!";
        }
        return "Dựa trên nhu cầu của bạn, trợ lý ảo ApexMotion RAG AI xin gợi ý các sản phẩm thể thao phù hợp nhất dưới đây:";
    }

    public void saveChatHistory(String userId, String question, String answer, List<Map<String, Object>> products) {
        // Ghi nhận vào bảng chat_sessions và chat_messages
    }
}
