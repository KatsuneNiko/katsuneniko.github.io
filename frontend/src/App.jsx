import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Binder from './pages/Binder';
import Login from './pages/Login';
import BinderEdit from './pages/BinderEdit';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/binder" element={<Binder />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/binder/edit" 
            element={
              <ProtectedRoute>
                <BinderEdit />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
