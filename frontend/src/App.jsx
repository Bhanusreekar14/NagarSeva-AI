import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import ReportComplaint from "./pages/ReportComplaint";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrackComplaint from "./pages/TrackComplaint";
import AIAssistant from "./pages/AIAssistant";
import CitizenDashboard from "./pages/CitizenDashboard";
import VolunteerPortal from "./pages/VolunteerPortal";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportComplaint />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track" element={<TrackComplaint />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/dashboard" element={<CitizenDashboard />} />
            <Route path="/volunteer" element={<VolunteerPortal />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
