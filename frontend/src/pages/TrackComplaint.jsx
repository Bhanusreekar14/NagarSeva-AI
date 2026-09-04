import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  AlertCircle,
  ShieldCheck,
  Paperclip,
  Check,
  ChevronRight,
  RefreshCw,
  Copy,
  ExternalLink,
  Tag,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { getComplaintDetails, getComplaintTimeline, getImageUrl } from "../services/api";

const STATUS_PIPELINE = [
  { id: "Pending", label: "Submitted", desc: "Logged in NagarSeva System" },
  { id: "Assigned", label: "Assigned", desc: "Routed to Department" },
  { id: "Inspection", label: "Inspection", desc: "Site Assessed by Field Team" },
  { id: "In Progress", label: "In Progress", desc: "Resolution Work Underway" },
  { id: "Resolved", label: "Resolved", desc: "Action Completed & Verified" },
  { id: "Closed", label: "Closed", desc: "Issue Ticket Closed" },
];

export default function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [inputComplaintId, setInputComplaintId] = useState(initialId);
  const [activeComplaintId, setActiveComplaintId] = useState(initialId);

  const [details, setDetails] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchComplaintData = async (cid) => {
    if (!cid.trim()) return;
    const cleanId = cid.trim().toUpperCase();
    setLoading(true);
    setError("");
    setDetails(null);
    setTimelineData(null);

    try {
      const [detailsRes, timelineRes] = await Promise.all([
        getComplaintDetails(cleanId),
        getComplaintTimeline(cleanId).catch(() => null),
      ]);

      setDetails(detailsRes);
      setTimelineData(timelineRes);
      setActiveComplaintId(cleanId);
    } catch (err) {
      console.error("Tracking API error:", err);
      const msg =
        err.response?.status === 404
          ? `Complaint ID '${cleanId}' was not found. Please verify the ID.`
          : err.response?.data?.detail || "Failed to fetch complaint details. Please check your network connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchComplaintData(initialId);
    }
  }, [initialId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputComplaintId.trim()) {
      setError("Please enter a valid Complaint ID.");
      return;
    }
    setSearchParams({ id: inputComplaintId.trim().toUpperCase() });
    fetchComplaintData(inputComplaintId);
  };

  const handleCopyId = () => {
    if (details?.complaint_id) {
      navigator.clipboard.writeText(details.complaint_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusStepIndex = (status) => {
    if (!status) return 0;
    const idx = STATUS_PIPELINE.findIndex(
      (s) => s.id.toLowerCase() === status.toLowerCase()
    );
    return idx >= 0 ? idx : 0;
  };

  const currentStepIndex = details ? getStatusStepIndex(details.status) : 0;

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

  const getStatusColor = (status) => {
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

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
            <Clock className="h-3.5 w-3.5" />
            Transparent Public SLA Tracking
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Live Complaint Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Track real-time resolution progress, assigned department updates, and complete field execution history.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="mx-auto max-w-2xl bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={inputComplaintId}
              onChange={(e) => setInputComplaintId(e.target.value)}
              placeholder="Enter Complaint ID (e.g. NGS-A1B2C3D4)..."
              className="block w-full pl-10 pr-4 py-3 text-xs border-0 bg-transparent text-slate-900 placeholder-slate-400 focus:ring-0 focus:outline-none uppercase font-extrabold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span>Track Live</span>
          </button>
        </form>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Retrieving complaint details & resolution timeline...</p>
          </div>
        )}

        {/* Complaint Details View */}
        {details && !loading && (
          <div className="space-y-8">
            {/* Main Spec Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Complaint ID</span>
                    <button
                      onClick={handleCopyId}
                      className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors cursor-pointer"
                      title="Copy ID"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                    {details.complaint_id}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-2xl border font-black text-xs shadow-sm ${getStatusColor(
                      details.status
                    )}`}
                  >
                    Current Status: {details.status}
                  </span>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <SpecItem label="Category" value={details.category} icon={Tag} />
                <SpecItem label="Sub-Category" value={details.sub_category} icon={Tag} />
                <SpecItem
                  label="Severity"
                  value={
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] border font-bold ${getSeverityBadge(details.severity)}`}>
                      {details.severity}
                    </span>
                  }
                  icon={AlertTriangle}
                />
                <SpecItem label="Priority" value={details.priority} icon={ShieldCheck} />
              </div>

              {/* Department & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Assigned Department</p>
                    <p className="text-xs font-bold text-slate-800">{details.department}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-semibold text-emerald-900">Verified Address</p>
                      {details.location_source && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                          {details.location_source}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {details.address || "Address not provided"}
                    </p>
                    {details.latitude && (
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        GPS: {details.latitude}, {details.longitude}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              {details.attachments && details.attachments.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                    <Paperclip className="h-4 w-4 text-emerald-600" />
                    Attached Evidence Documents ({details.attachments.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {details.attachments.map((att, i) => (
                      <a
                        key={i}
                        href={getImageUrl(att.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
                      >
                        <span>{att.file_name}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Visual Live Status Pipeline */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                Live Resolution Pipeline
              </h3>

              {/* Progress Steps Grid */}
              <div className="relative py-4">
                {/* Horizontal line for desktop */}
                <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 z-0" />

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
                  {STATUS_PIPELINE.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;

                    return (
                      <div
                        key={step.id}
                        className={`flex md:flex-col items-center gap-4 md:gap-2 text-left md:text-center p-3 rounded-2xl border md:border-0 ${
                          isCurrent
                            ? "bg-emerald-50/80 border-emerald-200 md:bg-transparent"
                            : "border-slate-100 bg-white md:bg-transparent"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md shrink-0 ${
                            isCurrent
                              ? "bg-emerald-600 text-white ring-4 ring-emerald-100 animate-pulse"
                              : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                        >
                          {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                        </div>

                        <div>
                          <p className={`text-xs font-extrabold ${isCurrent ? "text-emerald-700 font-black" : isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                            {step.label}
                          </p>
                          <p className="text-[10px] text-slate-500 hidden md:block mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Timeline Event Log */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Status History & Activity Audit
              </h3>

              {timelineData?.timeline && timelineData.timeline.length > 0 ? (
                <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                  {timelineData.timeline.map((event, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-4 border-white shadow-sm" />
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                              {event.new_status || details.status}
                            </span>
                            {event.old_status && (
                              <span className="text-slate-400 font-normal">
                                (changed from {event.old_status})
                              </span>
                            )}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {formatTimestamp(event.created_at)}
                          </span>
                        </div>
                        {event.remarks && (
                          <p className="text-xs text-slate-600 pt-1 border-t border-slate-200/50 mt-2">
                            <span className="font-bold text-slate-700">Remarks:</span> {event.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="text-xs font-medium text-slate-500">
                    No historical status changes recorded yet. Initial status: <strong className="text-slate-800">{details.status}</strong> on {formatTimestamp(details.created_at)}.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecItem({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 flex items-center gap-3">
      {Icon && <Icon className="h-4 w-4 text-slate-400 shrink-0" />}
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-500 uppercase">{label}</p>
        <div className="mt-0.5 text-xs font-bold text-slate-900 truncate">
          {typeof value === "string" ? value || "N/A" : value}
        </div>
      </div>
    </div>
  );
}
