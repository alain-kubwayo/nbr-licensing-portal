import { BrowserRouter, Route, Routes } from "react-router"
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/layouts/DashboardLayout";
import ApplicationList from "./pages/ApplicationList";
import ApplicationDetail from "./pages/ApplicationDetail";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route  path="/" element={<Login />} />
        <Route  path="/register" element={<Register />} />
        <Route  path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="applications" element={<ApplicationList />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
