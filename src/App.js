import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuizListPage from './pages/QuizListPage';
import TakeQuizPage from './pages/TakeQuizPage';
import ManageQuizzesPage from './pages/ManageQuizzesPage';
import ManageQuestionsPage from './pages/ManageQuestionsPage';
import ManageQuizQuestionsPage from './pages/ManageQuizQuestionsPage';

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes - any logged-in user */}
        <Route
          path="/quizzes"
          element={
            <PrivateRoute>
              <QuizListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/quizzes/:id"
          element={
            <PrivateRoute>
              <TakeQuizPage />
            </PrivateRoute>
          }
        />

        {/* Admin-only routes */}
        <Route
          path="/admin/quizzes"
          element={
            <AdminRoute>
              <ManageQuizzesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/quizzes/:id/questions"
          element={
            <AdminRoute>
              <ManageQuizQuestionsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <PrivateRoute>
              <ManageQuestionsPage />
            </PrivateRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/quizzes" />} />
        <Route path="*" element={<Navigate to="/quizzes" />} />
      </Routes>
    </div>
  );
}

export default App;
