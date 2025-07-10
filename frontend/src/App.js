import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Login from "./components/Login";
import RegisterChoice from "./components/RegisterChoice";
import CandidateRegister from "./components/CandidateRegister";
import EmployerRegister from "./components/EmployerRegister";
import VacancyList from "./components/VacancyList";
import Profile from "./components/Profile";
import Responses from "./components/Responses";
import VacancyManagement from "./components/VacancyManagement";
import VacancyForm from "./components/VacancyForm";
import ApplicationDetail from "./components/ApplicationDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import VacancyDetail from "./components/VacancyDetail";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Header isAuth={!!token} onLogout={handleLogout} />
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