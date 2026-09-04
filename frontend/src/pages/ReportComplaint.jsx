import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Camera,
  Upload,
  Send,
  CheckCircle,
  AlertCircle,
  MapPin,
  Compass,
  FileText,
  Film,
  Image as ImageIcon,
  X,
  Navigation,
  Globe,
  Paperclip,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Trash2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
} from "lucide-react";
import {
  analyzeImageComplaint,
  analyzeTextComplaint,
  uploadEvidenceAttachments,
} from "../services/api";

export default function ReportComplaint() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("image");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [text, setText] = useState("");

  // Location State
  const [locationMode, setLocationMode] = useState("gps"); // "gps" or "manual"
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Evidence Files State (Multiple extra attachments)
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidenceError, setEvidenceError] = useState("");

  // Output & Loading State
  const [result, setResult] = useState(null);
  const [attachmentsResult, setAttachmentsResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  // Manage object URL for primary image preview
  useEffect(() => {
    if (!file) {
      setFilePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  // Handle GPS Auto-Detect using Geolocation API
  const handleAutoDetectGPS = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setLocationMode("gps");
        setLocating(false);

        if (!address) {
          setAddress(`GPS Coords: ${lat}, ${lng} (Verified Location)`);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLocating(false);
        setLocationError("Unable to retrieve location. Please check location permissions or enter address manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle Evidence Files Selection
  const handleEvidenceSelect = (e) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setEvidenceError("");

    const validFiles = [];
    const maxSizeBytes = 25 * 1024 * 1024; // 25MB

    for (const f of selectedFiles) {
      if (f.size > maxSizeBytes) {
        setEvidenceError(`File ${f.name} exceeds 25MB limit.`);
        continue;
      }
      validFiles.push(f);
    }

    setEvidenceFiles((prev) => [...prev, ...validFiles]);
    e.target.value = "";
  };

  const removeEvidenceFile = (index) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileCategory = (f) => {
    if (f.type.startsWith("image/")) return { label: "Image", icon: ImageIcon, color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (f.type.startsWith("video/")) return { label: "Video", icon: Film, color: "text-purple-600 bg-purple-50 border-purple-200" };
    return { label: "Document", icon: FileText, color: "text-amber-600 bg-amber-50 border-amber-200" };
  };

  const handleCopyId = (cid) => {
    if (!cid) return;
    navigator.clipboard.writeText(cid);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (mode === "image" && !file) {
      setSubmitError("Please select a primary issue image before submitting.");
      return;
    }

    if (mode === "text" && !text.trim()) {
      setSubmitError("Please enter a problem description before submitting.");
      return;
    }

    if (!address.trim()) {
      setSubmitError("Please enter or auto-detect a location address.");
      return;
    }

    setLoading(true);
    setResult(null);
    setAttachmentsResult([]);

    const locationData = {
      latitude: latitude,
      longitude: longitude,
      address: address.trim(),
      location_source: locationMode === "gps" ? "GPS" : "Manual",
    };

    try {
      let data;

      if (mode === "image") {
        data = await analyzeImageComplaint(file, locationData);
      } else {
        data = await analyzeTextComplaint(text, locationData);
      }

      setResult(data);

      // Upload extra evidence files if any
      const createdId = data.complaint_id || data.complaint_number;
      if (createdId && evidenceFiles.length > 0) {
        try {
          const attRes = await uploadEvidenceAttachments(createdId, evidenceFiles);
          if (attRes && attRes.attachments) {
            setAttachmentsResult(attRes.attachments);
          }
        } catch (attErr) {
          console.error("Failed to upload evidence attachments:", attErr);
        }
      }
    } catch (error) {
      console.error("Complaint submission failed:", error);
      const serverMsg =
        error.response?.data?.detail ||
        (typeof error.response?.data === "string" ? error.response.data : null) ||
        error.message ||
        "Unable to connect to NagarSeva AI backend.";
      setSubmitError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFilePreview(null);
    setText("");
    setEvidenceFiles([]);
    setResult(null);
    setAttachmentsResult([]);
    setSubmitError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header Section */}
        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-10 text-white shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Navigation Link */}
          <div className="flex items-center justify-between relative z-10">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              YOLOv11 & Multi-Agent Neural Engine
            </span>
          </div>

          <div className="space-y-2 relative z-10">
            <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
              Report a Civic Issue
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Submit visual photos or detailed text descriptions with verified location coordinates. Our neural orchestrator automatically analyzes severity, categorizes issues, and dispatches field teams.
            </p>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="mx-auto flex max-w-md rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode("image");
              setResult(null);
              setSubmitError("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-xs transition-all cursor-pointer ${
              mode === "image"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera size={16} />
            Image Mode (YOLO AI)
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("text");
              setResult(null);
              setSubmitError("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-xs transition-all cursor-pointer ${
              mode === "text"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Send size={16} />
            Text Mode (NL Agent)
          </button>
        </div>

        {/* Validation & Submit Error Alert */}
        {submitError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl space-y-8"
        >
          {/* Section 1: Issue Details */}
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              1. Issue Details & Evidence
            </h2>

            {mode === "image" ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Primary Issue Photo <span className="text-red-500">*</span>
                </label>

                {filePreview ? (
                  /* Image Preview Card */
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 shadow-inner">
                      <img
                        src={filePreview}
                        alt="Primary Issue Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Primary Photo Loaded</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate">{file?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Size: {file ? (file.size / (1024 * 1024)).toFixed(2) : 0} MB
                      </p>

                      <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                        <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm">
                          <Upload className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Replace Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Drag & Drop Upload Label */
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all bg-slate-50/50">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm mb-2">
                      <Upload className="h-8 w-8" />
                    </div>
                    <p className="font-bold text-sm text-slate-900">
                      Click or drag photo to upload issue image
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Supports JPG, JPEG, PNG, WEBP (Max 10MB)
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}

                {/* Optional description for image mode */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Additional Context / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. Occurred after heavy rain near landmark..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>
            ) : (
              /* Text Mode Description */
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Problem Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe the civic issue in detail (e.g. Large dangerous pothole near Central Bus Terminal causing severe traffic congestion...)"
                  rows={5}
                  className="w-full rounded-2xl border border-slate-300 p-4 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white"
                />
              </div>
            )}
          </div>

          {/* Section 2: Location Information */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                2. Location Information
              </h2>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                Source: {locationMode === "gps" ? "Current GPS" : "Manual Entry"}
              </span>
            </div>

            {/* GPS vs Manual Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLocationMode("gps")}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  locationMode === "gps"
                    ? "border-emerald-500 bg-emerald-50/60 text-emerald-800 shadow-sm"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Navigation className="h-4 w-4" />
                Current GPS / Auto-Detect
              </button>

              <button
                type="button"
                onClick={() => setLocationMode("manual")}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                  locationMode === "manual"
                    ? "border-emerald-500 bg-emerald-50/60 text-emerald-800 shadow-sm"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Globe className="h-4 w-4" />
                Manual Location Entry
              </button>
            </div>

            {/* Auto-Detect Action Box */}
            {locationMode === "gps" && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Browser GPS Auto-Detect</h3>
                    <p className="text-[11px] text-slate-600">Fetch high-accuracy device GPS coordinates</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoDetectGPS}
                    disabled={locating}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Compass className={`h-4 w-4 ${locating ? "animate-spin" : ""}`} />
                    {locating ? "Locating..." : "Auto-Detect My Location"}
                  </button>
                </div>

                {latitude && longitude && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-mono font-bold">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>GPS Coordinates: {latitude}, {longitude}</span>
                  </div>
                )}

                {locationError && (
                  <p className="text-xs text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {locationError}
                  </p>
                )}
              </div>
            )}

            {/* Verified Address Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Final Verified Address / Landmark <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Pillar 42, Outer Ring Road, Indiranagar"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white"
              />
            </div>
          </div>

          {/* Section 3: Extra Visual Evidence & Attachments */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-emerald-600" />
                3. Additional Evidence Files (Optional)
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                Images, Videos, PDF Documents (Max 25MB)
              </span>
            </div>

            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*,video/*,application/pdf,.doc,.docx,.txt"
                onChange={handleEvidenceSelect}
                id="evidence-file-input"
                className="sr-only"
              />
              <label
                htmlFor="evidence-file-input"
                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors text-xs font-bold text-slate-700"
              >
                <Upload className="h-4 w-4 text-emerald-600" />
                <span>Add Extra Evidence Files</span>
              </label>
            </div>

            {evidenceError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {evidenceError}
              </p>
            )}

            {/* Evidence items list */}
            {evidenceFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-600">Attached Evidence ({evidenceFiles.length}):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {evidenceFiles.map((f, idx) => {
                    const cat = getFileCategory(f);
                    const IconComp = cat.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg ${cat.color}`}>
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{f.name}</p>
                            <p className="text-[10px] text-slate-500">
                              {(f.size / (1024 * 1024)).toFixed(2)} MB • {cat.label}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEvidenceFile(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-600 px-6 py-4 font-black text-white shadow-xl shadow-orange-500/20 disabled:opacity-50 transition-all text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Analyzing & Uploading Evidence...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Complaint for AI Routing</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* AI Analysis Result Card */}
        {result && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Complaint Logged & AI Analyzed
                  </h2>
                  <p className="text-xs text-slate-500">Processed by NagarSeva Multi-Agent Orchestrator</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
                Status: {result.status || "Pending"}
              </span>
            </div>

            {/* Generated Complaint ID Box */}
            <div className="rounded-2xl bg-slate-950 text-white p-6 text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <p className="text-xs font-bold text-emerald-400">Generated Complaint Tracking ID</p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-wider">
                  {result.complaint_id || result.complaint_number}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyId(result.complaint_id || result.complaint_number)}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId ? <Check className="h-5 w-5 text-emerald-400" /> : <Paperclip className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Real AI Result Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ResultCard label="Category" value={result.category} />
              <ResultCard label="Sub Category" value={result.sub_category} />
              <ResultCard
                label="AI Confidence"
                value={result.confidence ? `${((result.confidence || 0) * 100).toFixed(0)}%` : "Verified"}
              />
              <ResultCard label="Severity Level" value={result.severity} />
              <ResultCard label="Assigned Department" value={result.department} />
              <ResultCard label="Location Source" value={result.location_source || locationMode.toUpperCase()} />
            </div>

            {/* Location Detail Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-900">Registered Location Address:</p>
                <p className="text-sm font-extrabold text-slate-900">{result.address || address}</p>
                {result.latitude && (
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Lat: {result.latitude}, Lng: {result.longitude}
                  </p>
                )}
              </div>
            </div>

            {/* Attachments Uploaded Output */}
            {attachmentsResult.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  Uploaded Evidence Attachments ({attachmentsResult.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {attachmentsResult.map((att, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
                      {att.file_name} ({att.file_type})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(`/track?id=${result.complaint_id || result.complaint_number}`)}
                className="flex-1 py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Track Complaint Timeline</span>
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="py-3.5 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
              >
                Report Another
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xs sm:text-sm font-extrabold text-slate-900 truncate">{value || "N/A"}</p>
    </div>
  );
}
