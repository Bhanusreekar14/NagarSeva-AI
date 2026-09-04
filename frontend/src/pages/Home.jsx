import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Bot,
  Activity,
  Layers,
  Search,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 text-white">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 -translate-y-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 translate-y-12 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-bold text-emerald-400 shadow-inner">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Next-Gen AI Civic Infrastructure System</span>
                <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-black uppercase">
                  YOLOv11 Enabled
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Empowering Cities with{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                  AI-Driven Action.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
                Report road damage, garbage accumulation, or streetlight failures instantly. Our multi-agent neural orchestrator automatically analyzes visual evidence, routes complaints to municipal departments, and dispatches field teams.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/report"
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:-translate-y-0.5"
                >
                  <Camera className="h-5 w-5" />
                  <span>Report an Issue</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/assistant"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-4 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5"
                >
                  <Bot className="h-5 w-5 text-emerald-400" />
                  <span>Ask AI Assistant</span>
                </Link>

                <Link
                  to="/track"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 px-5 py-4 text-sm font-bold transition-colors"
                >
                  <Search className="h-4 w-4 text-slate-400" />
                  <span>Track Status</span>
                </Link>
              </div>

              {/* Key Trust Stats */}
              <div className="pt-6 border-t border-slate-900 grid grid-cols-3 gap-6 max-w-xl text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">98.4%</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">AI Routing Accuracy</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-orange-400">&lt; 24h</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Avg SLA Response</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-teal-400">100%</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Public Transparency</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Activity className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Live AI Orchestrator</h3>
                      <p className="text-[11px] text-slate-400">YOLO Vision & LangGraph Engine</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800/50">
                    Active Pipeline
                  </span>
                </div>

                {/* Sample Detection Item Card */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400">Sample Neural Detection</span>
                    <span className="font-extrabold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      Conf: 91%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-white">Alligator Crack & Pothole</p>
                      <p className="text-xs text-slate-400">Routed to Roads Maintenance Dept</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center justify-between">
                    <span>GPS: 12.9716, 77.5946</span>
                    <span className="text-emerald-400 font-bold">Auto-Logged</span>
                  </div>
                </div>

                {/* Feature Bullet Points */}
                <div className="space-y-2.5 text-xs text-slate-300 font-medium">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Real-time GPS coordinate verified geotagging</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Automated multi-department SLA task dispatch</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Grounded Municipal Knowledge Assistant for citizens</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Intelligent Municipal Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Comprehensive Civic Grievance Tools
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Everything citizens and municipal officials need to detect, route, and resolve city infrastructure issues.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <ServiceCard
            icon={<Camera className="h-6 w-6 text-orange-600" />}
            iconBg="bg-orange-50 border-orange-100"
            title="AI Vision Issue Reporting"
            description="Upload photos of potholes, waste piles, or damaged streetlights. AI neural models automatically identify issue type, severity, and department."
            link="/report"
            badge="AI Powered"
            btnColor="text-orange-600 hover:text-orange-700"
          />

          <ServiceCard
            icon={<MapPin className="h-6 w-6 text-emerald-600" />}
            iconBg="bg-emerald-50 border-emerald-100"
            title="Live Complaint Tracking"
            description="Enter your complaint ID to view complete timeline audit history from initial dispatch to field volunteer verification and closure."
            link="/track"
            badge="Real-time SLA"
            btnColor="text-emerald-600 hover:text-emerald-700"
          />

          <ServiceCard
            icon={<Bot className="h-6 w-6 text-indigo-600" />}
            iconBg="bg-indigo-50 border-indigo-100"
            title="Grounded AI Assistant"
            description="Ask questions about municipal grievance policies, department responsibilities, and resolution timelines powered by RAG technology."
            link="/assistant"
            badge="Policy RAG"
            btnColor="text-indigo-600 hover:text-indigo-700"
          />
        </div>
      </section>

      {/* AI Workflow Banner */}
      <section className="bg-slate-900 text-white px-4 py-16 sm:px-6 lg:px-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">How NagarSeva AI Works</h2>
            <p className="text-xs sm:text-sm text-slate-400">From citizen detection to verified field resolution</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <WorkflowStep
              step="01"
              title="Capture & Upload"
              desc="Citizen uploads photo or describes civic issue with GPS auto-location."
            />
            <WorkflowStep
              step="02"
              title="YOLO & AI Analysis"
              desc="Computer vision identifies defect category, confidence, and severity."
            />
            <WorkflowStep
              step="03"
              title="Department Routing"
              desc="Multi-agent orchestrator automatically assigns task to responsible unit."
            />
            <WorkflowStep
              step="04"
              title="Field Verification"
              desc="Volunteer executes repair, uploads evidence, and closes grievance."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, iconBg, title, description, link, badge, btnColor }) {
  return (
    <Link
      to={link}
      className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className={`p-3.5 rounded-2xl border ${iconBg} shadow-sm group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {badge}
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
          {title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {description}
        </p>
      </div>

      <div className={`mt-6 text-xs font-black flex items-center gap-1.5 ${btnColor}`}>
        <span>Explore Service</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

function WorkflowStep({ step, title, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative">
      <span className="text-3xl font-black text-emerald-500/30">{step}</span>
      <h3 className="text-base font-bold text-white">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
