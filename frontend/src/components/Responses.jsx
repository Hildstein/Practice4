import { useState, useEffect } from "react";
import { applicationAPI } from "../services/api";
import { Link } from "react-router-dom";
import Chat from "./Chat";
import styles from "../styles/Card.module.css";

function Responses() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [openedChats, setOpenedChats] = useState({}); // { [applicationId]: true }

  useEffect(() => {
    // Get current user from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
          role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        });
      } catch (err) {
        console.error('Failed to parse token', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await applicationAPI.getApplications();
        setApplications(res.data);
      } catch (err) {
        const errorMessage = err.message || err.response?.data || "Ошибка при загрузке откликов";
        setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при загрузке откликов");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    if (!window.confirm("Вы уверены, что хотите отозвать отклик?")) return;
    setWithdrawing(applicationId);
    try {
      await applicationAPI.withdrawApplication(applicationId);
      // Refresh applications list
      const res = await applicationAPI.getApplications();
      setApplications(res.data);
      setError("");
    } catch (err) {
      const errorMessage = err.message || err.response?.data || "Ошибка при отзыве отклика";
      setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при отзыве отклика");
    } finally {
      setWithdrawing(null);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: "Новый",
      1: "Отозван",
      2: "Принят",
      3: "Отклонен"
    };
    return statusMap[status] || "Неизвестно";
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: "#6c757d", // New - gray
      1: "#ffc107", // Withdrawn - yellow
      2: "#28a745", // Accepted - green
      3: "#dc3545"  // Rejected - red
    };
    return colorMap[status] || "#6c757d";
  };

  const toggleChat = (id) => {
    setOpenedChats(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) return <div className={styles.container}><div className={styles.emptyState}>Загрузка откликов...</div></div>;

  return (
    <div className={styles.container}>
      <h2>{currentUser?.role === "Employer" ? "Отклики на мои вакансии" : "Мои отклики"}</h2>
      {error && <div style={{ color: "#dc3545", textAlign: "center", marginBottom: "20px" }}>{error}</div>}
      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          {currentUser?.role === "Employer" 
            ? "Пока нет откликов на ваши вакансии." 
            : "У вас пока нет откликов."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {applications.map(app => (
            <div 
              key={app.id} 
              className={styles.card}
              style={{ position: "relative" }}
            >
              <h3 style={{ margin: "0 0 10px 0" }}>{app.vacancyTitle}</h3>
              <p>
                <strong>Кандидат:</strong> {app.candidateName}
                {currentUser?.role === "Employer" && (
                  <span style={{
                    marginLeft: "12px",
                    color: "#888",
                    fontStyle: "italic",
                    fontSize: "12px"
                  }}>
                    (ID: {app.candidateId})
                  </span>
                )}
              </p>
              <p><strong>Дата отклика:</strong> {new Date(app.appliedAt).toLocaleDateString()}</p>
              <p>
                <strong>Статус:</strong>
                <span style={{
                  marginLeft: "10px",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor: getStatusColor(app.status),
                  color: "white",
                  fontSize: "12px"
                }}>
                  {getStatusText(app.status)}
                </span>
              </p>
              <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
                <Link 
                  to={`/application/${app.id}`}
                  style={{
                    textDecoration: "none",
                    color: "#007bff",
                    fontWeight: "bold",
                    fontSize: "14px"
                  }}
                >
                  Подробнее
                </Link>
                {currentUser?.role === "Candidate" && app.status === 0 && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    disabled={withdrawing === app.id}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#ffc107",
                      color: "#333",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    {withdrawing === app.id ? "Отзываем..." : "Отозвать"}
                  </button>
                )}
                {currentUser?.role === "Employer" && (
                  <button
                    onClick={() => toggleChat(app.id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    {openedChats[app.id] ? "Скрыть чат" : "Открыть чат"}
                  </button>
                )}
              </div>
              {currentUser?.role === "Employer" && openedChats[app.id] && (
                <div style={{ marginTop: 16 }}>
                  <Chat
                    vacancyId={app.vacancyId}
                    candidateId={app.candidateId}
                    currentUserId={currentUser.id}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Responses;