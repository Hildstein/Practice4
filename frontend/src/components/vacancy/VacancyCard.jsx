import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { applicationAPI } from "../../api/api";
import styles from "./VacancyCard.module.css";

function VacancyCard({ vacancy }) {
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
          role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
          name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        });
      } catch (err) {}
    }
  }, []);

  useEffect(() => {
    const checkApplication = async () => {
      if (!currentUser || currentUser.role !== "Candidate") return;
      try {
        const res = await applicationAPI.getApplications();
        const userApplications = res.data.filter(app => app.VacancyId === vacancy.id);
        if (userApplications.length > 0) {
          const latestApp = userApplications[0];
          if (latestApp.status === 0 || latestApp.status === 2) {
            setApplicationStatus('active');
          } else if (latestApp.status === 1 || latestApp.status === 3) {
            setApplicationStatus('can_reapply');
          }
        }
      } catch (err) {}
    };
    checkApplication();
  }, [currentUser, vacancy.id]);

  const handleApply = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setIsApplying(true);
    setError("");
    try {
      await applicationAPI.createApplication({
        VacancyId: vacancy.id,
        VacancyTitle: vacancy.title, 
        CandidateName: currentUser.name
      });
      setApplicationStatus('active');
    } catch (err) {
      const errorMessage = err.message || err.response?.data || "Ошибка при отправке отклика";
      setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при отправке отклика");
    } finally {
      setIsApplying(false);
    }
  };

  const isOwnVacancy = currentUser && vacancy.employerId === currentUser.id;
  const shouldShowApplyButton = currentUser && currentUser.role === "Candidate" && !isOwnVacancy;

  const getApplyButtonState = () => {
    if (applicationStatus === 'active') {
      return { disabled: true, text: "Отклик отправлен", color: "#28a745", showCheckmark: true };
    } else if (applicationStatus === 'can_reapply') {
      return { disabled: false, text: "Откликнуться повторно", color: "#007bff", showCheckmark: false };
    } else {
      return { disabled: false, text: "Откликнуться", color: "#28a745", showCheckmark: false };
    }
  };
  const buttonState = getApplyButtonState();

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{vacancy.title}</h3>
      <p>
        <b>Работодатель:</b>{" "}
        {vacancy.employerId ? (
          <Link to={`/user/${vacancy.employerId}`}>
            {vacancy.employerName || "Неизвестно"}
          </Link>
        ) : (
          vacancy.employerName || "Неизвестно"
        )}
      </p>
      <p><b>Описание:</b> {vacancy.description}</p>
      <p className={styles.city}><b>Город:</b> {vacancy.city}</p>
      {shouldShowApplyButton && (
        <>
          <button 
            onClick={handleApply}
            disabled={isApplying || buttonState.disabled}
            className={styles.detailsBtn}
            style={{ backgroundColor: buttonState.disabled ? "#6c757d" : buttonState.color }}
          >
            {isApplying ? "Отправка..." : buttonState.text}
            {buttonState.showCheckmark && " ✓"}
          </button>
          {error && (
            <div style={{ marginTop: "8px", color: "#dc3545", fontSize: "14px" }}>
              {error}
            </div>
          )}
        </>
      )}
      {isOwnVacancy && currentUser && (
        <div style={{ marginTop: "10px", color: "#6c757d", fontSize: "14px", fontStyle: "italic" }}>
          Это ваша вакансия
        </div>
      )}
      {!currentUser && (
        <p style={{ marginTop: "10px", fontSize: "14px", color: "#666" }}>
          <a href="/login" style={{ color: "#007bff" }}>Войдите</a>, чтобы откликнуться на вакансию
        </p>
      )}
    </div>
  );
}

export default VacancyCard;