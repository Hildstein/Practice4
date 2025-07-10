import { useState, useEffect } from "react";
import { applicationAPI } from "../../api/api";
import { Link } from "react-router-dom";
import Chat from "../chat/Chat";
import styles from "./Responses.module.css";

function Responses() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [openedChats, setOpenedChats] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
          role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        });
      } catch (err) {}
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
      0: "#6c757d",
      1: "#ffc107",
      2: "#28a745",
      3: "#dc3545"
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
      {error && <div className={styles.error}>{error}</div>}
      {applications.length === 0 ? (
        <div className={styles.emptyState}>
          {currentUser?.role === "Employer" 
            ? "Пока нет откликов на ваши вакансии." 
            : "У вас пока нет откликов."}
        </div>
      ) : (
        <div className={styles.list}>
          {applications.map(app => (
            <div key={app.id} className={styles.card}>
              <h3>{app.vacancyTitle}</h3>
              <p>
                <strong>Кандидат:</strong> {app.candidateName}
                {currentUser?.role === "Employer" && (
                  <span className={styles.candidateId}>(ID: {app.candidateId})</span>
                )}
              </p>
              <p><strong>Дата отклика:</strong> {new Date(app.appliedAt).toLocaleDateString()}</p>
              <p>
                <strong>Статус:</strong>
                <span
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(app.status) }}
                >
                  {getStatusText(app.status)}
                </span>
              </p>
              <div className={styles.actions}>
                <Link
                  to={`/application/${app.id}`}
                  className={styles.detailsBtn}
                >
                  Подробнее
                </Link>
                {currentUser?.role === "Candidate" && app.status === 0 && (
                  <button
                    onClick={() => handleWithdraw(app.id)}
                    disabled={withdrawing === app.id}
                    className={styles.withdrawBtn}
                  >
                    {withdrawing === app.id ? "Отзываем..." : "Отозвать"}
                  </button>
                )}
                {currentUser?.role === "Employer" && (
                  <button
                    onClick={() => toggleChat(app.id)}
                    className={styles.chatBtn}
                  >
                    {openedChats[app.id] ? "Скрыть чат" : "Открыть чат"}
                  </button>
                )}
              </div>
              {currentUser?.role === "Employer" && openedChats[app.id] && (
                <div className={styles.chatBlock}>
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