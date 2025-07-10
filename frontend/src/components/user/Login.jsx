import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import styles from "../styles/Form.module.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await authAPI.login(email, password);
      localStorage.setItem("token", res.data.token);
      onLogin(res.data.token);
      navigate("/");
    } catch (err) {
      const errorMessage = err.message || err.response?.data || "Ошибка входа. Проверьте email и пароль.";
      setError(typeof errorMessage === 'string' ? errorMessage : "Ошибка входа. Проверьте email и пароль.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Вход</h2>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
        disabled={loading}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Пароль"
        required
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Вход..." : "Войти"}
      </button>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </form>
  );
}
export default Login;