import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ReportComplaint from "./pages/ReportComplaint";

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

        <Route
          path="/track"
          element={<Placeholder title="Track Your Complaint" />}
        />

        <Route
          path="/assistant"
          element={<Placeholder title="NagarSeva AI Assistant" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
