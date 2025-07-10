import { useState, useEffect, useRef } from "react";
import { messageAPI } from "../services/api";

// Пропсы: vacancyId, candidateId, currentUserId
function Chat({ vacancyId, candidateId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

    // Автоскролл вниз
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  console.log('vacancyId:', vacancyId, 'candidateId:', candidateId);

   // Загрузка сообщений при смене чата (vacancyId, candidateId)
  useEffect(() => {
    setLoading(true);
    setError("");
    const fetchMessages = async () => {
      try {
        const res = await messageAPI.getMessages(vacancyId, candidateId);
        setMessages(res.data);
      } catch (err) {
        const errorMessage = err.message || err.response?.data || "Ошибка при загрузке сообщений";
        setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при загрузке сообщений");
      } finally {
        setLoading(false);
      }
    };
    if (vacancyId && candidateId) fetchMessages();
  }, [vacancyId, candidateId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


 // Отправка сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    setError("");
    try {
      const res = await messageAPI.createMessage({
        vacancyId,
        candidateId,
        content: newMessage.trim()
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      const errorMessage = err.message || err.response?.data || "Ошибка при отправке сообщения";
      setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при отправке сообщения");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Загрузка чата...
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff" }}>
      <div style={{ 
        padding: "10px 15px", 
        borderBottom: "1px solid #ddd", 
        backgroundColor: "#f8f9fa",
        borderRadius: "8px 8px 0 0"
      }}>
        <h4 style={{ margin: 0 }}>Чат</h4>
      </div>
      
      {error && (
        <div style={{ 
          padding: "10px", 
          color: "#dc3545", 
          backgroundColor: "#f8d7da", 
          borderRadius: "4px",
          margin: "10px"
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        height: "300px", 
        overflowY: "auto", 
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#666", marginTop: "20px" }}>
            Пока нет сообщений. Начните общение!
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              style={{
                alignSelf: message.senderId === currentUserId ? "flex-end" : "flex-start",
                maxWidth: "70%",
                padding: "8px 12px",
                borderRadius: "12px",
                backgroundColor: message.senderId === currentUserId ? "#007bff" : "#e9ecef",
                color: message.senderId === currentUserId ? "white" : "black"
              }}
            >
              <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "2px" }}>
                {message.senderName}
              </div>
              <div>{message.content}</div>
              <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "2px" }}>
                {new Date(message.sentAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} style={{ 
        padding: "10px", 
        borderTop: "1px solid #ddd",
        display: "flex",
        gap: "10px"
      }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          maxLength={1000}
          disabled={sending}
          style={{
            flex: 1,
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px"
          }}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: sending || !newMessage.trim() ? "not-allowed" : "pointer",
            opacity: sending || !newMessage.trim() ? 0.7 : 1
          }}
        >
          {sending ? "..." : "Отправить"}
        </button>
      </form>
    </div>
  );
}

export default Chat;