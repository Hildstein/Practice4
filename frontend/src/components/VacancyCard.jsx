import { useState, useEffect } from "react";
import { applicationAPI } from "../services/api";
import styles from "../styles/Card.module.css";

function VacancyCard({ vacancy }) {
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null); // null, 'active', 'can_reapply', 'applied_today'
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT payload:', payload);
        setCurrentUser({
          id: parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']),
          role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
          name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress']
        });
      } catch (err) {
        console.error('Failed to parse token', err);
      }
    }
  }, []);

  useEffect(() => {
    // Check if user has already applied to this vacancy
    const checkApplication = async () => {
      if (!currentUser || currentUser.role !== "Candidate") return;
      
      try {
        const res = await applicationAPI.getApplications();
        const userApplications = res.data.filter(app => app.VacancyId === vacancy.id);
        
        if (userApplications.length > 0) {
          const latestApp = userApplications[0]; // Assuming latest is first
          
          // Status mapping: 0: New, 1: Withdrawn, 2: Accepted, 3: Rejected
          if (latestApp.status === 0 || latestApp.status === 2) { // New or Accepted
            setApplicationStatus('active');
          } else if (latestApp.status === 1 || latestApp.status === 3) { // Withdrawn or Rejected
            setApplicationStatus('can_reapply');
          }
        }
      } catch (err) {
        console.error('Failed to check applications', err);
      }
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
      setApplicationStatus('active'); // Update status to show application was sent
    } catch (err) {
      const errorMessage = err.message || err.response?.data || "Ошибка при отправке отклика";
      setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при отправке отклика");
    } finally {
      setIsApplying(false);
    }
  };

  // Determine if user should see apply button and what state it should be in
  const isOwnVacancy = currentUser && vacancy.employerId === currentUser.id;
  const shouldShowApplyButton = currentUser && 
                                currentUser.role === "Candidate" && 
                                !isOwnVacancy;

  const getApplyButtonState = () => {
    if (applicationStatus === 'active') {
      return {
        disabled: true,
        text: "Отклик отправлен",
        color: "#28a745",
        showCheckmark: true
      };
    } else if (applicationStatus === 'can_reapply') {
      return {
        disabled: false,
        text: "Откликнуться повторно",
        color: "#007bff",
        showCheckmark: false
      };
    } else {
      return {
        disabled: false,
        text: "Откликнуться",
        color: "#28a745",
        showCheckmark: false
      };
    }
  };

  const buttonState = getApplyButtonState();

  return (
    <div className={styles.card}>
      <h3>{vacancy.title}</h3>
      <p><b>Работодатель:</b> {vacancy.employerName || "Неизвестно"}</p>
      <p><b>Описание:</b> {vacancy.description}</p>
      <p><b>Город:</b> {vacancy.city}</p>
      
      {shouldShowApplyButton && (
        <>
          <button 
            onClick={handleApply}
            disabled={isApplying || buttonState.disabled}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: buttonState.disabled ? "#6c757d" : buttonState.color,
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: (isApplying || buttonState.disabled) ? "not-allowed" : "pointer",
              opacity: isApplying ? 0.6 : 1
            }}
          >
            {isApplying ? "Отправка..." : buttonState.text}
            {buttonState.showCheckmark && " ✓"}
          </button>
          
          {error && (
            <div style={{ 
              marginTop: "8px", 
              color: "#dc3545", 
              fontSize: "14px" 
            }}>
              {error}
            </div>
          )}
        </>
      )}
      
      {isOwnVacancy && currentUser && (
        <div style={{ 
          marginTop: "10px", 
          color: "#6c757d", 
          fontSize: "14px",
          fontStyle: "italic"
        }}>
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