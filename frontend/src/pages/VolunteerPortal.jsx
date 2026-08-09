import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  getVolunteerTasks,
  updateVolunteerTaskStatus,
  uploadVolunteerEvidence,
  assignVolunteerTask,
} from "../services/api";

export default function VolunteerPortal() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Per-task form state
  const [selectedStatus, setSelectedStatus] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [evidenceFilesMap, setEvidenceFilesMap] = useState({});
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Self-assignment testing input
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
      setSuccessMsg(res.message || "Task assigned successfully!");
      setManualAssignId("");
      await fetchTasks();
    } catch (err) {
      console.error("Assign error:", err);
      setError(err.response?.data?.detail || "Failed to assign task. Check Complaint ID.");
    } finally {
      setAssigning(false);
    }
  };

  const handleTaskUpdate = async (complaintNumber) => {
    const newStatus = selectedStatus[complaintNumber];
    const remarks = remarksMap[complaintNumber] || "";
    const files = evidenceFilesMap[complaintNumber] || [];

    if (!newStatus && files.length === 0 && !remarks.trim()) {
      setError("Please select a status, add remarks, or upload field evidence to update.");
      return;
    }

    setUpdatingTaskId(complaintNumber);
    setError("");
    setSuccessMsg("");

    try {
      if (newStatus) {
        await updateVolunteerTaskStatus(complaintNumber, newStatus, remarks);
      }
      if (files.length > 0) {
        await uploadVolunteerEvidence(complaintNumber, files);
      }

      setSuccessMsg(`Task ${complaintNumber} updated successfully!`);
      // Reset task local inputs
      setRemarksMap((prev) => ({ ...prev, [complaintNumber]: "" }));
      setEvidenceFilesMap((prev) => ({ ...prev, [complaintNumber]: [] }));
      await fetchTasks();
    } catch (err) {
      console.error("Update task error:", err);
      setError(err.response?.data?.detail || "Failed to update volunteer task.");
    } finally {
      setUpdatingTaskId(null);
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
          <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading Volunteer Portal tasks...</p>
        </div>
      </div>
    );
  }

  // Security Check: Citizen Role Restriction
  if (user && user.role !== "Volunteer") {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Access Restricted</h2>
            <p className="text-sm text-slate-600 mt-2">
              The Volunteer Portal is restricted to registered NagarSeva Field Volunteers. You are logged in as a <strong>Citizen</strong>.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
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
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Profile Banner */}
        <div className="bg-white rounded-3xl border border-indigo-100 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "V"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Volunteer Execution Portal
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Verified Volunteer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Field Execution Specialist • {user?.full_name} ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchTasks}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Tasks
            </button>
          </div>
        </div>

        {/* Global Notifications */}
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

        {/* Task Assignment Quick Test Box */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-indigo-400" />
              Assign Field Complaint
            </h3>
            <p className="text-xs text-indigo-200 mt-1 max-w-xl">
              Administrators assign complaints via the Admin Orchestration Center (Phase 10.12). You can also enter a Complaint ID below to assign it directly to your field queue for testing.
            </p>
          </div>

          <form onSubmit={handleManualAssign} className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl border border-white/20">
            <input
              type="text"
              value={manualAssignId}
              onChange={(e) => setManualAssignId(e.target.value)}
              placeholder="e.g. NGS-A1B2C3D4"
              className="bg-transparent px-3 py-1.5 text-xs text-white placeholder-indigo-300 font-bold border-0 focus:ring-0 uppercase focus:outline-none w-36"
            />
            <button
              type="submit"
              disabled={assigning || !manualAssignId.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-bold text-xs shadow-md transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
            >
              {assigning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Assign Task
            </button>
          </form>
        </div>

        {/* Assigned Tasks Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              My Assigned Field Tasks ({tasks.length})
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Isolated queue for {user?.full_name}
            </span>
          </div>

          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {tasks.map((task) => {
                const cid = task.complaint_id;
                const isUpdating = updatingTaskId === cid;

                return (
                  <div
                    key={cid}
                    className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6 transition-all hover:border-indigo-200"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Complaint ID</span>
                          <span className="text-2xl font-black text-slate-900">{cid}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Submitted on {formatTimestamp(task.created_at)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(task.status)}`}>
                          Current Status: {task.status}
                        </span>
                        <Link
                          to={`/track?id=${cid}`}
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
                          title="View Public Timeline"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <TaskSpec label="Category" value={task.category} />
                      <TaskSpec label="Sub-Category" value={task.sub_category} />
                      <TaskSpec label="Severity" value={task.severity} />
                      <TaskSpec label="Target Department" value={task.department} />
                    </div>

                    {/* Description & Address */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {task.description && (
                        <div>
                          <p className="text-xs font-bold text-slate-500">Issue Description:</p>
                          <p className="text-sm font-semibold text-slate-800 mt-0.5">{task.description}</p>
                        </div>
                      )}
                      <div className="flex items-start gap-2 pt-2 border-t border-slate-200/50">
                        <MapPin className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-700">{task.address || "Address not specified"}</p>
                          {task.latitude && (
                            <p className="text-[11px] text-slate-400">Coordinates: {task.latitude}, {task.longitude}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Submitted Attachments */}
                    {task.attachments && task.attachments.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                          Citizen Evidence ({task.attachments.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {task.attachments.map((att, i) => (
                            <a
                              key={i}
                              href={`http://127.0.0.1:8000${att.file_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors"
                            >
                              <span>{att.file_name}</span>
                              <ExternalLink className="h-3 w-3 text-slate-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Volunteer Field Execution Control Box */}
                    <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                      <h4 className="text-sm font-extrabold text-indigo-950 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-indigo-600" />
                        Volunteer Action & Field Execution Controls
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Selector */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Update Resolution Status:
                          </label>
                          <select
                            value={selectedStatus[cid] || task.status}
                            onChange={(e) =>
                              setSelectedStatus((prev) => ({ ...prev, [cid]: e.target.value }))
                            }
                            className="w-full text-xs font-bold border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          >
                            <option value="Assigned">Assigned (Accepted)</option>
                            <option value="Inspection">Inspection (Site Visit)</option>
                            <option value="In Progress">In Progress (Work Executing)</option>
                            <option value="Resolved">Resolved (Completed)</option>
                            <option value="Closed">Closed (Verified)</option>
                          </select>
                        </div>

                        {/* File Upload */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Upload Field Evidence (Photos / Videos / Docs):
                          </label>
                          <input
                            type="file"
                            multiple
                            onChange={(e) =>
                              setEvidenceFilesMap((prev) => ({
                                ...prev,
                                [cid]: Array.from(e.target.files),
                              }))
                            }
                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Remarks Textarea */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Field Inspection Notes & Status Remarks:
                        </label>
                        <textarea
                          rows={2}
                          value={remarksMap[cid] || ""}
                          onChange={(e) =>
                            setRemarksMap((prev) => ({ ...prev, [cid]: e.target.value }))
                          }
                          placeholder="Provide details about site inspection, resolution work, or contractor updates..."
                          className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      {/* Submit Action */}
                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => handleTaskUpdate(cid)}
                          disabled={isUpdating}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          <span>Submit Field Update</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Tasks Assigned</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  You currently have 0 assigned complaints in your field queue. Use the assignment box above to assign a complaint ID for testing, or wait for admin assignment via Phase 10.12.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
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
