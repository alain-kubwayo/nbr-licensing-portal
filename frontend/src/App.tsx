import { BrowserRouter, Route, Routes } from "react-router"
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/layouts/DashboardLayout";
import ApplicationList from "./pages/ApplicationList";
import ApplicationDetail from "./pages/ApplicationDetail";
import UserManagement from "./pages/UserManagement";
import Approvals from "./pages/Approvals";
import AuthProvider from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route  path="/" element={<Login />} />
          <Route  path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="applications" element={<ApplicationList />} />
              <Route path="applications/:id" element={<ApplicationDetail />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="approvals" element={<Approvals />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
