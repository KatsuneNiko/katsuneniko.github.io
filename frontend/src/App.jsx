import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Binder from './pages/Binder';
import Login from './pages/Login';
import BinderEdit from './pages/BinderEdit';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const [isListOpen, setIsListOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle redirect from 404.html
  useEffect(() => {
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      // Navigate to the stored path
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  const toggleList = () => {
    setIsListOpen(!isListOpen);
  };

  // Only show list toggle on YGO Binder and YGO Binder edit pages
  const showListToggle = location.pathname === '/ygo-binder' || location.pathname === '/ygo-binder/edit';

  return (
    <Layout showListToggle={showListToggle} isListOpen={isListOpen} toggleList={toggleList}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ygo-binder" element={<Binder isListOpen={isListOpen} toggleList={toggleList} />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/ygo-binder/edit" 
          element={
            <ProtectedRoute>
              <BinderEdit isListOpen={isListOpen} toggleList={toggleList} />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
