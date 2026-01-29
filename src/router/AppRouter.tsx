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

// Main Pages
import Dashboard from '../pages/dashboard/Dashboard';
import { DailyPhrases } from '../pages/daily';
import IrregularVerbs from '../pages/irregular-verbs';
import Conversations from '../pages/conversations';
import Profile from '../pages/profile';

// New Page Components
import Flashcards from '../pages/flashcards/Flashcards';
import VocabularyPage from '../pages/vocabulary/Vocabulary';
import Movies from '../pages/movies/Movies';
import Songs from '../pages/songs/Songs';
import Texts from '../pages/texts/Texts';
import Achievements from '../pages/achievements/Achievements';
import DailyCommitments from '../pages/daily-commitments/DailyCommitments';
import Grammar from '../pages/grammar/Grammar';

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