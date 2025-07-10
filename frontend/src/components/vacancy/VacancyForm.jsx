import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { vacancyAPI } from "../../api/api";
import styles from "./VacancyForm.module.css";

function VacancyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      const fetchVacancy = async () => {
        try {
          const res = await vacancyAPI.getVacancy(id);
          const vacancy = res.data;
          setTitle(vacancy.title);
          setDescription(vacancy.description);
          setCity(vacancy.city);
        } catch (err) {
          const errorMessage = err.message || err.response?.data || "Ошибка при загрузке вакансии";
          setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при загрузке вакансии");
        } finally {
          setInitialLoading(false);
        }
      };
      fetchVacancy();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const vacancyData = { title, description, city };

    try {
      if (isEditing) {
        await vacancyAPI.updateVacancy(id, { ...vacancyData, id: parseInt(id) });
        setSuccess("Вакансия обновлена!");
      } else {
        await vacancyAPI.createVacancy(vacancyData);
        setSuccess("Вакансия создана!");
      }
      setTimeout(() => navigate("/my-vacancies"), 1500);
    } catch (err) {
      const errorMessage = err.message || err.response?.data || "Ошибка при сохранении вакансии";
      setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка при сохранении вакансии");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className={styles.formContainer}><div>Загрузка...</div></div>;
  }

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>{isEditing ? "Редактировать вакансию" : "Создать вакансию"}</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Название вакансии"
          required
          disabled={loading}
          minLength={5}
          maxLength={100}
          className={styles.input}
        />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Описание вакансии (минимум 20 символов)"
          rows={6}
          required
          disabled={loading}
          minLength={20}
          maxLength={2000}
          className={styles.input}
          style={{ resize: "vertical" }}
        />
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Город"
          required
          disabled={loading}
          minLength={2}
          maxLength={100}
          className={styles.input}
        />
        <div className={styles.actions}>
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? "Сохранение..." : (isEditing ? "Обновить" : "Создать")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/my-vacancies")}
            disabled={loading}
            className={styles.cancelBtn}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

export default VacancyForm;