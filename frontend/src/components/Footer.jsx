import { Link } from "react-router-dom";
import { ShieldCheck, PhoneCall, Mail, MapPin, ExternalLink, Bot, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-14 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-900/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">NagarSeva<span className="text-emerald-400">.AI</span></span>
                <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">Civic Intelligence Network</p>
              </div>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered civic infrastructure detection, automated grievance orchestration, and real-time municipal transparency platform.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1.5 rounded-full w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              <span>YOLOv11 & Multi-Agent Routing</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Quick Navigation</h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Report Civic Issue
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  Track Complaint Status
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  AI Municipal Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Citizen Portals */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Portals & Control</h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Citizen Dashboard
                </Link>
              </li>
              <li>
                <Link to="/volunteer" className="hover:text-indigo-400 transition-colors">
                  Volunteer Execution Portal
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-orange-400 transition-colors">
                  Admin Operations Console
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Citizen Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Municipal Emergency & Helpline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Municipal Helpline</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <PhoneCall className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Toll-Free Control Room</p>
                  <p className="font-bold text-white">1800-425-9090</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Grievance Desk</p>
                  <p className="font-bold text-white">support@nagarseva-ai.gov.in</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NagarSeva AI. Intelligent Municipal Infrastructure System.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
