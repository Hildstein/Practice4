import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { vacancyAPI } from "../../api/api";
import styles from "./VacancyDetail.module.css";

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

  if (loading) return <div className={styles.detailContainer}><div>Загрузка...</div></div>;
  if (error) return <div className={styles.detailContainer}><div style={{ color: "#dc3545" }}>{error}</div></div>;
  if (!vacancy) return <div className={styles.detailContainer}><div>Вакансия не найдена</div></div>;

  return (
    <div className={styles.detailContainer}>
      <h2>{vacancy.title}</h2>
      <div className={styles.infoRow}><b>Описание:</b> {vacancy.description}</div>
      <div className={styles.infoRow}><b>Город:</b> {vacancy.city}</div>
      <div className={styles.infoRow}>
        <b>Работодатель:</b>{" "}
        {vacancy.employerId ? (
          <Link to={`/user/${vacancy.employerId}`}>
            {vacancy.employerName}
          </Link>
        ) : (
          vacancy.employerName
        )}
      </div>
      <div className={styles.infoRow}><b>Email:</b> {vacancy.employerEmail}</div>
      <div className={styles.infoRow}><b>Телефон:</b> {vacancy.employerPhone}</div>
    </div>
  );
}

export default VacancyDetail;