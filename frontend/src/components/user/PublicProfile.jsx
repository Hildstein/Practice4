import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { userAPI } from "../../api/api";
import styles from "./PublicProfile.module.css";

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getPublicProfile(id)
      .then(res => setProfile(res.data))
      .catch(() => setError("Пользователь не найден"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.container}>Загрузка...</div>;
  if (error) return <div className={styles.container}>{error}</div>;
  if (!profile) return null;

  const isEmployer = profile.role === 1 || profile.role === "Employer";

  return (
    <div className={styles.container}>
      <h2>{isEmployer ? "Профиль компании" : "Профиль кандидата"}</h2>
      <div className={styles.profileCard}>
        <p><b>Имя/Компания:</b> {profile.name}</p>
        <p><b>Телефон:</b> {profile.phone}</p>
        {isEmployer && (
          <p><b>О компании:</b> {profile.about}</p>
        )}
        {!isEmployer && (
          <p><b>Резюме:</b> {profile.resume}</p>
        )}
      </div>
    </div>
  );
}