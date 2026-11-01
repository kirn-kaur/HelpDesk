import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import { Spinner } from "./components/Ui.jsx";
import { AuthPage } from "./pages/AuthPages.jsx";
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const TicketList = lazy(() => import("./pages/TicketList.jsx"));
const TicketDetail = lazy(() => import("./pages/TicketDetail.jsx"));
const CreateTicket = lazy(() => import("./pages/CreateTicket.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const UsersPage = lazy(() =>
  import("./pages/AdminPages.jsx").then((module) => ({
    default: module.UsersPage,
  })),
);
const CategoriesPage = lazy(() =>
  import("./pages/AdminPages.jsx").then((module) => ({
    default: module.CategoriesPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./pages/AdminPages.jsx").then((module) => ({
    default: module.ProfilePage,
  })),
);

function LoadPage({ children }) {
  return (
    <Suspense fallback={<Spinner label="Loading page" />}>{children}</Suspense>
  );
}

function Guard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function NotFound() {
  return (
    <div className="not-found">
      <span>404</span>
      <h1>We can’t find that page.</h1>
      <p>It may have moved, or the link may no longer be active.</p>
      <a className="button primary" href="/">
        Back to your workspace
      </a>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route
          index
          element={
            <LoadPage>
              <Dashboard />
            </LoadPage>
          }
        />
        <Route
          path="tickets"
          element={
            <LoadPage>
              <TicketList />
            </LoadPage>
          }
        />
        <Route
          path="tickets/new"
          element={
            <Guard roles={["customer"]}>
              <LoadPage>
                <CreateTicket />
              </LoadPage>
            </Guard>
          }
        />
        <Route
          path="tickets/:id"
          element={
            <LoadPage>
              <TicketDetail />
            </LoadPage>
          }
        />
        <Route
          path="profile"
          element={
            <LoadPage>
              <ProfilePage user={user} />
            </LoadPage>
          }
        />
        <Route
          path="users"
          element={
            <Guard roles={["admin"]}>
              <LoadPage>
                <UsersPage />
              </LoadPage>
            </Guard>
          }
        />
        <Route
          path="categories"
          element={
            <Guard roles={["admin"]}>
              <LoadPage>
                <CategoriesPage />
              </LoadPage>
            </Guard>
          }
        />
        <Route
          path="analytics"
          element={
            <Guard roles={["admin"]}>
              <LoadPage>
                <Analytics />
              </LoadPage>
            </Guard>
          }
        />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
