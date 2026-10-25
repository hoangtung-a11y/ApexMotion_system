import React, { useState, useRef, useEffect } from 'react'
import { Activity, Send, ShoppingCart, Sparkles, X, Minus, MessageSquare, Cpu } from 'lucide-react'
import { ApexDatabase, ChatMessage, Product } from '../types/models'
import { processRagQuery } from '../services/ragChatbotService'

interface ChatbotAIWidgetProps {
  db: ApexDatabase
  currentUserId: string | null
  onSendMessage: (userMsg: ChatMessage, botMsg: ChatMessage, sessionId: string) => void
  onAddToCartFromChat: (product: Product, preferredSize?: string) => void
  onSelectProduct: (product: Product) => void
}

export const ChatbotAIWidget: React.FC<ChatbotAIWidgetProps> = ({
  db,
  currentUserId,
  onSendMessage,
  onAddToCartFromChat,
  onSelectProduct,
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputText, setInputText] = useState('')
  const [showRagTrace, setShowRagTrace] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeSessionId = 'CHAT-SES-001'
  const messages = db.chat_messages.filter((m) => m.chat_session_id === activeSessionId)

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isOpen, isMinimized])

  const handleSend = (textToProcess?: string) => {
    const query = (textToProcess ?? inputText).trim()
    if (!query) return

    const now = new Date().toISOString()
    const userMessage: ChatMessage = {
      id: `MSG-U-${Date.now()}`,
      role: 'USER',
      content: query,
      product_ids_json: '[]',
      created_at: now,
      chat_session_id: activeSessionId,
    }

    const ragResult = processRagQuery(query, db)

    const botMessage: ChatMessage = {
      id: `MSG-B-${Date.now() + 1}`,
      role: 'ASSISTANT',
      content: ragResult.replyText,
      product_ids_json: JSON.stringify(ragResult.recommendedProducts.map((p) => p.id)),
      recommended_size: ragResult.recommendedSize,
      rag_trace: ragResult.ragTrace,
      created_at: new Date(Date.now() + 300).toISOString(),
      chat_session_id: activeSessionId,
    }

    onSendMessage(userMessage, botMessage, activeSessionId)
    if (!textToProcess) setInputText('')
  }

  const quickChips = [
    { label: '👟 Giày chạy marathon', query: 'Tư vấn giày chạy nam size 42 < 2tr' },
    { label: '🏋️ Đồ tập gym', query: 'Tư vấn đồ tập gym nam thoáng khí' },
    { label: '🔥 Ưu đãi hot', query: 'Gợi ý các sản phẩm thể thao ưu đãi hot đánh giá cao' },
    { label: '🏸 Vợt cầu lông', query: 'Tìm vợt cầu lông Yonex dưới 500k' },
  ]

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full bg-slate-900 px-5 py-3.5 text-white shadow-2xl ring-2 ring-blue-500/40 transition hover:scale-105 hover:bg-slate-800"
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
          <Activity className="h-5 w-5 text-white" />
          <span className="absolute -right-1 -top-1 rounded bg-blue-500 px-1 text-[10px] font-bold">AI</span>
        </div>
        <div className="text-left">
          <div className="text-sm font-bold leading-tight">ApexMotion AI</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Tư vấn RAG trực tuyến
          </div>
        </div>
      </button>
    )
  }

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 w-[390px] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 transition-all duration-200 ${
        isMinimized ? 'h-[76px]' : 'h-[610px] max-h-[calc(100vh-2.5rem)]'
      } flex flex-col`}
    >
      {/* Header theo Hình 3.3: ApexMotion AI Assistant */}
      <div className="flex items-center justify-between bg-[#0f172a] px-5 py-4 text-white shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 ring-1 ring-white/10">
            <Activity className="h-6 w-6 text-blue-400" />
            <span className="absolute -bottom-1 -right-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white shadow">
              AI
            </span>
          </div>
          <div>
            <h3 className="text-[15px] font-bold tracking-tight text-white">ApexMotion AI Assistant</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Online</span>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setShowRagTrace(!showRagTrace)}
                className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                title="Xem thông số truy vấn Vector pgvector (RAG)"
              >
                <Cpu className="h-3 w-3" />
                {showRagTrace ? 'Ẩn RAG Trace' : 'Xem RAG Trace'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Thu gọn khung chat"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Đóng khung chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Nội dung hội thoại */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/60">
            {messages.map((msg, idx) => {
              let recommendedIds: string[] = []
              try {
                recommendedIds = JSON.parse(msg.product_ids_json || '[]')
              } catch {
                recommendedIds = []
              }
              const recommendedProducts = recommendedIds
                .map((pid) => db.products.find((p) => p.id === pid))
                .filter((p): p is Product => Boolean(p))

              return (
                <div key={msg.id} className="space-y-2.5">
                  {msg.role === 'ASSISTANT' ? (
                    <div className="space-y-2.5">
                      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm">
                        {msg.content}
                      </div>

                      {/* Hiển thị các chip gợi ý nhanh ngay dưới câu chào đầu tiên (Hình 3.3) */}
                      {idx === 0 && (
                        <div className="flex flex-wrap gap-2 pt-0.5">
                          {quickChips.map((chip) => (
                            <button
                              key={chip.label}
                              type="button"
                              onClick={() => handleSend(chip.query)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* RAG Vector Trace (Tùy chọn bật để kiểm thử kỹ thuật theo Hình 2.10) */}
                      {showRagTrace && msg.rag_trace && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-2.5 text-[11px] text-slate-700 space-y-1">
                          <div className="font-bold text-blue-800 flex items-center gap-1">
                            <Cpu className="h-3.5 w-3.5" />
                            Pipeline RAG (pgvector 1536-dim Cosine Similarity):
                          </div>
                          <div>
                            • <strong>Keywords:</strong> {msg.rag_trace.extracted_keywords.join(', ')}
                          </div>
                          {msg.rag_trace.max_price && (
                            <div>
                              • <strong>Lọc giá:</strong> &le; {msg.rag_trace.max_price.toLocaleString('vi-VN')} ₫
                            </div>
                          )}
                          {msg.rag_trace.size_filter && (
                            <div>
                              • <strong>Lọc biến thể Size:</strong> {msg.rag_trace.size_filter}
                            </div>
                          )}
                          <div>
                            • <strong>Điểm tương đồng Cosine:</strong>{' '}
                            {msg.rag_trace.cosine_scores.map((c) => `${c.product_id} (${c.score})`).join(' | ')}
                          </div>
                        </div>
                      )}

                      {/* Danh sách thẻ sản phẩm gợi ý (Carousel ngang theo Hình 3.3) */}
                      {recommendedProducts.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            <span>Gợi ý phù hợp với bạn · {recommendedProducts.length} sản phẩm</span>
                          </div>

                          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                            {recommendedProducts.map((product) => {
                              const variants = db.product_variants.filter((v) => v.product_id === product.id)
                              const displaySize =
                                msg.recommended_size ||
                                (variants.length > 0 ? `Size ${variants[0].size}` : 'Còn hàng')

                              return (
                                <div
                                  key={product.id}
                                  className="min-w-[215px] max-w-[215px] snap-start rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm transition hover:shadow-md flex flex-col justify-between"
                                >
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => onSelectProduct(product)}
                                      className="block w-full overflow-hidden rounded-xl bg-slate-100 h-28"
                                    >
                                      <img
                                        src={product.thumbnail_url}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition hover:scale-105"
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onSelectProduct(product)}
                                      className="mt-2.5 text-left text-sm font-bold text-slate-900 line-clamp-1 hover:text-blue-600"
                                    >
                                      {product.name}
                                    </button>
                                    <div className="mt-1.5 flex items-center justify-between">
                                      <span className="text-sm font-extrabold text-blue-600 underline decoration-blue-600/40">
                                        {product.base_price.toLocaleString('vi-VN')} ₫
                                      </span>
                                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                                        {displaySize}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onAddToCartFromChat(
                                        product,
                                        msg.recommended_size?.replace('Size ', '')
                                      )
                                    }
                                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
                                  >
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    <span>Add to Cart</span>
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm">
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập câu hỏi tư vấn theo Hình 3.3 */}
          <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-2.5 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 pl-4 pr-1.5 py-1 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập câu hỏi tư vấn..."
                aria-label="Nhập câu hỏi tư vấn cho trợ lý AI"
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow transition hover:bg-blue-700"
                aria-label="Gửi tin nhắn tư vấn"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-1.5 text-center text-[11px] font-medium text-slate-400">
              Powered by ApexMotion RAG AI
            </div>
          </div>
        </>
      )}
    </div>
  )
}
