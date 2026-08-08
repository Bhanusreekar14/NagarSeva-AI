import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  MessageSquare,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-blue-400" />
              AI-Powered Civic Platform
            </div>

            <h1 className="text-5xl font-bold leading-tight md:text-6xl">
              Make Your City
              <span className="text-blue-400"> Better.</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-300">
              Report civic problems, track complaints, and get instant
              assistance using AI-powered municipal services.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/report"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
              >
                Report a Problem
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/assistant"
                className="rounded-lg border border-slate-600 px-6 py-3 font-semibold hover:bg-slate-800"
              >
                Ask AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold">
            Civic Services
          </h2>

          <p className="mt-2 text-slate-600">
            Everything you need to report and track city issues.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <ServiceCard
              icon={<Camera />}
              title="Report an Issue"
              description="Upload an image or describe a civic problem. AI automatically analyzes and routes it."
              link="/report"
            />

            <ServiceCard
              icon={<MapPin />}
              title="Track Complaint"
              description="Track your complaint status and view the complete resolution timeline."
              link="/track"
            />

            <ServiceCard
              icon={<MessageSquare />}
              title="AI Assistant"
              description="Ask questions about municipal services and get grounded answers from the knowledge base."
              link="/assistant"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, description, link }) {
  return (
    <Link
      to={link}
      className="group rounded-2xl border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>

      <div className="mt-5 text-sm font-semibold text-blue-600">
        Get Started →
      </div>
    </Link>
  );
}
