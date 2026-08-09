import { useState } from "react";
import {
  Camera,
  Upload,
  Send,
  CheckCircle,
  AlertCircle,
  MapPin,
  Compass,
  FileText,
  File,
  Film,
  Image as ImageIcon,
  X,
  Navigation,
  Globe,
  Paperclip,
} from "lucide-react";
import {
  analyzeImageComplaint,
  analyzeTextComplaint,
  uploadEvidenceAttachments,
} from "../services/api";

export default function ReportComplaint() {
  const [mode, setMode] = useState("image");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  // Location State
  const [locationMode, setLocationMode] = useState("gps"); // "gps" or "manual"
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Evidence Files State (Multiple)
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidenceError, setEvidenceError] = useState("");

  // Output State
  const [result, setResult] = useState(null);
  const [attachmentsResult, setAttachmentsResult] = useState([]);
  const [loading, setLoading] = useState(false);

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

        // Pre-fill a standard verified address placeholder if empty
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

  const getFileCategory = (file) => {
    if (file.type.startsWith("image/")) return { label: "Image", icon: ImageIcon, color: "text-blue-600 bg-blue-50" };
    if (file.type.startsWith("video/")) return { label: "Video", icon: Film, color: "text-purple-600 bg-purple-50" };
    return { label: "Document", icon: FileText, color: "text-amber-600 bg-amber-50" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "image" && !file) {
      alert("Please select a primary issue image.");
      return;
    }

    if (mode === "text" && !text.trim()) {
      alert("Please enter your complaint description.");
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
      if (data.complaint_id && evidenceFiles.length > 0) {
        try {
          const attRes = await uploadEvidenceAttachments(data.complaint_id, evidenceFiles);
          if (attRes && attRes.attachments) {
            setAttachmentsResult(attRes.attachments);
          }
        } catch (attErr) {
          console.error("Failed to upload evidence attachments:", attErr);
        }
      }
    } catch (error) {
      console.error("Complaint submission failed:", error);
      alert(
        error.response?.data?.detail ||
          "Unable to connect to NagarSeva AI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Report a Civic Issue
          </h1>
          <p className="mt-2 text-slate-600">
            Submit issues with GPS location details, verified address, and multimedia evidence for AI-powered routing.
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="mx-auto flex max-w-md rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode("image");
              setResult(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all ${
              mode === "image"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera size={18} />
            Image Mode
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("text");
              setResult(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all ${
              mode === "text"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Send size={18} />
            Text Mode
          </button>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-lg space-y-8"
        >
          {/* Main Problem Input */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              1. Issue Details
            </h2>

            {mode === "image" ? (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Primary Photo of Issue <span className="text-red-500">*</span>
                </label>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 hover:border-blue-500 hover:bg-blue-50/20 transition-all">
                  <Upload className="h-10 w-10 text-blue-600" />
                  <p className="mt-3 font-semibold text-slate-800">
                    {file ? file.name : "Click to select primary issue photo"}
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
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Problem Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe the civic issue in detail (e.g. Large pothole near Central Bus Terminal causing traffic hazards...)"
                  rows={5}
                  className="w-full rounded-2xl border border-slate-300 p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Location Information Module */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                2. Location Information
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                Source: {locationMode === "gps" ? "Current GPS" : "Manual Entry"}
              </span>
            </div>

            {/* GPS vs Manual Mode Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setLocationMode("gps")}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-semibold text-sm transition-all ${
                  locationMode === "gps"
                    ? "border-blue-600 bg-blue-50/60 text-blue-700 shadow-sm"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Navigation className="h-4 w-4" />
                Current GPS / Auto-Detect
              </button>

              <button
                type="button"
                onClick={() => setLocationMode("manual")}
                className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-semibold text-sm transition-all ${
                  locationMode === "manual"
                    ? "border-blue-600 bg-blue-50/60 text-blue-700 shadow-sm"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Globe className="h-4 w-4" />
                Manual Location Entry
              </button>
            </div>

            {/* Auto-Detect Action */}
            {locationMode === "gps" && (
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Browser GPS Auto-Detect</h3>
                    <p className="text-xs text-slate-600">Fetch high-accuracy device GPS coordinates</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoDetectGPS}
                    disabled={locating}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Compass className={`h-4 w-4 ${locating ? "animate-spin" : ""}`} />
                    {locating ? "Locating..." : "Auto-Detect My Location"}
                  </button>
                </div>

                {latitude && longitude && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold">
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

            {/* Verified Address Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Final Verified Address / Landmark <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Pillar 42, Outer Ring Road, Indiranagar"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Visual Evidence & Documentation Module */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Paperclip className="h-5 w-5 text-blue-600" />
                3. Visual Evidence & Documentation
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Images, Videos, PDF Documents (Max 25MB each)
              </span>
            </div>

            {/* Evidence Picker */}
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
                className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors text-sm font-semibold text-slate-700"
              >
                <Upload className="h-5 w-5 text-blue-600" />
                <span>Add Extra Evidence Files (Images, Videos, Documents)</span>
              </label>
            </div>

            {evidenceError && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {evidenceError}
              </p>
            )}

            {/* List of Evidence Files */}
            {evidenceFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600">Attached Evidence Items ({evidenceFiles.length}):</p>
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
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-base"
            >
              {loading ? "Analyzing & Uploading Evidence..." : "Submit Complaint for AI Routing"}
            </button>
          </div>
        </form>

        {/* Result Summary */}
        {result && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-7 w-7 text-emerald-600 shrink-0" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Complaint Analysis Complete
                </h2>
                <p className="text-xs text-slate-500">Processed by NagarSeva AI Orchestrator</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <ResultCard label="Category" value={result.category} />
              <ResultCard label="Sub Category" value={result.sub_category} />
              <ResultCard
                label="AI Confidence"
                value={`${((result.confidence || 0) * 100).toFixed(0)}%`}
              />
              <ResultCard label="Severity" value={result.severity} />
              <ResultCard label="Department" value={result.department} />
              <ResultCard label="Location Source" value={result.location_source || locationMode.toUpperCase()} />
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-900">Verified Address:</p>
                <p className="text-sm font-bold text-slate-800">{result.address || address}</p>
                {result.latitude && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lat: {result.latitude}, Lng: {result.longitude}
                  </p>
                )}
              </div>
            </div>

            {attachmentsResult.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2">
                  Uploaded Evidence Attachments ({attachmentsResult.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {attachmentsResult.map((att, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-blue-600" />
                      {att.file_name} ({att.file_type})
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center">
              <p className="text-xs font-semibold text-emerald-800">Generated Complaint ID</p>
              <p className="mt-1 text-3xl font-black text-emerald-900 tracking-wider">
                {result.complaint_id}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900 truncate">{value || "N/A"}</p>
    </div>
  );
}
