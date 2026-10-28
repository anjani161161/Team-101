import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import {
  AdminLayout,
  AuthLayout,
  InstructorLayout,
  PublicLayout,
  StudentLayout,
} from "../components/shell.jsx";
import { useAuth } from "../state/auth.jsx";
import { BrandLogo } from "../components/brand-logo.jsx";
import { roleHome } from "../lib/routing.js";
import { ActivateAccountPage, AuditLogPage, UserManagementPage } from "../pages/users.jsx";
import {
  AdminDashboardPage,
  InstructorDashboardPage,
  RoleDashboardRedirect,
  StudentDashboardPage,
} from "../pages/dashboards.jsx";
import {
  AcademyPage,
  IntelligencePage,
  LessonPage,
  LoginPage,
  PreparednessPage,
  RegisterPage,
  ResourcesPage,
  ScenarioPage,
  SimulationsPage,
} from "../pages/pages.jsx";
import {
  AboutPage,
  DataSourcesPage,
  DisasterGuidesPage,
  HowItWorksPage,
} from "../pages/public.jsx";
import { DisasterLearningHubPage, DisasterTopicPage } from "../pages/disasters.jsx";
import { DisasterUpdatesPage } from "../pages/disaster-updates.jsx";
import { VisualLibraryPage } from "../pages/visuals.jsx";
import { QuizWorkspacePage } from "../pages/quizzes.jsx";

function EntryRoute() {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoading label="Checking your session…" />;
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}

function RouteLoading({ label }) {
  return (
    <div className="route-loading">
      <BrandLogo variant="symbol" />
      <span>{label}</span>
    </div>
  );
}

function AuthenticatedLayout() {
  const { user, loading, authUnavailable, sessionExpired, restoreSession } = useAuth();
  const location = useLocation();
  if (loading) return <RouteLoading label="Loading your workspace…" />;
  if (authUnavailable && !user) return <SessionCheckError onRetry={restoreSession} />;
  if (!user) return <Navigate to="/login" replace state={{ from: location, sessionExpired }} />;
  if (user.role === "ADMIN") return <AdminLayout />;
  if (user.role === "INSTRUCTOR") return <InstructorLayout />;
  return <StudentLayout />;
}

function AnonymousOnly({ children }) {
  const { user, loading, authUnavailable, restoreSession } = useAuth();
  if (loading) return <div className="route-loading">Checking your session…</div>;
  if (authUnavailable) return <SessionCheckError onRetry={restoreSession} />;
  return user ? <Navigate to={roleHome(user.role)} replace /> : children;
}

function SessionCheckError({ onRetry }) {
  return (
    <div className="route-loading" role="alert">
      <div>
        <strong>Can’t verify your session right now.</strong>
        <p>Check your connection and try again. Your sign-in has not been cleared.</p>
        <button className="button button-primary" type="button" onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  );
}

function RoleRoute({ roles, children }) {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) return <Navigate to={roleHome(user?.role)} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EntryRoute />} />
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <AnonymousOnly>
              <LoginPage />
            </AnonymousOnly>
          }
        />
        <Route
          path="/register"
          element={
            <AnonymousOnly>
              <RegisterPage />
            </AnonymousOnly>
          }
        />
        <Route path="/activate" element={<ActivateAccountPage />} />
      </Route>
      <Route element={<PublicLayout />}>
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/disaster-guides" element={<DisasterGuidesPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/data-sources" element={<DataSourcesPage />} />
        <Route path="/disaster-updates" element={<DisasterUpdatesPage />} />
      </Route>
      <Route element={<AuthenticatedLayout />}>
        <Route path="/dashboard" element={<RoleDashboardRedirect />} />
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute roles={["ADMIN"]}>
              <AdminDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/instructor/dashboard"
          element={
            <RoleRoute roles={["INSTRUCTOR"]}>
              <InstructorDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/student/dashboard"
          element={
            <RoleRoute roles={["STUDENT"]}>
              <StudentDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute roles={["ADMIN", "INSTRUCTOR"]}>
              <UserManagementPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/audit"
          element={
            <RoleRoute roles={["ADMIN"]}>
              <AuditLogPage />
            </RoleRoute>
          }
        />
        <Route path="/academy" element={<AcademyPage />} />
        <Route path="/quizzes" element={<QuizWorkspacePage />} />
        <Route path="/academy/:moduleId" element={<LessonPage />} />
        <Route path="/learning/disasters" element={<DisasterLearningHubPage />} />
        <Route path="/learning/disasters/:slug" element={<DisasterTopicPage />} />
        <Route path="/visuals" element={<VisualLibraryPage />} />
        <Route path="/articles" element={<DisasterUpdatesPage />} />
        <Route path="/simulations" element={<SimulationsPage />} />
        <Route path="/simulations/:scenarioId" element={<ScenarioPage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/preparedness" element={<PreparednessPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
