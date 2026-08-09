import { useState, useEffect } from "react";
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
  const { user, loading: authLoading } = useAuth();

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
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
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
      setError(err.response?.data?.detail || "Failed to fetch admin data. Check connection.");
    } finally {
      setLoading(false);
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
          <RefreshCw className="h-10 w-10 text-slate-700 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading Admin Operations Center...</p>
        </div>
      </div>
    );
  }

  // Security Check: Block non-Admin users
  if (user && user.role !== "Admin") {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Access Restricted</h2>
            <p className="text-sm text-slate-600 mt-2">
              The Admin Operations Console is strictly restricted to authorized Administrators. You are logged in as a <strong>{user.role}</strong>.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors"
          >
            Return to User Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const s = stats?.status || { pending: 0, assigned: 0, inspection: 0, in_progress: 0, resolved: 0, closed: 0 };
  const u = stats?.users || { total: 0, citizens: 0, volunteers: 0, admins: 0 };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              <ShieldCheck className="h-9 w-9" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Admin Operations Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Admin Core
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                City-wide Civic Orchestration, AI Multi-Agent Supervision & Volunteer Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAdminData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs shadow-sm transition-colors border border-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Dashboard
            </button>
          </div>
        </div>

        {/* Global Messages */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-sm shadow-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* System Analytics Tile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <AdminTile label="Total Complaints" value={stats?.total_complaints || 0} icon={FileText} color="bg-blue-50 border-blue-200 text-blue-900" />
          <AdminTile label="Pending" value={s.pending} icon={Clock} color="bg-amber-50 border-amber-200 text-amber-900" />
          <AdminTile label="In Progress" value={s.in_progress} icon={Activity} color="bg-purple-50 border-purple-200 text-purple-900" />
          <AdminTile label="Resolved" value={s.resolved} icon={CheckCircle2} color="bg-emerald-50 border-emerald-200 text-emerald-900" />
          <AdminTile label="Active Volunteers" value={u.volunteers} icon={UserCheck} color="bg-indigo-50 border-indigo-200 text-indigo-900" />
          <AdminTile label="Registered Citizens" value={u.citizens} icon={Users} color="bg-slate-100 border-slate-200 text-slate-800" />
        </div>

        {/* Multi-Faceted Filter & Search Toolbar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              Complaint Search & Multi-Faceted Filters
            </h3>
            <button
              type="button"
              onClick={() => {
                setFilters({ status: "", category: "", department: "", priority: "", severity: "", search: "" });
                setTimeout(loadAdminData, 100);
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Reset Filters
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="lg:col-span-2">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                placeholder="Search ID, address, text..."
                className="w-full text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="GARBAGE_WASTE">GARBAGE_WASTE</option>
              <option value="ROAD_DAMAGE">ROAD_DAMAGE</option>
              <option value="STREETLIGHT">STREETLIGHT</option>
              <option value="WATER_SEWAGE">WATER_SEWAGE</option>
              <option value="CIVIC_ISSUE">CIVIC_ISSUE</option>
            </select>

            <select
              value={filters.department}
              onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
              className="text-xs font-semibold p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Departments</option>
              <option value="Solid Waste Management Department">Sanitation</option>
              <option value="Road Maintenance Department">Road Maintenance</option>
              <option value="Electrical Department">Electrical</option>
              <option value="Water Supply & Sewage Department">Water & Sewage</option>
              <option value="General Municipal Department">General Municipal</option>
            </select>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Search className="h-4 w-4" />
              Filter
            </button>
          </form>
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              All System Complaints ({complaints.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              City-wide Master Registry
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
                    <th className="py-3.5 px-4">Assigned Volunteer</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {complaints.map((c) => (
                    <tr key={c.complaint_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900">{c.complaint_id}</span>
                        {c.address && (
                          <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {c.address}
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="text-xs font-bold text-slate-900">{c.category}</div>
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
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs shadow-sm transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Inspect & Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs font-medium text-slate-500">No complaints match current filter criteria.</p>
            </div>
          )}
        </div>

        {/* Volunteers Roster Overview */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Registered Volunteers Roster ({volunteers.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500">Field Execution Operations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {volunteers.map((vol) => (
              <div key={vol.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{vol.full_name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
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

      {/* Detail Inspection & Authoritative Assignment Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Master Inspection</span>
                <h3 className="text-2xl font-black text-slate-900">{selectedComplaint.complaint_id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Spec Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TaskSpec label="Category" value={selectedComplaint.category} />
              <TaskSpec label="Sub-Category" value={selectedComplaint.sub_category} />
              <TaskSpec label="Severity" value={selectedComplaint.severity} />
              <TaskSpec label="Department" value={selectedComplaint.department} />
            </div>

            {/* AI Prediction Section */}
            {selectedComplaint.ai_predictions && selectedComplaint.ai_predictions.length > 0 && (
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                    <Bot className="h-4 w-4 text-blue-600" />
                    AI Model Multi-Agent Prediction:
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Confidence: {selectedComplaint.ai_predictions[0].confidence}
                  </span>
                </div>
                <p className="text-xs text-blue-950 font-semibold">
                  Model: {selectedComplaint.ai_predictions[0].model_name}
                </p>
                {selectedComplaint.ai_predictions[0].prediction_json && (
                  <pre className="text-[10px] bg-white p-2.5 rounded-xl border border-blue-100 text-slate-700 overflow-x-auto font-mono">
                    {JSON.stringify(selectedComplaint.ai_predictions[0].prediction_json, null, 2)}
                  </pre>
                )}
              </div>
            )}

            {/* Authoritative Volunteer Assignment Form */}
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-4">
              <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                Authoritative Admin Volunteer Assignment
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
                  placeholder="e.g. Assigned to Indiranagar Field Unit for priority inspection..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAssignVolunteer}
                disabled={actionLoading || !assignVolunteerId}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Assign Task to Selected Volunteer
              </button>
            </div>

            {/* Attachments & Location */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs font-medium text-slate-700">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Location:</span> {selectedComplaint.address || "No address provided"}
                  {selectedComplaint.latitude && (
                    <p className="text-[11px] text-slate-400">GPS: {selectedComplaint.latitude}, {selectedComplaint.longitude}</p>
                  )}
                </div>
              </div>

              {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-600 mb-2">Evidence Files ({selectedComplaint.attachments.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedComplaint.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={`http://127.0.0.1:8000${att.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 border border-slate-200"
                      >
                        <span>{att.file_name}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminTile({ label, value, icon: Icon, color }) {
  return (
    <div className={`p-4 rounded-2xl border ${color} shadow-sm space-y-1`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        {Icon && <Icon className="h-4 w-4 opacity-70" />}
      </div>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function TaskSpec({ label, value }) {
  return (
    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{value || "N/A"}</p>
    </div>
  );
}
