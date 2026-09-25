import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { appStore } from "../lib/appStore";
import { isIndiaProperty } from "../lib/propertyUtils";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import LatestLaunchesCarousel from "../components/LatestLaunchesCarousel";
import CategorizedProjectsSection from "../components/CategorizedProjectsSection";

import discreetImg from "../img/trust/Discreet.png";
import dataDriveImg from "../img/trust/datadrive.webp";
import internationalImg from "../img/trust/longterm.jpg";
import upwardTrendImg from "../img/trust/upward-trend.svg";

// Curated 4 Trust Showcase Images with high-growth financial trajectory
const trustImages = [
  {
    src: discreetImg,
    alt: "Discreet & Confidential Transactions",
    name: "Discreet",
  },
  {
    src: dataDriveImg,
    alt: "Data-Led Market Insight",
    name: "Data-Led Insight",
  },
  {
    src: internationalImg,
    alt: "International Buyer Expertise",
    name: "International Buyer",
  },
  {
    src: upwardTrendImg,
    alt: "Wealth Growth & Very Upward Market Trajectory",
    name: "Financial Growth",
  },
];

// Auto-load partner logos
const partnerLogoModules = import.meta.glob(
  "../img/partners/*.{png,jpg,jpeg,webp,avif,svg}",
  {
    eager: true,
  }
);
const partnerLogoList = Object.entries(partnerLogoModules)
  .map(([path, mod]) => ({
    src: mod.default,
    name: path.split("/").pop()?.split(".")?.[0] || "Partner",
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function Home() {
  const [properties, setProperties] = useState(() => appStore.getState().properties || []);

  useEffect(() => {
    let ignore = false;

    function syncData(backendList = []) {
      const storeList = appStore.getState().properties || [];
      const map = new Map();

      storeList.forEach((p) => {
        const key = String(p.id || p._id);
        map.set(key, p);
      });

      backendList.forEach((p) => {
        const key = String(p.id || p._id);
        const existing = map.get(key) || {};
        map.set(key, { ...existing, ...p });
      });

      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.listedAt || 0).getTime() - new Date(a.listedAt || 0).getTime()
      );

      if (!ignore) {
        setProperties(combined);
      }
    }

    (async () => {
      try {
        const res = await fetch("/api/properties").catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            syncData(data);
          }
        }
      } catch {
        syncData([]);
      }
    })();

    const unsub = appStore.subscribe((state) => {
      if (!ignore) {
        syncData(state.properties || []);
      }
    });

    return () => {
      ignore = true;
      unsub();
    };
  }, []);

  // ✅ Duplicate list so marquee feels continuous
  const partnerLogos = useMemo(() => {
    if (!partnerLogoList.length) return [];
    return [...partnerLogoList, ...partnerLogoList];
  }, []);

  // ✅ Categorize into 3 buckets for Featured carousels (Enforcing Two-Stage Approval Workflow)
  const featuredBuckets = useMemo(() => {
    const rawList = Array.isArray(properties) ? properties : [];
    // Only approved properties that completed both Checker (Stage 1) and Admin (Stage 2), excluding India properties (which belong strictly in /india)
    const list = rawList.filter(
      (p) =>
        (p.moderationStatus === "approved" || (!p.moderationStatus && p.adminApproved)) &&
        p.checkerApproved !== false &&
        p.adminApproved !== false &&
        p.moderationStatus !== "pending_checker" &&
        p.moderationStatus !== "pending_admin" &&
        p.moderationStatus !== "rejected" &&
        !isIndiaProperty(p)
    );

    const residential = list.filter(
      (p) => p?.featuredCategory === "Residential"
    );
    const commercial = list.filter((p) => p?.featuredCategory === "Commercial");
    const community = list.filter((p) => p?.featuredCategory === "Community");

    return { residential, commercial, community };
  }, [properties]);

  const hasFeatured =
    featuredBuckets.residential.length ||
    featuredBuckets.commercial.length ||
    featuredBuckets.community.length;

  return (
    <>
      <Header />

      {/* ================= 1. LATEST LAUNCHES (HERO CAROUSEL WITH 6 PROJECT CARDS) ================= */}
      <LatestLaunchesCarousel />

      {/* ================= 2. HOMEPAGE CATEGORIZATION (3 CAROUSELS: 9 PROJECTS) ================= */}
      <CategorizedProjectsSection />

      {/* ================= MARKET STATS (OUR TRACK RECORD - UNCHANGED) ================= */}
      <section className="section bg-white relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/60 to-transparent pointer-events-none" />

        <div className="relative container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="uppercase tracking-[0.3em] text-[11px] text-[#b3975b] font-semibold">
              Our Track Record
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-5 tracking-tight">
              Proven Results in Premium Real Estate
            </h2>

            <div className="w-20 h-[2px] bg-[#b3975b] mx-auto mb-6" />

            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              A consistent history of performance across Dubai’s most
              sought-after residential and investment destinations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <StatCard number="20+" label="Years of Experience" />
            <StatCard number="2,500+" label="Homes Sold" />
            <StatCard number="98%" label="Client Satisfaction" />
            <StatCard number="12" label="Prime Locations" />
          </div>
        </div>
      </section>

      {/* ================= TRUSTED DEVELOPERS (PARTNERS) ================= */}
      <section className="section bg-slate-50/60 py-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="uppercase tracking-[0.25em] text-xs font-semibold text-[#b3975b]">
              Trusted Developers
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-4 mb-4">
              NCR Properties — Trusted Developer Network
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Direct access to UAE’s leading developers, master-planned
              communities and branded residences through established advisory
              relationships.
            </p>
          </div>

          <div className="marquee overflow-hidden py-4">
            <div className="marquee-track flex">
              {partnerLogos.map((p, idx) => (
                <PartnerLogo
                  key={`${p.name}-${idx}`}
                  src={p.src}
                  alt={p.name}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="section bg-white py-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="uppercase tracking-[0.35em] text-xs font-semibold text-[#b3975b]">
              Services
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-5 leading-tight">
              Real Estate Services, Built Around Your Goals
            </h2>

            <div className="w-20 h-[2px] bg-[#b3975b] mx-auto mb-6" />

            <p className="text-slate-600 text-base md:text-lg leading-relaxed">
              From your first search to your next acquisition, NCR Properties
              provides integrated advisory, brokerage, and investment guidance
              at every stage of property ownership in Dubai-UAE.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            <RichService
              number="01"
              title="Buying Property in Dubai"
              text="Discover residential, waterfront, and off-plan opportunities curated for end users and international buyers seeking quality communities and lasting value."
            />
            <RichService
              number="02"
              title="Property Investment Advisory"
              text="Build wealth with yield-focused and capital-growth strategies across Dubai's highest-performing residential and mixed-use destinations."
            />
            <RichService
              number="03"
              title="Off-Plan & Latest Launches"
              text="Get early access to new project launches, branded residences, and master-planned developments — with clear payment plan structures and priority allocations."
            />
            <RichService
              number="04"
              title="Selling Property in Dubai"
              text="Achieve the best outcome with strategic pricing, positioning, and qualified buyer targeting across local and international markets."
            />
            <RichService
              number="05"
              title="Leasing & Rental Services"
              text="Maximise your property's returns with long- and short-term rental strategy, tenant sourcing, and full leasing support."
            />
            <RichService
              number="06"
              title="Mortgage & Financing Support"
              text="Secure the right financing with trusted bank partnerships and eligibility guidance for UAE residents and overseas buyers alike."
            />
          </div>
        </div>
      </section>

      {/* ================= OWNER LEAD FORM ================= */}
      <section className="section bg-slate-900 text-white py-24">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="uppercase tracking-[0.25em] text-xs font-semibold text-[#b3975b]">
              For Property Owners
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-5">
              Thinking of Buying, Selling or Leasing Your Property?
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Receive a confidential valuation and advisory strategy tailored to
              your asset.
            </p>
          </div>

          <form className="bg-white text-slate-900 rounded-2xl p-8 sm:p-10 shadow-2xl border border-slate-100">
            <input
              name="fullName"
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#b3975b] text-sm mb-4"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#b3975b] text-sm mb-4"
              required
            />
            <input
              name="phone"
              placeholder="Phone Number"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#b3975b] text-sm mb-4"
            />
            <select
              name="service"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#b3975b] text-sm mb-6 bg-white"
            >
              <option value="">Service Interested In</option>
              <option value="buy">Buying</option>
              <option value="sell">Selling</option>
              <option value="lease">Leasing</option>
              <option value="management">Property Management</option>
              <option value="investment">Investment Advisory</option>
            </select>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="submit"
                className="w-full py-3.5 bg-[#b3975b] hover:bg-[#9e824c] text-white font-medium rounded-xl transition shadow-md text-sm text-center"
              >
                Speak to an Advisor
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = "tel:+97143431114";
                }}
                className="w-full py-3.5 border border-slate-300 hover:border-[#b3975b] hover:text-[#b3975b] text-slate-800 font-medium rounded-xl transition text-sm text-center"
              >
                Request a Call Back
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-4 text-center">
              Your information is kept strictly confidential.
            </p>
          </form>
        </div>
      </section>

      {/* ================= WHY NCR (TRUST) ================= */}
      <section className="section bg-slate-50/60 py-24">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="uppercase tracking-[0.3em] text-xs font-semibold text-[#b3975b]">
              Why NCR
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-5">
              Why Clients Choose NCR Properties
            </h2>

            <div className="w-20 h-[2px] bg-[#b3975b]" />
          </div>

          <div className="grid md:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Left Column: 4 Curated Images with Upward Trend Graph visible on Mobile, Tablet & Desktop */}
            <div className="md:col-span-5 h-full">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full min-h-[260px] sm:min-h-[320px] md:min-h-[380px]">
                {Array.from({ length: 4 }).map((_, i) => {
                  const img = trustImages[i];
                  return (
                    <div
                      key={i}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg hover:border-[#b3975b]/40 h-full min-h-[130px] sm:min-h-[160px]"
                    >
                      {img?.src ? (
                        <img
                          src={img.src}
                          alt={img.alt}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: 4 Trust Cards matching exact height */}
            <div className="md:col-span-7 h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 h-full">
                <TrustCard
                  number="01"
                  title="Discreet & Confidential Transactions"
                  text="Every NCR client is handled with absolute discretion, professionalism, and strict confidentiality."
                />
                <TrustCard
                  number="02"
                  title="Data-Led Market Insight"
                  text="Guided by real-time Dubai property intelligence and deep developer knowledge, we help clients achieve maximise returns while preserving asset value."
                />
                <TrustCard
                  number="03"
                  title="International Buyer Expertise"
                  text="Specialised support for overseas clients purchasing property securely in Dubai."
                />
                <TrustCard
                  number="04"
                  title="Developer Network Access"
                  text="Direct advisory relationships enabling launch allocations, investor pricing and priority inventory."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* ---------- REUSABLE COMPONENTS ---------- */

function StatCard({ number, label }) {
  return (
    <div className="group relative bg-white rounded-2xl p-6 sm:p-8 text-center border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#b3975b] transition-all duration-300 group-hover:w-16" />
      <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
        {number}
      </div>
      <p className="text-[11px] sm:text-xs tracking-[0.2em] uppercase font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

function RichService({ number, title, text }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm transition-all hover:shadow-md">
      <span className="text-[#b3975b] text-xs font-bold tracking-widest block mb-3">
        {number}
      </span>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function TrustCard({ number, title, text }) {
  return (
    <div className="group relative rounded-2xl p-6 sm:p-7 bg-white border border-slate-200/70 shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl hover:border-[#b3975b]/40 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[#b3975b] text-xs font-bold tracking-widest">
          {number}
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
        {title}
      </h3>
      <p className="text-slate-600 leading-relaxed text-xs sm:text-sm">
        {text}
      </p>
    </div>
  );
}

function PartnerLogo({ src, alt = "Partner" }) {
  return (
    <div className="px-4 sm:px-6 flex items-center">
      <div className="h-16 w-44 sm:w-48 rounded-xl border border-slate-200/70 bg-white shadow-sm flex items-center justify-center transition-all duration-300 hover:shadow-md hover:border-[#b3975b]/40">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="max-h-9 max-w-[75%] object-contain opacity-90 hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  );
}

function FeaturedCarousel({ title, subtitle, items }) {
  const safe = useMemo(() => {
    return (Array.isArray(items) ? items : []).filter(Boolean);
  }, [items]);

  const pageSize = 3;
  const groups = useMemo(() => {
    const out = [];
    for (let i = 0; i < safe.length; i += pageSize)
      out.push(safe.slice(i, i + pageSize));
    return out;
  }, [safe]);

  const totalPages = groups.length;
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [title, safe.length]);

  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-slate-400">
            Featured
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            {title}
          </h3>
          {subtitle ? (
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition ${
              !canPrev ? "opacity-40 pointer-events-none" : ""
            }`}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </button>

          <button
            type="button"
            className={`px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition ${
              !canNext ? "opacity-40 pointer-events-none" : ""
            }`}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {(groups[page] || []).map((p) => (
          <PropertyCard key={p.id ?? p._id} property={p} />
        ))}

        {!safe.length && (
          <div className="md:col-span-3 text-sm text-slate-500 py-8 text-center">
            No featured items available.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
          <div className="flex gap-1.5">
            {groups.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === page ? "w-8 bg-[#b3975b]" : "w-3 bg-slate-200"
                }`}
                aria-label={`Go to ${title} page ${i + 1}`}
              />
            ))}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Page {page + 1} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}
