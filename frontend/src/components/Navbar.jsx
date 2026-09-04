import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, LogOut, Menu, X, PlusCircle, Search, Bot, User as UserIcon, LayoutDashboard, Shield, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-1">
              NagarSeva<span className="text-emerald-600">.AI</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Civic Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive("/")
                ? "bg-emerald-50 text-emerald-700 font-extrabold shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            Home
          </Link>

          <Link
            to="/report"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive("/report")
                ? "bg-emerald-50 text-emerald-700 font-extrabold shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-600" />
            Report Issue
          </Link>

          <Link
            to="/track"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive("/track")
                ? "bg-emerald-50 text-emerald-700 font-extrabold shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Search className="h-3.5 w-3.5 text-slate-500" />
            Track Complaint
          </Link>

          <Link
            to="/assistant"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive("/assistant")
                ? "bg-emerald-50 text-emerald-700 font-extrabold shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Bot className="h-3.5 w-3.5 text-emerald-600" />
            AI Assistant
          </Link>

          {/* Role Badges & Links */}
          {user && user.role === "Admin" ? (
            <Link
              to="/admin"
              className="ml-2 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <Shield className="h-3.5 w-3.5 text-orange-400" />
              Admin Console
            </Link>
          ) : user && user.role === "Volunteer" ? (
            <Link
              to="/volunteer"
              className="ml-2 text-xs font-black text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-700" />
              Volunteer Portal
            </Link>
          ) : user ? (
            <Link
              to="/dashboard"
              className="ml-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" />
              My Dashboard
            </Link>
          ) : null}

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-3 pl-3 ml-2 border-l border-slate-200">
              <Link 
                to={user.role === "Admin" ? "/admin" : user.role === "Volunteer" ? "/volunteer" : "/dashboard"} 
                className="flex items-center gap-2 hover:opacity-85 transition-opacity"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-left leading-tight hidden lg:block">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[110px]">
                    {user.full_name}
                  </div>
                  <span
                    className={`inline-block text-[9px] font-extrabold uppercase tracking-wider ${
                      user.role === "Admin"
                        ? "text-orange-600"
                        : user.role === "Volunteer"
                        ? "text-indigo-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </Link>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-3 ml-2 border-l border-slate-200">
              <Link
                to="/login"
                className="text-xs font-bold text-slate-700 hover:text-emerald-700 px-3 py-2 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
          )}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/report"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Report Issue
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            Track Complaint
          </Link>
          <Link
            to="/assistant"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-slate-800 hover:bg-slate-50"
          >
            AI Assistant
          </Link>

          {user ? (
            <>
              <div className="pt-2 border-t border-slate-100">
                <Link
                  to={user.role === "Admin" ? "/admin" : user.role === "Volunteer" ? "/volunteer" : "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50"
                >
                  My Dashboard ({user.role})
                </Link>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-emerald-600 font-bold text-xs text-white shadow-md"
              >
                Register Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
