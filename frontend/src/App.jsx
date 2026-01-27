import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Binder from './pages/Binder';
import Login from './pages/Login';
import BinderEdit from './pages/BinderEdit';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const [isListOpen, setIsListOpen] = useState(false);
  const location = useLocation();

  const toggleList = () => {
    setIsListOpen(!isListOpen);
  };

  // Only show list toggle on binder and binder edit pages
  const showListToggle = location.pathname === '/binder' || location.pathname === '/binder/edit';

  return (
    <Layout showListToggle={showListToggle} isListOpen={isListOpen} toggleList={toggleList}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/binder" element={<Binder isListOpen={isListOpen} toggleList={toggleList} />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/binder/edit" 
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
