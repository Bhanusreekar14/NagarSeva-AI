import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  ShieldCheck,
  PlusCircle,
  Search,
  Bot,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  MapPin,
  Building2,
  Copy,
  Check,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { getCitizenDashboard } from "../services/api";

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user && user.role === "Citizen") {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCitizenDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      const msg =
        err.response?.data?.detail ||
        "Failed to load citizen dashboard data. Please check your connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = (cid) => {
    navigator.clipboard.writeText(cid);
    setCopiedId(cid);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    try {
      const d = new Date(ts);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(ts);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "in progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "inspection":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "closed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading your personal dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle Volunteer User View Notice
  if (user && user.role === "Volunteer") {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Volunteer Portal Access</h2>
            <p className="text-sm text-slate-600 mt-2">
              Welcome <strong>{user.full_name}</strong>! You are logged in as a registered Volunteer.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-800 text-left space-y-1">
            <p className="font-bold">Volunteer Actions:</p>
            <p>• View assigned complaints & task list</p>
            <p>• Submit field inspection evidence</p>
            <p>• Update resolution statuses</p>
          </div>
          <Link
            to="/volunteer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            Open Volunteer Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const profile = dashboardData?.user || user;
  const stats = dashboardData?.stats || { total: 0, pending: 0, assigned_inspection: 0, in_progress: 0, resolved: 0, closed: 0 };
  const complaints = dashboardData?.complaints || [];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Profile Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Welcome, {profile?.full_name?.split(" ")[0]} 👋
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 border border-blue-200">
                  Citizen
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    profile?.verification_status === "Verified"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-amber-100 text-amber-800 border-amber-200"
                  }`}
                >
                  Status: {profile?.verification_status || "Pending Verification"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {profile?.email} {profile?.phone ? `• ${profile.phone}` : ""} {profile?.address ? `• ${profile.address}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={fetchDashboard}
              title="Refresh Data"
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/report"
            className="flex items-center justify-between p-5 rounded-2xl bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/10">
                <PlusCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Report New Issue</h3>
                <p className="text-xs text-blue-100">Submit via AI Vision or Text</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            to="/track"
            className="flex items-center justify-between p-5 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-md hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Track Complaint</h3>
                <p className="text-xs text-slate-500">Live Status & Timeline</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </Link>

          <Link
            to="/assistant"
            className="flex items-center justify-between p-5 rounded-2xl bg-white text-slate-800 border border-slate-200 shadow-md hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">AI Assistant</h3>
                <p className="text-xs text-slate-500">Ask Municipal Policies</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </Link>
        </div>

        {/* Complaint Statistics Grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            My Complaint Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard label="Total Submitted" count={stats.total} color="border-blue-200 bg-blue-50/50 text-blue-900" />
            <StatCard label="Pending" count={stats.pending} color="border-amber-200 bg-amber-50/50 text-amber-900" />
            <StatCard label="In Progress" count={stats.in_progress} color="border-purple-200 bg-purple-50/50 text-purple-900" />
            <StatCard label="Resolved" count={stats.resolved} color="border-emerald-200 bg-emerald-50/50 text-emerald-900" />
            <StatCard label="Closed" count={stats.closed} color="border-slate-200 bg-slate-100/60 text-slate-800" />
          </div>
        </div>

        {/* Recent Complaints Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-4 p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              My Recent Complaints ({complaints.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Only your personal submissions are shown
            </span>
          </div>

          {complaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-4">Complaint ID</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Priority / Severity</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4">Submitted Date</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {complaints.map((c) => (
                    <tr key={c.complaint_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>{c.complaint_id}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(c.complaint_id)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Copy ID"
                          >
                            {copiedId === c.complaint_id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        {c.address && (
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {c.address}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-slate-900 font-bold text-xs">{c.category}</div>
                        <div className="text-[11px] text-slate-500">{c.sub_category || "General"}</div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {c.priority || c.severity}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-xs font-semibold text-slate-700">
                        {c.department}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatTimestamp(c.created_at)}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/track?id=${c.complaint_id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors"
                        >
                          Track Live
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Complaints Submitted Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  You haven't reported any civic issues yet. Click below to submit your first issue with AI Vision or text.
                </p>
              </div>
              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                Report Your First Issue
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, count, color }) {
  return (
    <div className={`p-4 rounded-2xl border ${color} shadow-sm space-y-1`}>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-2xl sm:text-3xl font-black text-slate-900">{count}</p>
    </div>
  );
}
