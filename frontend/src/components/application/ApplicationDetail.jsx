import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { applicationAPI } from "../../api/api";
import Chat from "../chat/Chat";
import styles from "./ApplicationDetail.module.css";

function ApplicationDetail() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUser({
          id: parseInt(payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]),
          role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        });
      } catch (err) {
        // ignore
      }
    }

    const fetchApplication = async () => {
      try {
        const res = await applicationAPI.getApplication(id);
        setApplication(res.data);
      } catch (err) {
        const errorMessage =
          err.message || err.response?.data || "Ошибка при загрузке отклика";
        setError(typeof errorMessage === "string" ? errorMessage : "Ошибка при загрузке отклика");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await applicationAPI.updateApplicationStatus(id, newStatus);
      setApplication((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      const errorMessage =
        err.message || err.response?.data || "Ошибка при обновлении статуса";
      setError(typeof errorMessage === "string" ? errorMessage : "Ошибка при обновлении статуса");
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      0: "Новый",
      1: "Отозван",
      2: "Принят",
      3: "Отклонен",
    };
    return statusMap[status] || "Неизвестно";
  };

  const getStatusColor = (status) => {
    const colorMap = {
      0: "#6c757d", // New - gray
      1: "#ffc107", // Withdrawn - yellow
      2: "#28a745", // Accepted - green
      3: "#dc3545", // Rejected - red
    };
    return colorMap[status] || "#6c757d";
  };

  if (loading)
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Загрузка...</div>
      </div>
    );
  if (error)
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  if (!application)
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Отклик не найден</div>
      </div>
    );

  return (
    <div className={styles.container}>
      <div className={styles.applicationCard}>
        <h2>Отклик на вакансию</h2>
        <div className={styles.infoBlock}>
          <h3>{application.vacancyTitle}</h3>
          <p>
            <strong>Кандидат:</strong>{" "}
            {application.candidateId ? (
              <Link to={`/user/${application.candidateId}`}>{application.candidateName}</Link>
            ) : (
              application.candidateName
            )}
          </p>
          {application.candidateResume && (
            <div className={styles.resumeBox}>
              <strong>Резюме кандидата:</strong>
              <div className={styles.resumeText}>
                {application.candidateResume}
              </div>
            </div>
          )}
          <p>
            <strong>Дата отклика:</strong>{" "}
            {new Date(application.appliedAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Статус:</strong>
            <span
              className={styles.status}
              style={{
                backgroundColor: getStatusColor(application.status),
              }}
            >
              {getStatusText(application.status)}
            </span>
          </p>
          {currentUser && currentUser.role === "Employer" && (
            <div className={styles.statusControls}>
              <strong>Изменить статус:</strong>
              <div className={styles.statusBtnRow}>
                {[
                  { value: 2, label: "Принять", color: "#28a745" },
                  { value: 3, label: "Отклонить", color: "#dc3545" },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusUpdate(status.value)}
                    disabled={application.status === status.value}
                    className={styles.statusBtn}
                    style={{
                      backgroundColor: application.status === status.value ? status.color : "white",
                      color: application.status === status.value ? "white" : status.color,
                      borderColor: status.color,
                    }}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {currentUser && application && (
          <div className={styles.chatBlock}>
            <Chat
              vacancyId={application.vacancyId}
              candidateId={application.candidateId}
              currentUserId={currentUser.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicationDetail;