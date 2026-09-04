import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Paperclip,
  Upload,
  User,
  ShieldAlert,
  ArrowRight,
  Send,
  FileCheck,
  AlertTriangle,
  Plus,
  Bot,
  Camera,
  Search,
  Filter,
  LogOut,
  TrendingUp,
  Activity,
  Layers,
  X,
  Check,
} from "lucide-react";
import {
  getVolunteerTasks,
  updateVolunteerTaskStatus,
  uploadVolunteerEvidence,
  assignVolunteerTask,
  API_BASE_URL,
} from "../services/api";

export default function VolunteerPortal() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Modal State for Inspection & Execution
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalStatus, setModalStatus] = useState("");
  const [modalRemarks, setModalRemarks] = useState("");
  const [modalEvidenceFiles, setModalEvidenceFiles] = useState([]);
  const [modalUpdating, setModalUpdating] = useState(false);

  // Self-assignment bar input
  const [manualAssignId, setManualAssignId] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user && user.role === "Volunteer") {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getVolunteerTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Fetch volunteer tasks error:", err);
      const msg =
        err.response?.data?.detail ||
        "Failed to retrieve assigned volunteer tasks. Please check connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (!manualAssignId.trim()) return;
    setAssigning(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await assignVolunteerTask(manualAssignId.trim().toUpperCase());
      setSuccessMsg(res.message || "Task assigned successfully to your field queue!");
      setManualAssignId("");
      await fetchTasks();
    } catch (err) {
      console.error("Assign error:", err);
      setError(err.response?.data?.detail || "Failed to assign task. Check Complaint ID.");
    } finally {
      setAssigning(false);
    }
  };

  const handleModalTaskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;

    const cid = selectedTask.complaint_id;
    if (!modalStatus && modalEvidenceFiles.length === 0 && !modalRemarks.trim()) {
      setError("Please select a status, add field remarks, or upload evidence to submit.");
      return;
    }

    setModalUpdating(true);
    setError("");
    setSuccessMsg("");

    try {
      if (modalStatus && modalStatus !== selectedTask.status) {
        await updateVolunteerTaskStatus(cid, modalStatus, modalRemarks);
      } else if (modalRemarks.trim()) {
        await updateVolunteerTaskStatus(cid, selectedTask.status, modalRemarks);
      }

      if (modalEvidenceFiles.length > 0) {
        await uploadVolunteerEvidence(cid, modalEvidenceFiles);
      }

      setSuccessMsg(`Task ${cid} updated successfully!`);
      setSelectedTask(null);
      setModalEvidenceFiles([]);
      setModalRemarks("");
      await fetchTasks();
    } catch (err) {
      console.error("Task execution update error:", err);
      setError(err.response?.data?.detail || "Failed to update volunteer task.");
    } finally {
      setModalUpdating(false);
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

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // Metrics aggregates from real tasks list
  const metrics = useMemo(() => {
    let pendingCount = 0;
    let inProgressCount = 0;
    let resolvedCount = 0;
    let highPriorityCount = 0;

    tasks.forEach((t) => {
      const s = t.status?.toLowerCase() || "";
      if (s === "assigned" || s === "inspection" || s === "pending") pendingCount++;
      if (s === "in progress") inProgressCount++;
      if (s === "resolved" || s === "closed") resolvedCount++;

      const sev = t.severity?.toLowerCase() || "";
      const prio = t.priority?.toLowerCase() || "";
      if (sev === "high" || sev === "critical" || prio === "high" || prio === "critical") {
        highPriorityCount++;
      }
    });

    return {
      total: tasks.length,
      pending: pendingCount,
      inProgress: inProgressCount,
      resolved: resolvedCount,
      highPriority: highPriorityCount,
    };
  }, [tasks]);

  // Filtered tasks list
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const s = t.status?.toLowerCase() || "";
      if (activeTab === "review" && !(s === "assigned" || s === "inspection" || s === "pending")) return false;
      if (activeTab === "in_progress" && s !== "in progress") return false;
      if (activeTab === "resolved" && !(s === "resolved" || s === "closed")) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = t.complaint_id?.toLowerCase().includes(q);
        const matchCat = t.category?.toLowerCase().includes(q);
        const matchSub = t.sub_category?.toLowerCase().includes(q);
        const matchAddr = t.address?.toLowerCase().includes(q);
        const matchDept = t.department?.toLowerCase().includes(q);
        return matchId || matchCat || matchSub || matchAddr || matchDept;
      }

      return true;
    });
  }, [tasks, activeTab, searchQuery]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading Field Operations Hub...</p>
        </div>
      </div>
    );
  }

  // Security Check: Citizen & Non-Volunteer Restriction
  if (user && user.role !== "Volunteer") {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Access Restricted</h2>
            <p className="text-xs text-slate-600 mt-2">
              The Volunteer Portal is strictly restricted to registered NagarSeva Field Volunteers. You are logged in as a <strong>{user.role}</strong>.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors"
          >
            Go to Citizen Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header Command Banner */}
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/20 shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "V"}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Field Operations Hub
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Verified Field Specialist
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  On Duty / Dispatch Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Volunteer: <strong>{user?.full_name}</strong> ({user?.email})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
            <button
              type="button"
              onClick={fetchTasks}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs shadow-inner transition-colors border border-slate-800 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Tasks</span>
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

        {/* Notifications */}
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

        {/* 5 Field Operations Metrics */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span>Field Execution Overview</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">Live task queue metrics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <VolunteerTile label="Assigned Tasks" value={metrics.total} icon={FileText} color="bg-white border-slate-200" badge="Active Queue" />
            <VolunteerTile label="Pending / Review" value={metrics.pending} icon={Clock} color="bg-white border-amber-200" badge="Triage & Visit" />
            <VolunteerTile label="In Progress" value={metrics.inProgress} icon={Activity} color="bg-white border-purple-200" badge="Field Repairs" />
            <VolunteerTile label="Resolved Tasks" value={metrics.resolved} icon={CheckCircle2} color="bg-white border-emerald-200" badge="Completed Work" />
            <VolunteerTile label="High Priority" value={metrics.highPriority} icon={AlertTriangle} color="bg-white border-orange-200" badge="Urgent SLA" />
          </div>
        </div>

        {/* Self-Assignment Bar */}
        <div className="bg-slate-950 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Direct Field Task Assignment</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter any Complaint ID to assign it directly to your personal field queue for dispatch.
              </p>
            </div>
          </div>

          <form onSubmit={handleManualAssign} className="flex items-center gap-2 bg-slate-900 p-2 rounded-2xl border border-slate-800 relative z-10">
            <input
              type="text"
              value={manualAssignId}
              onChange={(e) => setManualAssignId(e.target.value)}
              placeholder="e.g. NGS-830ABC38"
              className="bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-500 font-bold border-0 focus:ring-0 uppercase focus:outline-none w-40"
            />
            <button
              type="submit"
              disabled={assigning || !manualAssignId.trim()}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {assigning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span>Assign to Me</span>
            </button>
          </form>
        </div>

        {/* Assigned Field Tasks Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Section Header & Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Assigned Field Complaints Queue ({filteredTasks.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect complaint evidence, site GPS location, AI predictions, and submit resolution reports
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative min-w-[220px]">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ID, category, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Filter Tabs */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("review")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "review" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  Review ({metrics.pending})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("in_progress")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "in_progress" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  In Progress ({metrics.inProgress})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("resolved")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "resolved" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  Resolved ({metrics.resolved})
                </button>
              </div>
            </div>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredTasks.map((t) => {
                const cid = t.complaint_id;
                const imgFullUrl = getImageUrl(t.image_url);

                return (
                  <div
                    key={cid}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 hover:bg-white hover:shadow-lg transition-all duration-200 space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start gap-4">
                        {/* Image Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 flex items-center justify-center shadow-inner relative group">
                          {imgFullUrl ? (
                            <img
                              src={imgFullUrl}
                              alt={t.category}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                                e.target.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 ${
                              imgFullUrl ? "hidden" : "flex"
                            }`}
                          >
                            <Camera className="h-7 w-7 text-slate-400" />
                            <span className="text-[10px] font-bold mt-1 text-slate-500">No Photo</span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 text-sm sm:text-base">
                              {cid}
                            </span>

                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-200 text-slate-800 border border-slate-300">
                              {t.category}
                            </span>

                            {(t.priority || t.severity) && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200">
                                {t.priority || t.severity}
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-slate-700">
                            {t.sub_category ? `Subcategory: ${t.sub_category}` : `Dept: ${t.department || "Municipal Services"}`}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-xs sm:max-w-md">
                                {t.address || (t.latitude ? `GPS: ${t.latitude.toFixed(4)}, ${t.longitude.toFixed(4)}` : "Location logged")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>{formatTimestamp(t.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Inspect CTA */}
                      <div className="flex sm:items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                        <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-black border shadow-sm ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTask(t);
                            setModalStatus(t.status);
                            setModalRemarks("");
                            setModalEvidenceFiles([]);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                        >
                          <FileCheck className="h-4 w-4" />
                          <span>Inspect & Execute</span>
                        </button>
                      </div>
                    </div>

                    {t.description && (
                      <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                        <strong>Citizen Description:</strong> {t.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900">
                  {searchQuery ? "No matching tasks found" : "No Assigned Tasks"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchQuery
                    ? `No field complaint matches "${searchQuery}". Try clearing search filter.`
                    : "You currently have 0 assigned complaints in your field queue. Use the assignment bar above to assign a complaint ID or wait for admin dispatch."}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Detailed Field Execution & Inspection Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Field Execution Modal</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{selectedTask.complaint_id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Spec Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <TaskSpec label="Category" value={selectedTask.category} />
              <TaskSpec label="Sub-Category" value={selectedTask.sub_category} />
              <TaskSpec label="Severity" value={selectedTask.severity} />
              <TaskSpec label="Department" value={selectedTask.department} />
            </div>

            {/* AI Information Card */}
            <div className="p-5 rounded-2xl bg-slate-950 text-white shadow-lg space-y-3 border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-black text-white">YOLO Vision & AI Detection Metadata</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Automated Category
                </span>
              </div>
              <p className="text-xs text-slate-300">
                AI Category: <strong>{selectedTask.category}</strong> • Severity: <strong>{selectedTask.severity || "Normal"}</strong> • Dept: <strong>{selectedTask.department}</strong>
              </p>
            </div>

            {/* Location Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3 text-xs">
              <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Site Location & Address:</p>
                <p className="font-extrabold text-slate-900">{selectedTask.address || "Address not provided"}</p>
                {selectedTask.latitude && (
                  <p className="font-mono text-slate-500 mt-0.5">GPS: {selectedTask.latitude}, {selectedTask.longitude}</p>
                )}
              </div>
            </div>

            {/* Evidence & Complaint Photo */}
            {selectedTask.image_url && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">Original Citizen Evidence Photo:</p>
                <div className="p-2 rounded-2xl border border-slate-200 bg-slate-50">
                  <img
                    src={getImageUrl(selectedTask.image_url)}
                    alt="Complaint Evidence"
                    className="w-full h-44 object-cover rounded-xl border border-slate-200 shadow-sm"
                  />
                  <a
                    href={getImageUrl(selectedTask.image_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-[11px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 justify-center"
                  >
                    📷 Open Full Resolution Evidence <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Volunteer Field Execution & Resolution Form */}
            <form onSubmit={handleModalTaskSubmit} className="p-6 rounded-3xl bg-indigo-50/60 border border-indigo-100 space-y-4">
              <h4 className="text-xs font-extrabold text-indigo-950 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                Submit Resolution Update & Evidence
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Update Status:</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Assigned">Assigned (Accepted)</option>
                    <option value="Inspection">Inspection (Site Visit)</option>
                    <option value="In Progress">In Progress (Work Executing)</option>
                    <option value="Resolved">Resolved (Completed Work)</option>
                    <option value="Closed">Closed (Verified)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Upload Resolution Evidence:</label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setModalEvidenceFiles(Array.from(e.target.files))}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Field Notes & Resolution Remarks:</label>
                <textarea
                  rows={3}
                  value={modalRemarks}
                  onChange={(e) => setModalRemarks(e.target.value)}
                  placeholder="Detail site visit actions, contractor repairs, or completion verification..."
                  className="w-full p-3 text-xs font-medium border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={modalUpdating}
                className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-xl shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {modalUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Uploading Evidence & Updating Status...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Field Resolution Update</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

function VolunteerTile({ label, value, icon: Icon, color, badge }) {
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
