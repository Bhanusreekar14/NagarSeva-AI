import { useState } from "react";
import {
  Camera,
  Upload,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  analyzeImageComplaint,
  analyzeTextComplaint,
} from "../services/api";

export default function ReportComplaint() {
  const [mode, setMode] = useState("image");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "image" && !file) {
      alert("Please select an image.");
      return;
    }

    if (mode === "text" && !text.trim()) {
      alert("Please enter your complaint.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let data;

      if (mode === "image") {
        data = await analyzeImageComplaint(file);
      } else {
        data = await analyzeTextComplaint(text);
      }

      setResult(data);

    } catch (error) {
      console.error("Complaint analysis failed:", error);

      alert(
        error.response?.data?.detail ||
        "Unable to connect to NagarSeva AI backend."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">
            Report a Civic Issue
          </h1>

          <p className="mt-3 text-slate-600">
            Use an image or describe the problem. NagarSeva AI
            will analyze and route your complaint.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="mx-auto mt-8 flex max-w-md rounded-xl bg-white p-1 shadow-sm">

          <button
            onClick={() => {
              setMode("image");
              setResult(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium ${
              mode === "image"
                ? "bg-blue-600 text-white"
                : "text-slate-600"
            }`}
          >
            <Camera size={18} />
            Image
          </button>

          <button
            onClick={() => {
              setMode("text");
              setResult(null);
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium ${
              mode === "text"
                ? "bg-blue-600 text-white"
                : "text-slate-600"
            }`}
          >
            <Send size={18} />
            Text
          </button>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl border bg-white p-8 shadow-sm"
        >

          {mode === "image" ? (
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Upload Image
              </label>

              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-12 hover:border-blue-500">

                <Upload className="h-10 w-10 text-blue-600" />

                <p className="mt-4 font-medium">
                  {file
                    ? file.name
                    : "Click to upload an image"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  JPG, JPEG or PNG
                </p>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setFile(e.target.files?.[0] || null)
                  }
                />

              </label>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Describe the Problem
              </label>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Example: There is a large pothole near the bus stop..."
                rows={7}
                className="mt-3 w-full rounded-xl border border-slate-300 p-4 outline-none focus:border-blue-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze Complaint"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="mt-8 rounded-2xl border bg-white p-8 shadow-sm">

            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" />

              <h2 className="text-xl font-bold">
                Complaint Analyzed
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <ResultItem
                label="Category"
                value={result.category}
              />

              <ResultItem
                label="Sub Category"
                value={result.sub_category}
              />

              <ResultItem
                label="Confidence"
                value={`${(result.confidence * 100).toFixed(0)}%`}
              />

              <ResultItem
                label="Severity"
                value={result.severity}
              />

              <ResultItem
                label="Priority"
                value={result.priority}
              />

              <ResultItem
                label="Department"
                value={result.department}
              />

            </div>

            <div className="mt-6 rounded-xl bg-green-50 p-5">
              <p className="text-sm text-green-700">
                Complaint ID
              </p>

              <p className="mt-1 text-2xl font-bold text-green-800">
                {result.complaint_id}
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

function ResultItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}
