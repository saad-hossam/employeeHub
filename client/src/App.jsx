import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import EmployeesPage from './pages/EmployeesPage';
import DepartmentsPage from './pages/DepartmentsPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

export default function App() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        <div className="page-header">
          <div>
            <p className="eyebrow">EMPLOYEEHUB / MANAGEMENT</p>
            <h1>Management Dashboard</h1>
            <p className="page-subtitle">
              Manage your employees and departments in one place.
            </p>
          </div>
          <div className="profile-chip">
            <span className="profile-avatar">A</span>
            <span>
              <strong>Administrator</strong>
              <small>Workspace</small>
            </span>
          </div>
        </div>

        <div className="page-content">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/employees" replace />}
            />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}