import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setSubmitting(true);
      const loggedUser = await login(email.trim(), password);
      if (loggedUser?.role === "Admin") {
        navigate("/admin");
      } else if (loggedUser?.role === "Volunteer") {
        navigate("/volunteer");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      const isTimeout = err.code === "ECONNABORTED" || err.message?.includes("timeout");
      const msg = isTimeout
        ? "Connection timed out. The backend server may be taking longer to respond. Please try again."
        : err.response?.data?.detail || "Invalid email or password.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* Left Branding Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-10 text-white flex flex-col justify-between space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">NagarSeva<span className="text-emerald-400">.AI</span></span>
            </Link>
            <h3 className="text-2xl font-extrabold leading-tight pt-4">
              Welcome Back to Civic Intelligence.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sign in to manage your reported complaints, access real-time SLA timeline tracking, or perform volunteer field actions.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800 text-xs text-slate-300 font-medium relative z-10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Real-time complaint status updates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Multi-agent department routing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Role-based Citizen & Admin portal access</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Secure Authentication
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access Citizen, Volunteer, or Admin dashboard
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs shadow-sm">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full pl-10 pr-4 py-3 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-4 py-3 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-lg text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all hover:shadow-emerald-600/20 cursor-pointer"
              >
                {submitting ? "Signing in..." : "Sign In to NagarSeva"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-600">
              Don't have an account yet?{" "}
              <Link to="/register" className="font-extrabold text-emerald-600 hover:text-emerald-700">
                Register a new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
