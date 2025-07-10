import { useEffect, useState } from "react";
import { userAPI } from "../../api/api";
import styles from "./Profile.module.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", resume: "", about: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userAPI.getProfile();
        setProfile(res.data);
        setForm({
          name: res.data.name || "",
          phone: res.data.phone || "",
          resume: res.data.resume || "",
          about: res.data.about || "",
        });
      } catch (err) {
        setError("Ошибка загрузки профиля");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Загрузка...</div>
      </div>
    );
  if (error)
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  if (!profile)
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>Профиль не найден</div>
      </div>
    );

  const isCandidate = profile.role === 0 || profile.role === "Candidate";
  const isEmployer = profile.role === 1 || profile.role === "Employer";

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const updateData = {
        name: form.name,
        phone: form.phone,
        email: profile.email,
        resume: isCandidate ? form.resume : "",
        about: isEmployer ? form.about : "",
        id: profile.id,
        role: profile.role,
      };
      await userAPI.updateProfile(updateData);
      setProfile({ ...profile, ...updateData });
      setEditMode(false);
      setSuccess("Профиль обновлён!");
    } catch (err) {
      setError(
        err.message ||
          "Ошибка при сохранении профиля. Проверьте правильность заполнения полей."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Профиль</h2>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {!editMode ? (
        <div className={styles.profileCard}>
          <p>
            <b>Email:</b> {profile.email}
          </p>
          <p>
            <b>Имя:</b> {profile.name}
          </p>
          <p>
            <b>Телефон:</b> {profile.phone}
          </p>
          {isCandidate && (
            <p>
              <b>Резюме:</b> {profile.resume}
            </p>
          )}
          {isEmployer && (
            <p>
              <b>Описание компании:</b> {profile.about}
            </p>
          )}
          <p>
            <b>Роль:</b> {isCandidate ? "Соискатель" : "Работодатель"}
          </p>
          <button onClick={() => setEditMode(true)}>Редактировать</button>
        </div>
      ) : (
        <form className={styles.profileCard} onSubmit={handleSave}>
          <label>
            Имя:
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
              disabled={saving}
            />
          </label>
          <label>
            Телефон:
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={30}
              disabled={saving}
            />
          </label>
          {isCandidate && (
            <label>
              Резюме:
              <textarea
                name="resume"
                value={form.resume}
                onChange={handleChange}
                required
                minLength={30}
                maxLength={2000}
                disabled={saving}
                rows={5}
              />
            </label>
          )}
          {isEmployer && (
            <label>
              Описание компании:
              <textarea
                name="about"
                value={form.about}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={2000}
                disabled={saving}
                rows={5}
              />
            </label>
          )}
          <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
            <button type="submit" disabled={saving}>
              {saving ? "Сохраняем..." : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setForm({
                  name: profile.name || "",
                  phone: profile.phone || "",
                  resume: profile.resume || "",
                  about: profile.about || "",
                });
              }}
              disabled={saving}
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;