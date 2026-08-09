import { Link } from "react-router-dom";
import { ShieldCheck, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              NagarSeva AI
            </h1>
            <p className="text-xs text-slate-500">
              Smart Civic Services
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
            Home
          </Link>

          <Link
            to="/report"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Report Issue
          </Link>

          <Link
            to="/track"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Track Complaint
          </Link>

          <Link
            to="/assistant"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            AI Assistant
          </Link>

          {user && user.role === "Admin" && (
            <Link
              to="/admin"
              className="text-sm font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-xl transition-colors"
            >
              Admin Console
            </Link>
          )}

          {user && (
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
              <Link to="/dashboard" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {user.full_name}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                      user.role === "Admin"
                        ? "bg-slate-900 text-white"
                        : user.role === "Volunteer"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-sm transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
