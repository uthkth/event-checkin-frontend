import { Link, Route, Routes } from "react-router-dom";
import CheckInPage from "./pages/CheckInPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TicketsPage from "./pages/TicketsPage.jsx";

export default function App() {
  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h1>Event Check-in System</h1>
      <nav style={{ marginBottom: "1rem" }}>
        <Link to="/">Check-In</Link> |{" "}
        <Link to="/tickets">Tickets</Link> |{" "}
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<CheckInPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </div>
  );
}
