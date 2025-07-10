import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vacancyAPI } from "../services/api";
import styles from "../styles/Card.module.css";

function VacancyManagement() {
  const [vacancies, setVacancies] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyVacancies = async () => {
      try {
        const res = await vacancyAPI.getMyVacancies();
        setVacancies(res.data);
      } catch (err) {
        const errorMessage = err.message || err.response?.data || "Ошибка при загрузке вакансий";
        setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при загрузке вакансий");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyVacancies();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту вакансию?")) {
      return;
    }

    try {
      await vacancyAPI.deleteVacancy(id);
      setVacancies(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      const errorMessage = err.message || err.response?.data || "Ошибка при удалении вакансии";
      setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при удалении вакансии");
    }
  };

  if (loading) return <div className={styles.container}><div className={styles.emptyState}>Загрузка вакансий...</div></div>;

  return (
    <div className={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Мои вакансии</h2>
        <Link
          to="/vacancy/create"
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px"
          }}
        >
          Создать вакансию
        </Link>
      </div>
      
      {error && <div style={{ color: "#dc3545", textAlign: "center", marginBottom: "20px" }}>{error}</div>}
      
      {vacancies.length === 0 ? (
        <div className={styles.emptyState}>
          У вас нет вакансий. <Link to="/vacancy/create" style={{ color: "#007bff" }}>Создать первую</Link>
        </div>
      ) : (
        vacancies.map(vacancy => (
          <div key={vacancy.id} className={styles.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <h4>{vacancy.title}</h4>
                <p><b>Описание:</b> {vacancy.description}</p>
                <p><b>Город:</b> {vacancy.city}</p>
              </div>
              <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
                <Link
                  to={`/vacancy/edit/${vacancy.id}`}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#007bff",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontSize: "14px"
                  }}
                >
                  Редактировать
                </Link>
                <button
                  onClick={() => handleDelete(vacancy.id)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default VacancyManagement;