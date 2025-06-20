import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './components/common/Login';
import MainPage from './components/pages/MainPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminCourseList from './components/admin/course/AdminCourseList';
import EditCourseForm from './components/admin/course/EditCourseForm';
import AuthCheck from './services/AuthCheck';
import ProtectedRoute from './components/common/ProtectedRoute';
import CourseList from './components/pages/course/CourseList';
import CourseDetail from './components/pages/course/CourseDetail';
import './App.css';
import CreatePostPage from './components/pages/post/CreatePostPage';
import NotificationsPage from './components/pages/Notification/NotificationsPage';
import SinglePostPage from './components/pages/Notification/SinglePostPage';
import ProfilePage from './components/pages/Profile/ProfilePage';
import Layout from './components/common/Layout';
import EditProfilePage from './components/pages/Profile/EditProfilePage';
import LearningPlanForm from './components/pages/LearningPlans/LearningPlanForm';
import LearningPlanList from './components/pages/LearningPlans/LearningPlanList';
import UpdateLearningPlanForm from './components/pages/LearningPlans/UpdateLearningPlanForm';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LearningPlanDetails from './components/pages/LearningPlans/LearningPlanDetails';
import AIGoalGenerator from './components/common/AIGoalGenerator';
import Analytics from './components/admin/analytics/Analytics';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={true}
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
          transition={Slide}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* Main app routes */}
          <Route element={<Layout />}>
            <Route path="/main" element={<MainPage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/courses" element={<CourseList />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/profile/edit-profile" element={<EditProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/post/:postId" element={<SinglePostPage />} />
            <Route path="/create-learning-plan" element={<LearningPlanForm />} />
            <Route path="/learning-plans" element={<LearningPlanList />} />
            <Route path="/learning-plans/:id/edit" element={<UpdateLearningPlanForm />} />
            <Route path="/learning-plans/:id" element={<LearningPlanDetails />} />
            <Route path='/learning-plans/generate-plan' element={<AIGoalGenerator />} />
          </Route>
          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses" element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminCourseList />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute requiredRole="ADMIN">
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/courses/:courseId/edit" element={
            <ProtectedRoute requiredRole="ADMIN">
              <EditCourseForm />
            </ProtectedRoute>
          } />
          <Route path="/api/auth/check-role" element={<AuthCheck />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;