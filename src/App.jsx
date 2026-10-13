import { Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./components/LoginScreen";
import AdminDashboard from "./components/AdminDashboard";
import AdminUsers from "./components/AdminUsers";
import AdminUserProfile from "./components/AdminUserProfile";
import AdminGames from "./components/AdminGames";
import AdminRewards from "./components/AdminRewards";
import AdminRedemptions from "./components/AdminRedemptions";
import AdminWallet from "./components/AdminWallet";
import AdminReferrals from "./components/AdminReferrals";
import { isAuthenticated } from "./services/authService";

// Login ke baghair admin pages nahi khulenge
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/admin/login" replace />;
}

// Pehle se logged in ho to login page dobara na dikhe
function LoginRoute() {
  return isAuthenticated() ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <LoginScreen />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/login" element={<LoginRoute />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute>
            <AdminUserProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/games"
        element={
          <ProtectedRoute>
            <AdminGames />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/rewards"
        element={
          <ProtectedRoute>
            <AdminRewards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/redemptions"
        element={
          <ProtectedRoute>
            <AdminRedemptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/wallet"
        element={
          <ProtectedRoute>
            <AdminWallet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/referrals"
        element={
          <ProtectedRoute>
            <AdminReferrals />
          </ProtectedRoute>
        }
      />

      {/* Koi bhi unknown URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;