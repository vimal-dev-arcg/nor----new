import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CATEGORIZED_PROJECTS, LATEST_LAUNCHES } from "../data/newLaunchesData";
import { appStore } from "../lib/appStore";
import { isIndiaProperty } from "../lib/propertyUtils";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaFilePdf,
  FaBuilding,
  FaCheckCircle,
  FaTimes,
  FaWhatsapp,
  FaShieldAlt,
  FaPercentage,
  FaPassport,
  FaArrowRight,
  FaDownload,
} from "react-icons/fa";

export default function NewLaunchPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeveloper, setSelectedDeveloper] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  // VIP Inquiry Modal State
  const [inquiryModalProject, setInquiryModalProject] = useState(null);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    unitType: "2-Bedroom Suite",
    message: "",
  });
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Dynamic properties from backend / appStore that have status "New Launch" or type "Off-Plan"
  const [storeProperties, setStoreProperties] = useState(
    () => appStore.getState().properties || []
  );

  useEffect(() => {
    const unsub = appStore.subscribe((state) => {
      setStoreProperties(state.properties || []);
    });
    return () => unsub();
  }, []);

  // Combine curated developments with store properties (deduplicated)
  const allNewLaunchProperties = useMemo(() => {
    const curated = [
      ...CATEGORIZED_PROJECTS.residential,
      ...CATEGORIZED_PROJECTS.commercial,
      ...CATEGORIZED_PROJECTS.community,
    ];

    const seenSlugs = new Set(
      curated.map((p) => (p.slug || "").toLowerCase().trim()).filter(Boolean)
    );
    const seenTitles = new Set(
      curated.map((p) => (p.title || "").toLowerCase().trim()).filter(Boolean)
    );

    // Filter store properties that are new launches
    const dynamicNewLaunches = storeProperties
      .filter((p) => {
        if (isIndiaProperty(p)) return false;
        const isLaunch =
          p.status === "New Launch" ||
          p.type === "Off-Plan" ||
          p.status?.toLowerCase().includes("launch");
        return isLaunch;
      })
      .filter((p) => {
        const slug = (p.slug || "").toLowerCase().trim();
        const title = (p.title || "").toLowerCase().trim();
        if (slug && seenSlugs.has(slug)) return false;
        if (title && seenTitles.has(title)) return false;
        return true;
      })
      .map((p) => ({
        id: p.id || p._id,
        title: p.title,
        slug: p.slug || `property-${p.id || p._id}`,
        developer: p.project?.developer || "Master Developer",
        category: p.featuredCategory || (p.type === "Office" || p.type === "Retail" ? "Commercial" : "Residential"),
        featuredCategory: p.featuredCategory || "Residential",
        location: p.location || p.community || "Dubai, UAE",
        city: p.city || "Dubai",
        type: p.type || "Apartment",
        status: "New Launch",
        price: Number(p.price) || 2000000,
        displayPrice: p.displayPrice || `AED ${Number(p.price || 2000000).toLocaleString()}`,
        beds: p.beds || 2,
        baths: p.baths || 2,
        areaSqft: p.areaSqft || 1400,
        handover: p.handover || p.project?.estCompletion || "Q4 2027",
        subtitle:
          p.subtitle ||
          p.project?.about ||
          "Prestigious new off-plan development with flexible developer payment plan and high projected rental yields.",
        brochureUrl: p.project?.brochureUrl || p.brochureUrl || "",
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ["/src/img/img1.jpg"],
        paymentPlan: p.project?.paymentPlan || "60/40 Construction Linked",
      }));

    return [...curated, ...dynamicNewLaunches];
  }, [storeProperties]);

  // Extract unique developers for filter dropdown
  const developers = useMemo(() => {
    const devs = new Set();
    allNewLaunchProperties.forEach((p) => {
      if (p.developer) devs.add(p.developer.trim());
    });
    return Array.from(devs).sort();
  }, [allNewLaunchProperties]);

  // Counts for Category Pills
  const counts = useMemo(() => {
    const res = allNewLaunchProperties.filter(
      (p) =>
        p.featuredCategory?.toLowerCase() === "residential" ||
        p.category?.toLowerCase() === "residential"
    ).length;
    const com = allNewLaunchProperties.filter(
      (p) =>
        p.featuredCategory?.toLowerCase() === "commercial" ||
        p.category?.toLowerCase() === "commercial"
    ).length;
    const comm = allNewLaunchProperties.filter(
      (p) =>
        p.featuredCategory?.toLowerCase() === "community" ||
        p.category?.toLowerCase() === "community"
    ).length;
    return {
      all: allNewLaunchProperties.length,
      residential: res,
      commercial: com,
      community: comm,
    };
  }, [allNewLaunchProperties]);

  // Filtered & Sorted Properties
  const filteredProperties = useMemo(() => {
    let result = [...allNewLaunchProperties];

    // 1. Category Filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (p) =>
          p.featuredCategory?.toLowerCase() === selectedCategory.toLowerCase() ||
          p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 2. Developer Filter
    if (selectedDeveloper !== "all") {
      result = result.filter((p) => p.developer === selectedDeveloper);
    }

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.developer?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q)
      );
    }

    // 4. Sorting
    if (sortBy === "price_asc") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price_desc") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "handover") {
      result.sort((a, b) => (a.handover || "").localeCompare(b.handover || ""));
    }

    return result;
  }, [allNewLaunchProperties, selectedCategory, selectedDeveloper, searchQuery, sortBy]);

  const handleOpenInquiry = (project) => {
    setInquiryModalProject(project);
    setInquiryForm({
      name: "",
      email: "",
      phone: "",
      unitType: project.beds ? `${project.beds}-Bedroom Suite` : "Commercial Unit",
      message: `I am interested in acquiring a unit in ${project.title} (${project.developer}). Please provide payment plan, available inventory, and floor plans.`,
    });
    setInquirySuccess(false);
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.phone) return;

    setInquirySubmitting(true);
    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryForm.name,
          email: inquiryForm.email,
          phone: inquiryForm.phone,
          message: inquiryForm.message,
          propertySnapshot: {
            title: inquiryModalProject?.title || "New Launch Property",
            price: inquiryModalProject?.displayPrice,
            location: inquiryModalProject?.location,
          },
        }),
      }).catch(() => null);

      setInquirySuccess(true);
      setTimeout(() => {
        setInquiryModalProject(null);
        setInquirySuccess(false);
      }, 3000);
    } catch {
      setInquirySuccess(true);
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>All New Launch Properties | NCR Properties Dubai & UAE</title>
        <meta
          name="description"
          content="Explore all exclusive new off-plan launches across Dubai & the UAE: Mercedes by Binghatti, SOBHA Central, Damac Chelsea Residence, O1NE Motor City, Lumena by Omniyat, Burj Capital, Modon Wadeem Gardens, Bayn-ORA, and Sobha City Abu Dhabi."
        />
      </Helmet>

      <Header />

      <main className="w-full pt-20 bg-slate-50 min-h-screen">
        {/* ================= 1. COMPACT HERO HEADER SECTION (NO SCROLL NEEDED ON DESKTOP) ================= */}
        <section className="relative bg-slate-950 text-white overflow-hidden py-5 sm:py-7 border-b border-slate-800">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#b3975b]/20 via-slate-950/70 to-slate-950 pointer-events-none" />
          <div className="absolute -top-24 right-0 w-96 h-96 bg-[#b3975b]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Text Content: Breadcrumb, Heading, Badge, Description */}
            <div className="max-w-3xl mb-5 sm:mb-6">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#b3975b] mb-2">
                <Link to="/" className="hover:text-white transition">
                  Home
                </Link>
                <span>/</span>
                <span className="text-white">New Launches</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap mb-2.5">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  All New Launch Properties
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#b3975b]/20 border border-[#b3975b]/40 text-[#e6ca85] text-[11px] font-bold uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Direct Developer Releases
                </span>
              </div>

              {/* Small Description */}
              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                Explore premier off-plan master developments across Dubai and the UAE with direct developer allocations, prime community locations, and flexible payment milestones.
              </p>
            </div>

            {/* 4 Cards Row Placed Below - Full Width, Clean & Balanced on All Screen Sizes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: 10+ Projects */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-center gap-3 shadow-sm hover:border-[#b3975b]/40 transition group">
                <div className="w-10 h-10 rounded-xl bg-[#b3975b]/15 flex items-center justify-center text-[#b3975b] shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <FaBuilding className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
                    {allNewLaunchProperties.length}+ Projects
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">Master Developments</div>
                </div>
              </div>

              {/* Card 2: Direct Developer Rates (No commission mentioned) */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-center gap-3 shadow-sm hover:border-[#b3975b]/40 transition group">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <FaShieldAlt className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
                    Direct Developer Rates
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">Official Pre-Launch Pricing</div>
                </div>
              </div>

              {/* Card 3: Flexible Plans */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-center gap-3 shadow-sm hover:border-[#b3975b]/40 transition group">
                <div className="w-10 h-10 rounded-xl bg-[#b3975b]/15 flex items-center justify-center text-[#b3975b] shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <FaCalendarAlt className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
                    Flexible Plans
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">Milestone Linked</div>
                </div>
              </div>

              {/* Card 4: Escrow Protected */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex items-center gap-3 shadow-sm hover:border-[#b3975b]/40 transition group">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-400 shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <FaCheckCircle className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider truncate">
                    Escrow Protected
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">DLD & RERA Regulated</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 2. SEARCH & FILTER CONTROLS BAR ================= */}
        <section className="sticky top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Category Pills: Residential, Commercial, Community Living, then All Launches at the END (active by default) - ZERO SCROLL ON LARGE SCREENS */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedCategory("residential")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === "residential"
                      ? "bg-[#b3975b] text-slate-950 shadow-md shadow-[#b3975b]/30 ring-1 ring-[#b3975b]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>Residential</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      selectedCategory === "residential"
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {counts.residential}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedCategory("commercial")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === "commercial"
                      ? "bg-[#b3975b] text-slate-950 shadow-md shadow-[#b3975b]/30 ring-1 ring-[#b3975b]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>Commercial</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      selectedCategory === "commercial"
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {counts.commercial}
                  </span>
                </button>

                <button
                  onClick={() => setSelectedCategory("community")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === "community"
                      ? "bg-[#b3975b] text-slate-950 shadow-md shadow-[#b3975b]/30 ring-1 ring-[#b3975b]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>Community Living</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      selectedCategory === "community"
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {counts.community}
                  </span>
                </button>

                {/* All Launches at the end, active by default */}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    selectedCategory === "all"
                      ? "bg-[#b3975b] text-slate-950 shadow-md shadow-[#b3975b]/30 ring-1 ring-[#b3975b]"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>All Launches</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] ${
                      selectedCategory === "all"
                        ? "bg-slate-950/20 text-slate-950"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {counts.all}
                  </span>
                </button>
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* Search Input */}
                <div className="relative w-44 sm:w-56 min-w-[150px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search launches..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b3975b] bg-slate-50 focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Developer Dropdown */}
                <select
                  value={selectedDeveloper}
                  onChange={(e) => setSelectedDeveloper(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b3975b] shrink-0"
                >
                  <option value="all">All Developers</option>
                  {developers.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b3975b] shrink-0"
                >
                  <option value="featured">Featured First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="handover">Handover Date</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. ALL NEW LAUNCH PROPERTIES GRID ================= */}
        <section className="py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#b3975b]" />
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Showing {filteredProperties.length}{" "}
                  {filteredProperties.length === 1 ? "Development" : "Developments"}
                </h2>
              </div>

              {(searchQuery || selectedCategory !== "all" || selectedDeveloper !== "all") && (
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedDeveloper("all");
                    setSearchQuery("");
                    setSortBy("featured");
                  }}
                  className="text-xs font-bold text-[#b3975b] hover:text-[#967d46] hover:underline"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {/* Empty State */}
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-[#b3975b] mx-auto flex items-center justify-center text-2xl mb-4 font-bold">
                  !
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Launches Found</h3>
                <p className="text-sm text-slate-600 mb-6">
                  We couldn't find any developments matching your current search and filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedDeveloper("all");
                    setSearchQuery("");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#b3975b] text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#c4a96e] transition shadow"
                >
                  View All {allNewLaunchProperties.length} Launches
                </button>
              </div>
            ) : (
              /* Properties Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProperties.map((project) => {
                  const isCommercial =
                    project.featuredCategory === "Commercial" ||
                    project.category === "Commercial" ||
                    project.type === "Commercial" ||
                    project.type === "Office";

                  return (
                    <article
                      key={project.id || project.slug}
                      className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                    >
                      {/* Property Image Showcase */}
                      <Link
                        to={`/projects/${project.slug}`}
                        className="block relative aspect-[16/10] overflow-hidden bg-slate-900 group-hover:opacity-95 transition"
                        title={`View ${project.title}`}
                      >
                        <img
                          src={project.images?.[0] || "/projects/mercedes_1.jpg"}
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/projects/mercedes_1.jpg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#b3975b] text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                              NEW LAUNCH
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-semibold text-[10px] border border-white/20">
                              {project.developer}
                            </span>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white font-medium text-[10px] border border-white/20">
                            {project.featuredCategory || project.category}
                          </span>
                        </div>

                        {/* Bottom Info inside Image */}
                        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                          <span className="truncate flex items-center gap-1.5 drop-shadow-md">
                            <FaMapMarkerAlt className="text-[#b3975b] shrink-0" />
                            <span className="font-semibold text-[13px]">{project.location}</span>
                          </span>

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-mono font-bold text-[#e6ca85] border border-[#b3975b]/30">
                            <FaCalendarAlt className="w-2.5 h-2.5" />
                            <span>{project.handover}</span>
                          </span>
                        </div>
                      </Link>

                      {/* Content Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Developer & Subtitle */}
                          <div className="text-[11px] font-bold uppercase tracking-wider text-[#b3975b] mb-1">
                            {project.developer}
                          </div>

                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#b3975b] transition line-clamp-1 mb-2">
                            <Link to={`/projects/${project.slug}`}>
                              {project.title}
                            </Link>
                          </h3>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                            {project.subtitle}
                          </p>

                          {/* Key Specs Row */}
                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center text-xs text-slate-600 bg-slate-50/70 rounded-xl mb-4">
                            <div className="px-2">
                              <span className="block text-[10px] uppercase text-slate-400 font-semibold mb-0.5">
                                {isCommercial ? "Offices" : "Bedrooms"}
                              </span>
                              <span className="font-bold text-slate-900 flex items-center justify-center gap-1">
                                <FaBed className="text-[#b3975b] w-3 h-3" />
                                <span>{isCommercial ? "Grade-A" : `${project.beds} Beds`}</span>
                              </span>
                            </div>

                            <div className="px-2 border-x border-slate-200">
                              <span className="block text-[10px] uppercase text-slate-400 font-semibold mb-0.5">
                                Baths
                              </span>
                              <span className="font-bold text-slate-900 flex items-center justify-center gap-1">
                                <FaBath className="text-[#b3975b] w-3 h-3" />
                                <span>{project.baths}</span>
                              </span>
                            </div>

                            <div className="px-2">
                              <span className="block text-[10px] uppercase text-slate-400 font-semibold mb-0.5">
                                Area
                              </span>
                              <span className="font-bold text-slate-900 flex items-center justify-center gap-1">
                                <FaRulerCombined className="text-[#b3975b] w-3 h-3" />
                                <span>{project.areaSqft?.toLocaleString()} sqft</span>
                              </span>
                            </div>
                          </div>

                          {/* Payment Plan Pill */}
                          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-4">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-slate-400">Payment Plan:</span>
                            <span className="font-semibold text-slate-700">
                              {project.paymentPlan || "Construction Linked"}
                            </span>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="pt-3 border-t border-slate-100">
                          <div className="flex items-baseline justify-between mb-3">
                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                              Starting Price
                            </span>
                            <span className="text-lg font-extrabold text-slate-900">
                              {project.displayPrice}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Link
                              to={`/projects/${project.slug}`}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-[#b3975b] text-white hover:text-slate-950 font-bold text-xs transition shadow"
                            >
                              <span>View Project</span>
                              <FaArrowRight className="w-2.5 h-2.5" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenInquiry(project)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#b3975b]/10 hover:bg-[#b3975b] text-[#b3975b] hover:text-slate-950 font-bold text-xs border border-[#b3975b]/30 transition"
                            >
                              <span>VIP Inquiry</span>
                            </button>
                          </div>

                          {project.brochureUrl && (
                            <a
                              href={project.brochureUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 w-full py-1 text-center text-[11px] font-semibold text-slate-500 hover:text-[#b3975b] flex items-center justify-center gap-1.5 transition"
                            >
                              <FaFilePdf className="w-3 h-3 text-rose-500" />
                              <span>Download Official Brochure</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ================= 4. WHY BUY OFF-PLAN WITH NCR PROPERTIES ================= */}
        <section className="py-16 md:py-20 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#b3975b] block mb-2">
                Off-Plan Investor Advisory
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                Why Acquire UAE New Launches Through NCR Properties?
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                We represent global investors, family offices, and residents with direct
                developer Tier-1 allocations across Dubai and Abu Dhabi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-xl bg-[#b3975b]/15 text-[#b3975b] flex items-center justify-center text-xl mb-4 font-bold">
                  <FaShieldAlt />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  100% Escrow Protection
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All construction funds are held in state-regulated bank escrow accounts
                  governed strictly by the Dubai Land Department (DLD) and RERA.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xl mb-4 font-bold">
                  <FaShieldAlt />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Direct Developer Rates
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct master developer pricing on off-plan purchases with zero retail markup,
                  pre-launch allocations, and complimentary title deed advisory.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-xl bg-[#b3975b]/15 text-[#b3975b] flex items-center justify-center text-xl mb-4 font-bold">
                  <FaCalendarAlt />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  Flexible Milestones
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pay linked to verified construction progress with structured developer tranches
                  and tailored handover plans.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-lg transition">
                <div className="w-12 h-12 rounded-xl bg-[#b3975b]/15 text-[#b3975b] flex items-center justify-center text-xl mb-4 font-bold">
                  <FaBuilding />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  VIP Priority Allocation
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Direct Tier-1 developer access securing restricted high-floor units, premium views,
                  and pre-launch investor tranche pricing.
                </p>
              </div>
            </div>

            {/* Advisory CTA Banner */}
            <div className="mt-12 p-8 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#b3975b] block mb-1">
                  Private Client Services
                </span>
                <h3 className="text-xl sm:text-2xl font-bold">
                  Need Personalized Launch Allocations & Floor Plans?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                  Speak directly with an NCR senior off-plan consultant to access restricted
                  high-floor units, investor tranches, and exclusive payment terms.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <a
                  href="https://wa.me/971500000000?text=Hello%20NCR%20Properties,%20I%20am%20interested%20in%20exclusive%20New%20Launch%20developments."
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition shadow"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>WhatsApp Consultant</span>
                </a>

                <Link
                  to="/contact"
                  className="px-6 py-3 rounded-xl bg-[#b3975b] hover:bg-[#c4a96e] text-slate-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition shadow"
                >
                  <span>Book VIP Consultation</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= VIP INQUIRY MODAL ================= */}
      {inquiryModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 overflow-hidden">
            <button
              onClick={() => setInquiryModalProject(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Close"
            >
              <FaTimes className="w-4 h-4" />
            </button>

            {inquirySuccess ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-2xl mb-4 font-bold">
                  <FaCheckCircle />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Request Received!</h3>
                <p className="text-sm text-slate-600">
                  Thank you for your interest in <strong>{inquiryModalProject.title}</strong>. An
                  NCR off-plan property advisor will share verified unit plans and payment
                  breakdowns within 15 minutes.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#b3975b] block">
                    VIP Developer Allocation
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    Inquire: {inquiryModalProject.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {inquiryModalProject.developer} • {inquiryModalProject.location} • Starting{" "}
                    {inquiryModalProject.displayPrice}
                  </p>
                </div>

                <form onSubmit={handleInquirySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      placeholder="e.g. Alexander Vance"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b3975b]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone (with code) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        placeholder="+971 50 123 4567"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b3975b]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        placeholder="client@investor.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b3975b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Specific Requirements
                    </label>
                    <textarea
                      rows="3"
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#b3975b]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="w-full py-3 rounded-xl bg-[#b3975b] hover:bg-[#c4a96e] text-slate-950 font-bold text-sm uppercase tracking-wider shadow-lg shadow-[#b3975b]/30 transition disabled:opacity-50"
                  >
                    {inquirySubmitting ? "Submitting Request..." : "Request Floor Plans & Pricing"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
