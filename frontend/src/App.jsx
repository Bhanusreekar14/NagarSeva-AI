import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ReportComplaint from "./pages/ReportComplaint";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TrackComplaint from "./pages/TrackComplaint";
import AIAssistant from "./pages/AIAssistant";
import CitizenDashboard from "./pages/CitizenDashboard";
import VolunteerPortal from "./pages/VolunteerPortal";
import AdminDashboard from "./pages/AdminDashboard";

function Placeholder({ title }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="mt-4 text-slate-600">
        This module will be implemented in the next phase.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/report"
          element={<ReportComplaint />}
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/track" element={<TrackComplaint />} />

        <Route path="/assistant" element={<AIAssistant />} />

        <Route path="/dashboard" element={<CitizenDashboard />} />

        <Route path="/volunteer" element={<VolunteerPortal />} />

        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
