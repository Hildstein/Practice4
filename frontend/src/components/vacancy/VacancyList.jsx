import { useEffect, useState } from "react";
import VacancyCard from "./VacancyCard";
import { vacancyAPI } from "../../services/api";
import styles from "../styles/Card.module.css";

function VacancyList() {
  const [vacancies, setVacancies] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchVacancies = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      const res = await vacancyAPI.getVacancies(pageNum);
      const data = res.data;
      
      if (append) {
        setVacancies(prev => [...prev, ...data.items]);
      } else {
        setVacancies(data.items);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      // Don't show error for unauthorized requests, just show empty list
      if (err.response?.status !== 401) {
        const errorMessage = err.message || err.response?.data || "Ошибка при загрузке вакансий";
        setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при загрузке вакансий");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  const loadMore = () => {
    fetchVacancies(page + 1, true);
  };

  if (loading) return <div className={styles.container}><div className={styles.emptyState}>Загрузка вакансий...</div></div>;

  return (
    <div className={styles.container}>
      <h2>Вакансии</h2>
      {error && <div style={{ color: "#dc3545", textAlign: "center", marginBottom: "20px" }}>{error}</div>}
      {vacancies.length === 0 ? (
        <div className={styles.emptyState}>Нет вакансий</div>
      ) : (
        <>
          {vacancies.map(vacancy => (
            <VacancyCard key={vacancy.id} vacancy={vacancy} />
          ))}
          
          {hasMore && (
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: loadingMore ? "not-allowed" : "pointer",
                  opacity: loadingMore ? 0.7 : 1
                }}
              >
                {loadingMore ? "Загрузка..." : "Показать ещё"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default VacancyList;