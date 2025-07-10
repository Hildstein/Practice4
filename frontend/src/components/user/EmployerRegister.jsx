import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../api/api";
import styles from "./EmployerRegister.module.css";

function EmployerRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setSuccess("");
    if (password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    setLoading(true);
    try {
      await authAPI.registerEmployer({
        email, password, phone, name
      });
      setSuccess("Регистрация успешна! Теперь войдите.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errorMessage = err.message || err.response?.data || "Ошибка регистрации.";
      setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка регистрации.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Регистрация работодателя</h2>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      <input 
        type="email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
        placeholder="Email" 
        required 
        disabled={loading}
        className={styles.input}
      />
      <input 
        type="password" 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="Пароль (минимум 6 символов)" 
        required 
        minLength={6}
        disabled={loading}
        className={styles.input}
      />
      <input 
        type="password" 
        value={confirm} 
        onChange={e => setConfirm(e.target.value)} 
        placeholder="Повторите пароль" 
        required 
        disabled={loading}
        className={styles.input}
      />
      <input 
        type="text" 
        value={phone} 
        onChange={e => setPhone(e.target.value)} 
        placeholder="Телефон" 
        required 
        disabled={loading}
        className={styles.input}
      />
      <input 
        type="text" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        placeholder="Название компании/ФИО" 
        required 
        disabled={loading}
        className={styles.input}
      />
      <button type="submit" disabled={loading} className={styles.submitBtn}>
        {loading ? "Регистрация..." : "Зарегистрироваться как работодатель"}
      </button>
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        <a href="/register/candidate" style={{ color: "#007bff" }}>
          Зарегистрироваться как кандидат
        </a>
      </p>
    </form>
  );
}
export default EmployerRegister;