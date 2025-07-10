import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { vacancyAPI } from "../../api/api";
import styles from "./VacancyManagement.module.css";

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

  if (loading) return <div className={styles.managementContainer}><div>Загрузка вакансий...</div></div>;

  return (
    <div className={styles.managementContainer}>
      <div className={styles.header}>
        <h2>Мои вакансии</h2>
        <Link to="/vacancy/create" className={styles.createBtn}>
          Создать вакансию
        </Link>
      </div>
      {error && <div className={styles.error}>{error}</div>}
      {vacancies.length === 0 ? (
        <div className={styles.empty}>
          У вас нет вакансий. <Link to="/vacancy/create" style={{ color: "#007bff" }}>Создать первую</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {vacancies.map(vacancy => (
            <div key={vacancy.id} className={styles.vacancyCard}>
              <div style={{ flex: 1 }}>
                <h4>{vacancy.title}</h4>
                <p><b>Описание:</b> {vacancy.description}</p>
                <p><b>Город:</b> {vacancy.city}</p>
              </div>
              <div className={styles.actions}>
                <Link
                  to={`/vacancy/edit/${vacancy.id}`}
                  className={styles.editBtn}
                >
                  Редактировать
                </Link>
                <button
                  onClick={() => handleDelete(vacancy.id)}
                  className={styles.deleteBtn}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VacancyManagement;