import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './shared/components/layout/Layout';
import HomePage from './shared/pages/HomePage';
import RegisterPage from './modules/user-skill/pages/RegisterPage';
import LoginPage from './modules/user-skill/pages/LoginPage';
import DashboardPage from './modules/sessions-booking/pages/DashboardPage';
import ProfilePage from './modules/user-skill/pages/ProfilePage';
import DiscoverPage from './modules/requests-matching/pages/DiscoverPage';
import SkillBrowsePage from './modules/requests-matching/pages/SkillBrowsePage';
import RequestsPage from './modules/requests-matching/pages/RequestsPage';
import SessionsPage from './modules/sessions-booking/pages/SessionsPage';
import FeedbackPage from './modules/feedback-reports/pages/FeedbackPage';
import AdminPage from './shared/pages/AdminPage';
import PublicProfilePage from './modules/user-skill/pages/PublicProfilePage';
import { useAuth } from './core/context/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page"><div className="container"><p className="muted">Loading...</p></div></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page"><div className="container"><p className="muted">Loading...</p></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/discover" element={<PrivateRoute><DiscoverPage /></PrivateRoute>} />
        <Route path="/skills" element={<PrivateRoute><SkillBrowsePage /></PrivateRoute>} />
        <Route path="/requests" element={<PrivateRoute><RequestsPage /></PrivateRoute>} />
        <Route path="/sessions" element={<PrivateRoute><SessionsPage /></PrivateRoute>} />
        <Route path="/feedback" element={<PrivateRoute><FeedbackPage /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/profile/:id" element={<PrivateRoute><PublicProfilePage /></PrivateRoute>} />
      </Routes>
    </Layout>
  );
}
