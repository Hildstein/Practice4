import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import Login from "./components/user/Login";
import RegisterChoice from "./components/user/RegisterChoice";
import CandidateRegister from "./components/user/CandidateRegister";
import EmployerRegister from "./components/user/EmployerRegister";
import VacancyList from "./components/vacancy/VacancyList";
import Profile from "./components/user/Profile";
import Responses from "./components/application/Responses";
import VacancyManagement from "./components/vacancy/VacancyManagement";
import VacancyForm from "./components/vacancy/VacancyForm";
import ApplicationDetail from "./components/application/ApplicationDetail";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import VacancyDetail from "./components/vacancy/VacancyDetail";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userRole, setUserRole] = useState(null);

  // Получаем роль пользователя из токена при изменении токена
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']);
      } catch {
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserRole(null);
  };

  return (
    <BrowserRouter>
      <Header isAuth={!!token} userRole={userRole} onLogout={handleLogout} />
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/vacancy/:id" element={<VacancyDetail />} />
          <Route path="/" element={<VacancyList />} />
          <Route path="/login" element={<Login onLogin={setToken} />} />
          <Route path="/register" element={<RegisterChoice />} />
          <Route path="/register/candidate" element={<CandidateRegister />} />
          <Route path="/register/employer" element={<EmployerRegister />} />

          {/* Protected routes for all authenticated users */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/applications" element={
            <RoleProtectedRoute allowedRoles={["Candidate", "Employer"]}>
              <Responses />
            </RoleProtectedRoute>
          } />
          <Route path="/application/:id" element={
            <ProtectedRoute>
              <ApplicationDetail />
            </ProtectedRoute>
          } />

          {/* Routes for employers only */}
          <Route path="/my-vacancies" element={
            <RoleProtectedRoute allowedRoles={["Employer"]}>
              <VacancyManagement />
            </RoleProtectedRoute>
          } />
          <Route path="/vacancy/create" element={
            <RoleProtectedRoute allowedRoles={["Employer"]}>
              <VacancyForm />
            </RoleProtectedRoute>
          } />
          <Route path="/vacancy/edit/:id" element={
            <RoleProtectedRoute allowedRoles={["Employer"]}>
              <VacancyForm />
            </RoleProtectedRoute>
          } />

          {/* Legacy route redirects */}
          <Route path="/responses" element={
            <RoleProtectedRoute allowedRoles={["Candidate", "Employer"]}>
              <Responses />
            </RoleProtectedRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;