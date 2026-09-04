import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Users,
  Search,
  Filter,
  RefreshCw,
  Eye,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Bot,
  MapPin,
  Paperclip,
  ExternalLink,
  X,
  Send,
  User,
  Activity,
  Layers,
  Sparkles,
  LogOut,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Check,
} from "lucide-react";
import {
  getAdminStats,
  getAdminComplaints,
  getAdminVolunteers,
  assignComplaintToVolunteer,
  updateAdminComplaintStatus,
} from "../services/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    department: "",
    priority: "",
    severity: "",
    search: "",
  });

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignVolunteerId, setAssignVolunteerId] = useState("");
  const [assignRemarks, setAssignRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user && user.role === "Admin") {
      loadAdminData(false);
      const interval = setInterval(() => {
        loadAdminData(true);
      }, 15000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  const loadAdminData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError("");
    try {
      const [statsRes, complaintsRes, volRes] = await Promise.all([
        getAdminStats(),
        getAdminComplaints(filters),
        getAdminVolunteers(),
      ]);

      setStats(statsRes);
      setComplaints(complaintsRes.complaints || []);
      setVolunteers(volRes.volunteers || []);
    } catch (err) {
      console.error("Admin data fetch error:", err);
      if (!isSilent) {
        setError(err.response?.data?.detail || "Failed to fetch admin data. Check connection.");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleApplyFilters = (e) => {
    e?.preventDefault();
    loadAdminData();
  };

  const handleAssignVolunteer = async () => {
    if (!selectedComplaint || !assignVolunteerId) {
      setError("Please select a volunteer from the list to assign.");
      return;
    }
    setActionLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await assignComplaintToVolunteer(
        selectedComplaint.complaint_id,
        assignVolunteerId,
        assignRemarks
      );
      setSuccessMsg(res.message || "Volunteer assigned successfully!");
      setSelectedComplaint(null);
      setAssignVolunteerId("");
      setAssignRemarks("");
      await loadAdminData();
    } catch (err) {
      console.error("Assign error:", err);
      setError(err.response?.data?.detail || "Failed to assign volunteer.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminStatusChange = async (complaintId, newStatus) => {
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await updateAdminComplaintStatus(
        complaintId,
        newStatus,
        `Status updated to '${newStatus}' by Admin`
      );
      setSuccessMsg(res.message || "Status updated!");
      await loadAdminData();
      if (selectedComplaint && selectedComplaint.complaint_id === complaintId) {
        setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.response?.data?.detail || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
          <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading Admin Control Console...</p>
        </div>
      </div>
    );
  }

  // Security Check: Block non-Admin users
  if (user && user.role !== "Admin") {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-600 mt-2">
              The Admin Operations Console is strictly restricted to authorized Administrators. You are logged in as a <strong>{user.role}</strong>.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
          >
            Return to Citizen Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const s = stats?.status || { pending: 0, assigned: 0, inspection: 0, in_progress: 0, resolved: 0, closed: 0 };
  const u = stats?.users || { total: 0, citizens: 0, volunteers: 0, admins: 0 };
  const underReviewCount = (s.pending || 0) + (s.assigned || 0) + (s.inspection || 0);
  const resolvedCount = (s.resolved || 0) + (s.closed || 0);
  const highPriorityCount = (stats?.severities?.High || 0) + (stats?.severities?.Critical || 0);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Console Banner */}
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  NagarSeva-AI Admin Console
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-400/30">
                  Municipal Authority Master
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Neural Vision Pipeline Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Administrator: <strong>{user?.full_name}</strong> ({user?.email})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
            <button
              type="button"
              onClick={() => loadAdminData(false)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs shadow-inner transition-colors border border-slate-800 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 font-bold text-xs border border-red-800 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Global Error & Success Messages */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs shadow-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* System Overview Metrics (5 Real DB Metrics) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span>System Operations Metrics</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">Live database query aggregates</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <AdminTile label="Total Complaints" value={stats?.total_complaints || 0} icon={FileText} color="bg-white border-slate-200" badge="All Recorded Issues" />
            <AdminTile label="Pending / Review" value={underReviewCount} icon={Clock} color="bg-white border-amber-200" badge="Triage & Inspection" />
            <AdminTile label="In Progress" value={s.in_progress} icon={Activity} color="bg-white border-purple-200" badge="Field Task Force" />
            <AdminTile label="Resolved & Closed" value={resolvedCount} icon={CheckCircle2} color="bg-white border-emerald-200" badge="Completed SLA" />
            <AdminTile label="High / Critical Priority" value={highPriorityCount} icon={AlertTriangle} color="bg-white border-orange-200" badge="Urgent Attention" />
          </div>
        </div>

        {/* Multi-Faceted Complaint Management Toolbar & Filters */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-600" />
              <span>Complaint Management Search & Filters</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setFilters({ status: "", category: "", department: "", priority: "", severity: "", search: "" });
                setTimeout(loadAdminData, 100);
              }}
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 cursor-pointer self-start sm:self-auto"
            >
              Reset All Filters
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search Complaint ID, location, text..."
                className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="Inspection">Inspection</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}
              className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="GARBAGE_WASTE">GARBAGE_WASTE</option>
              <option value="ROAD_DAMAGE">ROAD_DAMAGE</option>
              <option value="STREETLIGHT">STREETLIGHT</option>
              <option value="WATER_SEWAGE">WATER_SEWAGE</option>
              <option value="CIVIC_ISSUE">CIVIC_ISSUE</option>
            </select>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              <span>Apply Filters</span>
            </button>
          </form>
        </div>

        {/* Master Complaints Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Master Complaint Registry ({complaints.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              City-wide Grievance Database
            </span>
          </div>

          {complaints.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-4">Complaint ID</th>
                    <th className="py-3.5 px-4">Citizen Reporter</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Severity / Priority</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4">Assigned Volunteer</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {complaints.map((c) => (
                    <tr key={c.complaint_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-slate-900">{c.complaint_id}</span>
                        {c.address && (
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {c.address}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs font-extrabold text-slate-900">
                          {c.reporter ? c.reporter.full_name : "Anonymous"}
                        </div>
                        <div className="text-[11px] text-slate-500">{c.reporter?.email || "N/A"}</div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs font-extrabold text-slate-900">{c.category}</div>
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

                      <td className="py-4 px-4">
                        {c.assigned_volunteer ? (
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                            {c.assigned_volunteer.full_name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Unassigned</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedComplaint(c);
                            setAssignVolunteerId(c.assigned_volunteer ? c.assigned_volunteer.id : "");
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs shadow-sm transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Inspect & Manage</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <FileText className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No complaints found matching current filter criteria.</p>
            </div>
          )}
        </div>

        {/* AI Analytics & Workload Insights Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Category Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-600" />
                <span>Complaints by Category</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.categories || {}).map(([cat, count]) => {
                  const pct = stats.total_complaints > 0 ? Math.round((count / stats.total_complaints) * 100) : 0;
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800">{cat}</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Severity Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span>Complaints by Severity</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.severities || {}).map(([sev, count]) => {
                  const pct = stats.total_complaints > 0 ? Math.round((count / stats.total_complaints) * 100) : 0;
                  const color = sev === "High" || sev === "Critical" ? "bg-orange-500" : sev === "Medium" ? "bg-amber-500" : "bg-blue-500";
                  return (
                    <div key={sev} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-800">{sev} Severity</span>
                        <span className="text-slate-500">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Department Workload */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span>Department Workload</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.departments || {}).map(([dept, count]) => {
                  return (
                    <div key={dept} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[200px]">{dept}</span>
                      <span className="font-black px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-900">{count} Tasks</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Volunteers Roster Overview */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Registered Field Volunteers ({volunteers.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500">Field Execution Operations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {volunteers.map((vol) => (
              <div key={vol.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{vol.full_name}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {vol.verification_status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{vol.email} {vol.phone ? `• ${vol.phone}` : ""}</p>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 pt-2 border-t border-slate-200/60">
                  <span>Tasks Assigned: <strong>{vol.assigned_tasks_count}</strong></span>
                  <span>Completed: <strong>{vol.completed_tasks_count}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Detailed Authority View & Inspection Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-4xl w-full rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authority Inspection</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{selectedComplaint.complaint_id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Citizen Reporter Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500">Citizen Reporter:</span>
                <span className="font-extrabold text-slate-900 ml-1">
                  {selectedComplaint.reporter ? selectedComplaint.reporter.full_name : "Anonymous Submission"}
                </span>
                {selectedComplaint.reporter?.email && <span className="text-slate-500 ml-2">• {selectedComplaint.reporter.email}</span>}
              </div>
              <span className="text-slate-500 font-medium">Submitted: {formatTimestamp(selectedComplaint.created_at)}</span>
            </div>

            {/* Spec Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TaskSpec label="Category" value={selectedComplaint.category} />
              <TaskSpec label="Sub-Category" value={selectedComplaint.sub_category} />
              <TaskSpec label="Severity" value={selectedComplaint.severity} />
              <TaskSpec label="Assigned Dept" value={selectedComplaint.department} />
            </div>

            {/* PROMINENT AI ANALYSIS SHOWCASE BOX */}
            <div className="p-6 rounded-3xl bg-slate-950 text-white shadow-2xl space-y-5 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black tracking-wide text-white">YOLO Vision & Multi-Agent AI Analysis</h4>
                    <p className="text-[11px] text-slate-400">Actual neural model backend results</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {selectedComplaint.ai_predictions?.[0]?.model_name || "YOLOv11 Vision Pipeline"}
                </span>
              </div>

              {/* Neural Flow Pipeline Visual */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between font-mono">
                <span>1. Image Upload</span>
                <span>→</span>
                <span>2. YOLO Detection</span>
                <span>→</span>
                <span className="text-emerald-400 font-bold">3. Auto Department Route</span>
              </div>

              {/* Real AI Result Metrics */}
              {selectedComplaint.ai_predictions && selectedComplaint.ai_predictions.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Damage</p>
                    <p className="text-xs sm:text-sm font-black text-white mt-1">{selectedComplaint.sub_category || selectedComplaint.category}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence Score</p>
                    <p className="text-xs sm:text-sm font-black text-emerald-400 mt-1">
                      {typeof selectedComplaint.ai_predictions[0].confidence === "number"
                        ? `${(selectedComplaint.ai_predictions[0].confidence * 100).toFixed(0)}%`
                        : "Verified"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Severity Level</p>
                    <p className="text-xs sm:text-sm font-black text-orange-400 mt-1">{selectedComplaint.severity || "Normal"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Routed Department</p>
                    <p className="text-xs sm:text-sm font-black text-slate-200 mt-1 truncate">{selectedComplaint.department}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <p className="font-bold text-emerald-400">Natural Language Agent Processed</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Category: {selectedComplaint.category} • Department: {selectedComplaint.department}</p>
                </div>
              )}

              {selectedComplaint.ai_predictions?.[0]?.prediction_json && (
                <details className="text-xs text-emerald-400 cursor-pointer pt-1">
                  <summary className="font-bold hover:text-white transition-colors">Raw YOLO Bounding Box & Class Payload</summary>
                  <pre className="mt-2 text-[10px] bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 font-mono overflow-x-auto">
                    {JSON.stringify(selectedComplaint.ai_predictions[0].prediction_json, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            {/* Location Intelligence Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Location Intelligence & Address:</p>
                <p className="text-sm font-extrabold text-slate-900">{selectedComplaint.address || "No address provided"}</p>
                {selectedComplaint.latitude && (
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Lat: {selectedComplaint.latitude}, Lng: {selectedComplaint.longitude} (Source: {selectedComplaint.location_source || "GPS"})
                  </p>
                )}
              </div>
            </div>

            {/* Evidence & Image Upload Preview */}
            {(selectedComplaint.image_url || (selectedComplaint.attachments && selectedComplaint.attachments.length > 0)) && (
              <div className="space-y-2">
                <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Paperclip className="h-4 w-4 text-slate-600" />
                  Uploaded Issue Evidence Photos:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedComplaint.image_url && (
                    <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <img
                        src={selectedComplaint.image_url.startsWith("http") ? selectedComplaint.image_url : `http://127.0.0.1:8000${selectedComplaint.image_url}`}
                        alt="Primary Issue Evidence"
                        className="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-sm"
                      />
                      <a
                        href={selectedComplaint.image_url.startsWith("http") ? selectedComplaint.image_url : `http://127.0.0.1:8000${selectedComplaint.image_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 justify-center"
                      >
                        📷 Open Full Resolution Image <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {selectedComplaint.attachments && selectedComplaint.attachments.map((att, i) => (
                    <div key={i} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2">
                      {att.file_url?.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                        <img
                          src={`http://127.0.0.1:8000${att.file_url}`}
                          alt={att.file_name}
                          className="w-full h-36 object-cover rounded-xl border border-slate-200"
                        />
                      ) : (
                        <div className="h-36 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 font-bold text-xs">
                          {att.file_type || "Document"}
                        </div>
                      )}
                      <a
                        href={`http://127.0.0.1:8000${att.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 justify-center"
                      >
                        <span>{att.file_name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Volunteer Assignment & Status Controls */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-950 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                {selectedComplaint.assigned_volunteer ? "Reassign / Update Field Volunteer Task" : "Authoritative Volunteer Assignment"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Select Field Volunteer:</label>
                  <select
                    value={assignVolunteerId}
                    onChange={(e) => setAssignVolunteerId(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Choose Volunteer --</option>
                    {volunteers.map((vol) => (
                      <option key={vol.id} value={vol.id}>
                        {vol.full_name} ({vol.assigned_tasks_count} active tasks)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Direct Status Override:</label>
                  <select
                    value={selectedComplaint.status}
                    onChange={(e) => handleAdminStatusChange(selectedComplaint.complaint_id, e.target.value)}
                    className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Inspection">Inspection</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Remarks / Directives:</label>
                <input
                  type="text"
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  placeholder="e.g. Dispatched to field team for urgent repair..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAssignVolunteer}
                disabled={actionLoading || !assignVolunteerId}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>Assign Task to Selected Volunteer</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function AdminTile({ label, value, icon: Icon, color, badge }) {
  return (
    <div className={`p-5 rounded-2xl border ${color} shadow-sm space-y-2 flex flex-col justify-between hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-600">{label}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
            <Icon className="h-4 w-4 text-slate-700" />
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
          {badge}
        </span>
      </div>
    </div>
  );
}

function TaskSpec({ label, value }) {
  return (
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
      <p className="text-[10px] font-bold text-slate-500 uppercase">{label}</p>
      <p className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">{value || "N/A"}</p>
    </div>
  );
}
