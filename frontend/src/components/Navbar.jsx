import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-blue-600" />

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              NagarSeva AI
            </h1>

            <p className="text-xs text-slate-500">
              Smart Civic Services
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium hover:text-blue-600">
            Home
          </Link>

          <Link
            to="/report"
            className="text-sm font-medium hover:text-blue-600"
          >
            Report Issue
          </Link>

          <Link
            to="/track"
            className="text-sm font-medium hover:text-blue-600"
          >
            Track Complaint
          </Link>

          <Link
            to="/assistant"
            className="text-sm font-medium hover:text-blue-600"
          >
            AI Assistant
          </Link>
        </div>
      </div>
    </nav>
  );
}
