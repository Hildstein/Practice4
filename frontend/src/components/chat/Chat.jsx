import { useState, useEffect, useRef } from "react";
import { messageAPI } from "../../api/api";
import styles from "./Chat.module.css";

// vacancyId, candidateId, currentUserId -- обязательные пропсы!
function Chat({ vacancyId, candidateId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Скролл вниз при изменении сообщений
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Загрузка сообщений
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
      <div className={styles.loading}>
        Загрузка чата...
      </div>
    );
  }

  return (
    <div className={styles.chatBox}>
      <div className={styles.header}>
        <h4>Чат</h4>
      </div>
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            Пока нет сообщений. Начните общение!
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={
                message.senderId === currentUserId
                  ? `${styles.message} ${styles.myMessage}`
                  : styles.message
              }
            >
              <div className={styles.sender}>
                {message.senderName}
              </div>
              <div>{message.content}</div>
              <div className={styles.time}>
                {new Date(message.sentAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className={styles.inputRow}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Введите сообщение..."
          maxLength={1000}
          disabled={sending}
          className={styles.input}
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className={styles.sendBtn}
        >
          {sending ? "..." : "Отправить"}
        </button>
      </form>
    </div>
  );
}

export default Chat;