import { useState, useEffect, useMemo } from "react";
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
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Camera,
  Filter,
  Layers,
  Activity,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { getCitizenDashboard, API_BASE_URL } from "../services/api";

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const getProgressInfo = (status) => {
    const s = status?.toLowerCase() || "";
    if (s === "resolved" || s === "closed") {
      return { percent: 100, step: 4, label: "Resolved", color: "bg-emerald-500", text: "text-emerald-700" };
    }
    if (s === "in progress") {
      return { percent: 75, step: 3, label: "In Progress", color: "bg-purple-500", text: "text-purple-700" };
    }
    if (s === "assigned" || s === "inspection") {
      return { percent: 50, step: 2, label: "Under Review", color: "bg-blue-500", text: "text-blue-700" };
    }
    return { percent: 25, step: 1, label: "Submitted", color: "bg-amber-500", text: "text-amber-700" };
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "closed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "in progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "inspection":
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const profile = dashboardData?.user || user;
  const stats = dashboardData?.stats || { total: 0, pending: 0, assigned_inspection: 0, in_progress: 0, resolved: 0, closed: 0 };
  const complaints = dashboardData?.complaints || [];

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // Tab Filter
      const statusLower = c.status?.toLowerCase() || "";
      if (activeTab === "review" && !(statusLower === "pending" || statusLower === "assigned" || statusLower === "inspection")) {
        return false;
      }
      if (activeTab === "in_progress" && statusLower !== "in progress") {
        return false;
      }
      if (activeTab === "resolved" && !(statusLower === "resolved" || statusLower === "closed")) {
        return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = c.complaint_id?.toLowerCase().includes(q);
        const matchCat = c.category?.toLowerCase().includes(q);
        const matchSub = c.sub_category?.toLowerCase().includes(q);
        const matchAddr = c.address?.toLowerCase().includes(q);
        const matchDept = c.department?.toLowerCase().includes(q);
        return matchId || matchCat || matchSub || matchAddr || matchDept;
      }

      return true;
    });
  }, [complaints, activeTab, searchQuery]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Loading your personal dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle Volunteer User View Notice
  if (user && user.role === "Volunteer") {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Volunteer Portal Access</h2>
            <p className="text-xs text-slate-600 mt-2">
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
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors"
          >
            Open Volunteer Portal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const underReviewCount = (stats.pending || 0) + (stats.assigned_inspection || 0);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Welcome Section / Profile Banner */}
        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shadow-emerald-500/20 shrink-0">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Welcome back, {profile?.full_name?.split(" ")[0]} 👋
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Citizen Portal
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                    profile?.verification_status === "Verified" || profile?.verification_status === "Approved"
                      ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                      : "bg-amber-950 text-amber-300 border-amber-800"
                  }`}
                >
                  {profile?.verification_status || "Pending Verification"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{profile?.email}</span>
                {profile?.phone && <span>• {profile.phone}</span>}
                {profile?.address && <span>• {profile.address}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10 self-start md:self-auto">
            <button
              type="button"
              onClick={fetchDashboard}
              title="Refresh Dashboard Data"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all shadow-inner cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Quick Action Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/report"
            className="flex items-center justify-between p-6 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20">
                <PlusCircle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">New Complaint</h3>
                <p className="text-xs text-orange-100">Report issue via AI Vision or Text</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/track"
            className="flex items-center justify-between p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 hover:bg-emerald-50/20 transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Track Complaint</h3>
                <p className="text-xs text-slate-500">Live Status & Timeline Audit</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/assistant"
            className="flex items-center justify-between p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/20 transition-all hover:-translate-y-0.5 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Ask AI Assistant</h3>
                <p className="text-xs text-slate-500">Grounded Policy & Department RAG</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        {/* 4 Complaint Summary Metric Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span>Complaint Overview</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">Real-time database metrics</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Complaints"
              count={stats.total}
              icon={<FileText className="h-5 w-5 text-emerald-600" />}
              bgColor="bg-white"
              borderColor="border-slate-200"
              badgeColor="bg-slate-100 text-slate-700"
              subtitle="All submitted issues"
            />
            <StatCard
              title="Under Review"
              count={underReviewCount}
              icon={<Clock className="h-5 w-5 text-amber-600" />}
              bgColor="bg-white"
              borderColor="border-amber-200"
              badgeColor="bg-amber-100 text-amber-800"
              subtitle="Pending & Inspection"
            />
            <StatCard
              title="In Progress"
              count={stats.in_progress}
              icon={<Activity className="h-5 w-5 text-purple-600" />}
              bgColor="bg-white"
              borderColor="border-purple-200"
              badgeColor="bg-purple-100 text-purple-800"
              subtitle="Field action in progress"
            />
            <StatCard
              title="Resolved"
              count={stats.resolved}
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              bgColor="bg-white"
              borderColor="border-emerald-200"
              badgeColor="bg-emerald-100 text-emerald-800"
              subtitle={stats.closed > 0 ? `${stats.closed} closed` : "Verified & Closed"}
            />
          </div>
        </div>

        {/* Complaints Section with Filters, Search, Thumbnails, and Progress Bars */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                My Complaints List ({filteredComplaints.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status, progress timeline, visual evidence, and location details
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ID, category..."
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
                  All ({stats.total})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("review")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "review" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  Review ({underReviewCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("in_progress")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "in_progress" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  In Progress ({stats.in_progress})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("resolved")}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "resolved" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
                  }`}
                >
                  Resolved ({stats.resolved})
                </button>
              </div>
            </div>
          </div>

          {/* Complaints List Cards */}
          {filteredComplaints.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredComplaints.map((c) => {
                const prog = getProgressInfo(c.status);
                const imgFullUrl = getImageUrl(c.image_url);

                return (
                  <div
                    key={c.complaint_id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 hover:bg-white hover:shadow-lg transition-all duration-200 space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Left: Thumbnail & Category/ID Details */}
                      <div className="flex items-start gap-4">
                        {/* Image Thumbnail or Icon Placeholder */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 flex items-center justify-center shadow-inner relative group">
                          {imgFullUrl ? (
                            <img
                              src={imgFullUrl}
                              alt={c.category}
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

                        {/* Complaint Details */}
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-black text-slate-900 text-sm sm:text-base">
                              {c.complaint_id}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyId(c.complaint_id)}
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors cursor-pointer"
                              title="Copy Complaint ID"
                            >
                              {copiedId === c.complaint_id ? (
                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {/* Category Badge */}
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-200 text-slate-800 border border-slate-300">
                              {c.category}
                            </span>

                            {/* Severity / Priority Badge */}
                            {(c.priority || c.severity) && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800 border border-orange-200">
                                {c.priority || c.severity}
                              </span>
                            )}
                          </div>

                          <p className="text-xs font-semibold text-slate-700">
                            {c.sub_category ? `Subcategory: ${c.sub_category}` : `Dept: ${c.department || "Municipal Services"}`}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-xs sm:max-w-md">
                                {c.address || (c.latitude ? `GPS: ${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}` : "Location logged")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>{formatTimestamp(c.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status & Action Button */}
                      <div className="flex sm:items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200">
                        <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-black border shadow-sm ${getStatusBadge(c.status)}`}>
                          {c.status}
                        </span>

                        <Link
                          to={`/track?id=${c.complaint_id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                        >
                          <span>Track Live</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar & Stage Steps */}
                    <div className="pt-3 border-t border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-extrabold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <span>Resolution Progress:</span>
                          <span className={prog.text}>{prog.label}</span>
                        </span>
                        <span className="text-slate-900">{prog.percent}%</span>
                      </div>

                      {/* Bar Container */}
                      <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden relative shadow-inner">
                        <div
                          className={`h-full ${prog.color} transition-all duration-500 rounded-full`}
                          style={{ width: `${prog.percent}%` }}
                        />
                      </div>

                      {/* 4 Step Progress Labels */}
                      <div className="grid grid-cols-4 text-[10px] sm:text-[11px] font-bold text-center text-slate-400 pt-1">
                        <div className={`flex flex-col items-center gap-0.5 ${prog.step >= 1 ? "text-emerald-700 font-black" : ""}`}>
                          <div className={`w-2 h-2 rounded-full ${prog.step >= 1 ? "bg-emerald-500" : "bg-slate-300"}`} />
                          <span>1. Submitted</span>
                        </div>
                        <div className={`flex flex-col items-center gap-0.5 ${prog.step >= 2 ? "text-blue-700 font-black" : ""}`}>
                          <div className={`w-2 h-2 rounded-full ${prog.step >= 2 ? "bg-blue-500" : "bg-slate-300"}`} />
                          <span>2. Under Review</span>
                        </div>
                        <div className={`flex flex-col items-center gap-0.5 ${prog.step >= 3 ? "text-purple-700 font-black" : ""}`}>
                          <div className={`w-2 h-2 rounded-full ${prog.step >= 3 ? "bg-purple-500" : "bg-slate-300"}`} />
                          <span>3. In Progress</span>
                        </div>
                        <div className={`flex flex-col items-center gap-0.5 ${prog.step >= 4 ? "text-emerald-700 font-black" : ""}`}>
                          <div className={`w-2 h-2 rounded-full ${prog.step >= 4 ? "bg-emerald-500" : "bg-slate-300"}`} />
                          <span>4. Resolved</span>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <FileText className="h-8 w-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900">
                  {searchQuery ? "No matching complaints found" : "No Complaints Submitted Yet"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {searchQuery
                    ? `No complaint matches "${searchQuery}". Try clearing your search filter.`
                    : "You haven't reported any civic infrastructure issues yet. Report road damage, garbage, or streetlights using AI vision."}
                </p>
              </div>
              {!searchQuery && (
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Report Your First Issue</span>
                </Link>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, count, icon, bgColor, borderColor, badgeColor, subtitle }) {
  return (
    <div className={`p-5 rounded-2xl border ${borderColor} ${bgColor} shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-600">{title}</span>
        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 tracking-tight">{count}</p>
        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold ${badgeColor}`}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}

