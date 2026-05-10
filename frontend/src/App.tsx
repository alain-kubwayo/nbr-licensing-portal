import { BrowserRouter, Route, Routes } from "react-router"
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route  path="/" element={<Login />} />
        <Route  path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
