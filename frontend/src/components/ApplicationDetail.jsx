import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { applicationAPI } from "../services/api";
import Chat from "./Chat";
import styles from "../styles/Card.module.css";

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
          id: parseInt(
            payload[
              "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            ]
          ),
          role: payload[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ],
        });
      } catch (err) {
        console.error("Failed to parse token", err);
      }
    }

    const fetchApplication = async () => {
      try {
        const res = await applicationAPI.getApplication(id);
        setApplication(res.data);
      } catch (err) {
        const errorMessage =
          err.message || err.response?.data || "Ошибка при загрузке отклика";
        setError(
          typeof errorMessage === "string"
            ? errorMessage
            : "Ошибка при загрузке отклика"
        );
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
      setError(
        typeof errorMessage === "string"
          ? errorMessage
          : "Ошибка при обновлении статуса"
      );
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
        <div style={{ color: "#dc3545" }}>{error}</div>
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
      <div style={{ marginBottom: "20px" }}>
        <h2>Отклик на вакансию</h2>

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#fff",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0" }}>{application.vacancyTitle}</h3>
          <p>
            <strong>Кандидат:</strong> {application.candidateName}
          </p>
          {application.candidateResume && (
            <div style={{ margin: "15px 0" }}>
              <strong>Резюме кандидата:</strong>
              <div
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  background: "#f8f9fa",
                  padding: "10px",
                  marginTop: "5px",
                }}
              >
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
              style={{
                marginLeft: "10px",
                padding: "4px 8px",
                borderRadius: "4px",
                backgroundColor: getStatusColor(application.status),
                color: "white",
                fontSize: "12px",
              }}
            >
              {getStatusText(application.status)}
            </span>
          </p>

          {currentUser && currentUser.role === "Employer" && (
            <div style={{ marginTop: "15px" }}>
              <strong>Изменить статус:</strong>
              <div
                style={{
                  marginTop: "5px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { value: 2, label: "Принять", color: "#28a745" },
                  { value: 3, label: "Отклонить", color: "#dc3545" },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusUpdate(status.value)}
                    disabled={application.status === status.value}
                    style={{
                      padding: "5px 10px",
                      backgroundColor:
                        application.status === status.value
                          ? status.color
                          : "white",
                      color:
                        application.status === status.value
                          ? "white"
                          : status.color,
                      border: `1px solid ${status.color}`,
                      borderRadius: "4px",
                      cursor:
                        application.status === status.value
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "12px",
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
          <Chat
            vacancyId={application.vacancyId}
            candidateId={application.candidateId}
            currentUserId={currentUser.id}
          />
        )}
      </div>
    </div>
  );
}

export default ApplicationDetail;
