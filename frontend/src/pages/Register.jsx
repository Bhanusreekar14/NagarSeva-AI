import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  Upload,
  UserCheck,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState("Citizen");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idProofType, setIdProofType] = useState("Aadhaar");
  const [idProofFile, setIdProofFile] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError("Document file size must be less than 10MB");
        return;
      }
      setError("");
      setIdProofFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("phone", phone.trim());
      formData.append("address", address.trim());
      formData.append("role", role);
      formData.append("id_proof_type", idProofType);

      if (idProofFile) {
        formData.append("id_proof_file", idProofFile);
      }

      const registeredUser = await register(formData);
      if (registeredUser?.role === "Admin") {
        navigate("/admin");
      } else if (registeredUser?.role === "Volunteer") {
        navigate("/volunteer");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      const msg = err.response?.data?.detail || "Registration failed. Please check your inputs.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-slate-200/80">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mb-2 shadow-sm border border-emerald-100">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Create Your NagarSeva Account
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Join the smart civic infrastructure portal to report grievances, track resolutions, or contribute as a field volunteer.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Role Selection Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Account Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole("Citizen")}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border-2 font-semibold text-xs transition-all ${
                  role === "Citizen"
                    ? "border-emerald-500 bg-emerald-50/70 text-emerald-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <User className="h-5 w-5 shrink-0 text-emerald-600" />
                <div className="text-left">
                  <div className="font-extrabold text-sm text-slate-900">Citizen</div>
                  <div className="text-[10px] text-slate-500">Report & Track Issues</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("Volunteer")}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border-2 font-semibold text-xs transition-all ${
                  role === "Volunteer"
                    ? "border-indigo-500 bg-indigo-50/70 text-indigo-800 shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <UserCheck className="h-5 w-5 shrink-0 text-indigo-600" />
                <div className="text-left">
                  <div className="font-extrabold text-sm text-slate-900">Volunteer</div>
                  <div className="text-[10px] text-slate-500">Field Execution</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("Admin")}
                className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border-2 font-semibold text-xs transition-all ${
                  role === "Admin"
                    ? "border-slate-800 bg-slate-900 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <Building2 className="h-5 w-5 shrink-0 text-orange-400" />
                <div className="text-left">
                  <div className="font-extrabold text-sm">Admin</div>
                  <div className="text-[10px] text-slate-400">System Operations</div>
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Legal Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="block w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="block w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="block w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Home / Area Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 MG Road, Indiranagar, City"
                  className="block w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Identity Document Verification */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>Identity Document Verification</span>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Pending Verification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Document Type
                </label>
                <select
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value)}
                  className="block w-full py-2.5 px-3 text-xs font-semibold border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Voter ID">Voter ID Card</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Upload Document (Image / PDF)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    id="id-proof-upload"
                    className="sr-only"
                  />
                  <label
                    htmlFor="id-proof-upload"
                    className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-white hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <span className="truncate text-slate-700">
                      {idProofFile ? idProofFile.name : "Choose File..."}
                    </span>
                    <Upload className="h-4 w-4 text-slate-500 ml-2 shrink-0" />
                  </label>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              Document details are encrypted and securely stored for administrator review.
            </p>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl shadow-lg text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all hover:shadow-emerald-600/20 cursor-pointer"
            >
              {submitting ? "Creating Account..." : `Register as ${role}`}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-extrabold text-emerald-600 hover:text-emerald-700">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
