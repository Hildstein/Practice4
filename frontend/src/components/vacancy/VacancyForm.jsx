import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { vacancyAPI } from "../../services/api";
import cardStyles from "../styles/Card.module.css";
import formStyles from "../styles/Form.module.css";

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
    return <div className={cardStyles.container}><div className={cardStyles.emptyState}>Загрузка...</div></div>;
  }

  return (
    <div className={cardStyles.container}>
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <h2>{isEditing ? "Редактировать вакансию" : "Создать вакансию"}</h2>
        
        {error && <div className={formStyles.errorMessage}>{error}</div>}
        {success && <div className={formStyles.successMessage}>{success}</div>}
        
        <input 
          type="text" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          placeholder="Название вакансии" 
          required 
          disabled={loading}
          minLength={5}
          maxLength={100}
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
          style={{ 
            width: "100%",
            padding: "10px",
            marginBottom: "15px", 
            border: "1px solid #ccc", 
            borderRadius: "4px",
            resize: "vertical",
            fontSize: "14px",
            boxSizing: "border-box"
          }}
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
        />
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" disabled={loading} style={{ flex: 1 }}>
            {loading ? "Сохранение..." : (isEditing ? "Обновить" : "Создать")}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate("/my-vacancies")}
            disabled={loading}
            style={{
              flex: 1,
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "10px",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

export default VacancyForm;