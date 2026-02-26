import { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { UserProvider } from '../contexts/UserContext';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import MainLayout from '../layouts/MainLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Main Pages (Lazy Loaded)
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const DailyPhrases = lazy(() => import('../pages/daily').then(m => ({ default: m.DailyPhrases })));
const IrregularVerbs = lazy(() => import('../pages/irregular-verbs'));
const Conversations = lazy(() => import('../pages/conversations'));
const Profile = lazy(() => import('../pages/profile'));

// New Page Components (Lazy Loaded)
const Flashcards = lazy(() => import('../pages/flashcards/Flashcards'));
const VocabularyPage = lazy(() => import('../pages/vocabulary/Vocabulary'));
const Movies = lazy(() => import('../pages/movies/Movies'));
const Songs = lazy(() => import('../pages/songs/Songs'));
const Texts = lazy(() => import('../pages/texts/Texts'));
const Achievements = lazy(() => import('../pages/achievements/Achievements'));
const DailyCommitments = lazy(() => import('../pages/daily-commitments/DailyCommitments'));
const Grammar = lazy(() => import('../pages/grammar/Grammar'));

const AppRouter = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="daily-phrases" element={<DailyPhrases />} />
                <Route path="irregular-verbs" element={<IrregularVerbs />} />
                <Route path="conversations" element={<Conversations />} />
                <Route path="profile" element={<Profile />} />
                <Route path="flashcards" element={<Flashcards />} />
                <Route path="vocabulary" element={<VocabularyPage />} />
                <Route path="movies" element={<Movies />} />
                <Route path="songs" element={<Songs />} />
                <Route path="texts" element={<Texts />} />
                <Route path="achievements" element={<Achievements />} />
                <Route path="daily-commitments" element={<DailyCommitments />} />
                <Route path="grammar" element={<Grammar />} />
              </Route>

              {/* Catch all route */}
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default AppRouter;