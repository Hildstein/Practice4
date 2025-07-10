import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { vacancyAPI } from "../services/api";
import styles from "../styles/Card.module.css";

function VacancyDetail() {
  const { id } = useParams();
  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    vacancyAPI.getVacancy(id)
      .then(res => setVacancy(res.data))
      .catch(() => setError("Ошибка при загрузке вакансии"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.container}><div className={styles.emptyState}>Загрузка...</div></div>;
  if (error) return <div className={styles.container}><div style={{ color: "#dc3545" }}>{error}</div></div>;
  if (!vacancy) return <div className={styles.container}><div className={styles.emptyState}>Вакансия не найдена</div></div>;

  return (
    <div className={styles.container}>
      <div style={{ padding: "20px", border: "1px solid #ddd", background: "#fff", borderRadius: "8px" }}>
        <h2>{vacancy.title}</h2>
        <p><strong>Описание:</strong> {vacancy.description}</p>
        <p><strong>Город:</strong> {vacancy.city}</p>
        <p><strong>Работодатель:</strong> {vacancy.employerName}</p>
        <p><strong>Email:</strong> {vacancy.employerEmail}</p>
        <p><strong>Телефон:</strong> {vacancy.employerPhone}</p>
      </div>
    </div>
  );
}

export default VacancyDetail;