import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIZED_PROJECTS } from "../data/newLaunchesData";

export default function CategorizedProjectsSection() {
  const [activeTab, setActiveTab] = useState("residential");

  const categories = [
    { id: "residential", label: "Residential", tag: "Sobha • Damac • Emaar" },
    { id: "commercial", label: "Commercial", tag: "Motor City & Burj Capital" },
    { id: "community", label: "Community Living", tag: "Modon • Ohana • RAK" },
    { id: "all", label: "All Developments", tag: "9 Projects" },
  ];

  return (
    <section
      id="categorized-projects"
      className="py-16 md:py-24 bg-slate-50 border-b border-slate-200"
      aria-label="Categorized Real Estate Developments"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#b3975b] block mb-2">
            Featured Portfolio
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-5">
            Curated Dubai & UAE Developments
          </h2>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`group inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeTab === cat.id
                    ? "bg-[#b3975b] text-slate-950 shadow-md shadow-[#b3975b]/30 ring-1 ring-[#b3975b]"
                    : "bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 border border-slate-200 shadow-sm"
                }`}
              >
                <span className="font-bold tracking-tight">{cat.label}</span>
                <span
                  className={`text-[10px] sm:text-[11px] px-2 sm:px-2.5 py-0.5 rounded-full transition-colors ${
                    activeTab === cat.id
                      ? "bg-slate-950/15 text-slate-950 font-semibold"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 font-medium"
                  }`}
                >
                  {cat.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 1. RESIDENTIAL CAROUSEL (Sobha | Damac | Emaar) */}
        {(activeTab === "all" || activeTab === "residential") && (
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <h3 className="text-xl font-bold text-slate-900">
                  Residential Developments
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-full">
                  Sobha | Damac | Emaar
                </span>
              </div>
              <Link
                to="/listings?type=Villa"
                className="text-xs font-bold text-[#b3975b] hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View Residential</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIZED_PROJECTS.residential.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}

        {/* 2. COMMERCIAL CAROUSEL (O1NE- Motor City | Capital One –Motor City | Burj Capital) */}
        {(activeTab === "all" || activeTab === "commercial") && (
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                <h3 className="text-xl font-bold text-slate-900">
                  Commercial Developments
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-full">
                  O1NE - Motor City | Capital One – Motor City | Burj Capital
                </span>
              </div>
              <Link
                to="/commercial"
                className="text-xs font-bold text-[#b3975b] hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View Commercial</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIZED_PROJECTS.commercial.map((p) => (
                <ProjectCard key={p.id} project={p} isCommercial />
              ))}
            </div>
          </div>
        )}

        {/* 3. COMMUNITY PROJECTS CAROUSEL (Modon | Ohana/Imkan | RAK) */}
        {(activeTab === "all" || activeTab === "community") && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <h3 className="text-xl font-bold text-slate-900">
                  Community Projects
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-slate-200/70 px-2.5 py-1 rounded-full">
                  Modon | Ohana / Imkan | RAK
                </span>
              </div>
              <Link
                to="/listings?type=Off-Plan"
                className="text-xs font-bold text-[#b3975b] hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View Communities</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIZED_PROJECTS.community.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project, isCommercial = false }) {
  return (
    <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Banner */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={project.images[0]}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-[#b3975b] text-slate-950 font-bold text-[11px] uppercase tracking-wider shadow">
            {project.developer}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-medium text-[11px] border border-white/20">
            {project.featuredCategory}
          </span>
        </div>

        {/* Location & Handover Bottom Badge */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
          <span className="truncate flex items-center gap-1">
            <span>📍</span>
            <span className="font-medium">{project.location}</span>
          </span>
          <span className="bg-black/60 px-2 py-0.5 rounded text-[11px] font-mono text-[#e6ca85]">
            {project.handover}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-lg font-bold text-slate-900 group-hover:text-[#b3975b] transition line-clamp-1 mb-2">
            <Link to={`/projects/${project.slug}`}>{project.title}</Link>
          </h4>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {project.subtitle}
          </p>

          {/* Key Specs */}
          <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-100 text-center text-xs text-slate-600">
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-medium">
                {isCommercial ? "Offices" : "Beds"}
              </span>
              <span className="font-bold text-slate-800">
                {isCommercial ? "Grade-A" : `${project.beds} Beds`}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-medium">
                Baths
              </span>
              <span className="font-bold text-slate-800">{project.baths}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-400 font-medium">
                Area
              </span>
              <span className="font-bold text-slate-800">
                {project.areaSqft} sqft
              </span>
            </div>
          </div>
        </div>

        {/* Price & Direct Link Button */}
        <div className="mt-4 pt-3 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
              Starting Price
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {project.displayPrice}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {project.brochureUrl && (
              <a
                href={project.brochureUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-[#b3975b] hover:border-[#b3975b] transition"
                title="Download Brochure"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </a>
            )}

            <Link
              to={`/projects/${project.slug}`}
              className="px-4 py-2.5 rounded-xl bg-slate-900 group-hover:bg-[#b3975b] text-white group-hover:text-slate-950 font-bold text-xs transition-all shadow hover:shadow-md flex items-center gap-1.5"
            >
              <span>View Details</span>
              <span className="text-sm leading-none">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
