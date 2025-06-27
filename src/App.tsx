import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Flowbite } from 'flowbite-react';
import { ThemeProvider } from './components/ThemeProvider';
import { AppShell } from './components/layout/AppShell';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResumesPage } from './pages/ResumesPage';
import { BlocksPage } from './pages/BlocksPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ResumePreviewPage } from './pages/ResumePreviewPage';
import { useAuthStore } from './store/auth';
import { customTheme } from './flowbite-theme';

// Placeholder components for routes not yet implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-muted-foreground">This page is coming soon...</p>
    </div>
  </div>
);

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Auth route wrapper that redirects authenticated users to dashboard
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <ThemeProvider>
        <Flowbite theme={{ theme: customTheme }}>
          <LoadingScreen />
        </Flowbite>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Flowbite theme={{ theme: customTheme }}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
            <Route path="/auth/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
            <Route path="/auth/forgot-password" element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />
            <Route path="/auth/reset-password" element={<AuthRoute><ResetPasswordPage /></AuthRoute>} />
            
            {/* Public Resume Preview */}
            <Route path="/r/:userId/:resumeSlug" element={<ResumePreviewPage />} />

            {/* Protected Routes */}
            <Route path="/" element={<AppShell />}>
              <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/auth/login" />} />
              <Route path="/settings" element={isAuthenticated ? <PlaceholderPage title="Account Settings" /> : <Navigate to="/auth/login" />} />
              
              {/* Resume Routes */}
              <Route path="/resumes" element={isAuthenticated ? <ResumesPage /> : <Navigate to="/auth/login" />} />
              <Route path="/resumes/new" element={isAuthenticated ? <PlaceholderPage title="Create New Resume" /> : <Navigate to="/auth/login" />} />
              <Route path="/resumes/:resumeId" element={isAuthenticated ? <PlaceholderPage title="Edit Resume" /> : <Navigate to="/auth/login" />} />
              <Route path="/resumes/:resumeId/settings" element={isAuthenticated ? <PlaceholderPage title="Resume Settings" /> : <Navigate to="/auth/login" />} />
              <Route path="/resumes/:resumeId/analytics" element={isAuthenticated ? <PlaceholderPage title="Resume Analytics" /> : <Navigate to="/auth/login" />} />
              
              {/* Block Routes */}
              <Route path="/blocks" element={isAuthenticated ? <BlocksPage /> : <Navigate to="/auth/login" />} />
              <Route path="/blocks/:blockType" element={isAuthenticated ? <PlaceholderPage title="Block Type View" /> : <Navigate to="/auth/login" />} />
              <Route path="/blocks/:blockType/:blockId" element={isAuthenticated ? <PlaceholderPage title="Edit Block" /> : <Navigate to="/auth/login" />} />
              
              {/* Analytics */}
              <Route path="/analytics" element={isAuthenticated ? <AnalyticsPage /> : <Navigate to="/auth/login" />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
          </Routes>
        </Router>
      </Flowbite>
    </ThemeProvider>
  );
}

export default App;