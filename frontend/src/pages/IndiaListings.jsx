import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { appStore } from "../lib/appStore";
import { isIndiaProperty, matchesIndiaCity, getCityDisplayLabel } from "../lib/propertyUtils";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const AED_TO_INR = 22; // Conversion rate (1 AED = 22 INR)

function absUrlMaybe(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  if (!API_BASE) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center rounded-full px-4 py-2",
        "text-xs font-semibold uppercase tracking-widest transition",
        "border",
        active
          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default function IndiaListings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get("city") || ""; // Delhi NCR, Tricity, Bangalore
  const modeFromUrl = searchParams.get("mode") || ""; // Buy | Rent | Sell | ""
  const categoryFromUrl = searchParams.get("category") || ""; // Residential | Commercial | Community | ""

  const [properties, setProperties] = useState(() => {
    return (appStore.getState().properties || []).filter(isIndiaProperty);
  });
  const [filters, setFilters] = useState({
    type: "",
    beds: "",
    maxPrice: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const combined = Array.from(map.values()).filter(isIndiaProperty);

      const normalized = combined.map((p) => {
        const imgs = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
        return { ...p, images: imgs.map(absUrlMaybe) };
      });

      if (!ignore) setProperties(normalized);
    }

    async function load() {
      try {
        setLoading(true);
        setError("");

        const url = `${API_BASE}/api/properties?location=India`;
        const res = await fetch(url).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data?.data ?? [];
          syncData(list);
        } else {
          syncData([]);
        }
      } catch (e) {
        if (!ignore) setError(e?.message || "Failed to load properties");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

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

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      // TWO-STAGE APPROVAL WORKFLOW ENFORCEMENT:
      const isApprovedLive =
        (p.moderationStatus === "approved" || (!p.moderationStatus && p.adminApproved)) &&
        p.checkerApproved !== false &&
        p.adminApproved !== false &&
        p.moderationStatus !== "pending_checker" &&
        p.moderationStatus !== "pending_admin" &&
        p.moderationStatus !== "rejected";

      if (!isApprovedLive) return false;

      // Must be India property
      if (!isIndiaProperty(p)) return false;

      const minBeds = filters.beds ? Number(filters.beds) : null;
      const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;

      // Region & City matching
      const passCity = matchesIndiaCity(p, city);
      const passType = !filters.type || p.type === filters.type;
      const passBeds = !minBeds || Number(p.beds || 0) >= minBeds;

      // Ensure property price is converted to INR for comparison
      const propertyPriceInINR = p.price ? p.price * AED_TO_INR : 0;
      const passPrice = !maxPrice || propertyPriceInINR <= maxPrice;

      const passMode = !modeFromUrl || p.mode === modeFromUrl;
      const passCategory =
        !categoryFromUrl || (p.featuredCategory || "") === categoryFromUrl;

      return (
        passCity &&
        passType &&
        passBeds &&
        passPrice &&
        passMode &&
        passCategory
      );
    });
  }, [properties, filters, city, modeFromUrl, categoryFromUrl]);

  function setCityFilter(selectedCity) {
    const next = {};
    if (selectedCity) next.city = selectedCity;
    if (modeFromUrl) next.mode = modeFromUrl;
    if (categoryFromUrl) next.category = categoryFromUrl;
    setSearchParams(next);
  }

  function setMode(nextMode) {
    const next = {};
    if (city) next.city = city;
    if (nextMode) next.mode = nextMode;
    if (categoryFromUrl) next.category = categoryFromUrl;
    setSearchParams(next);
  }

  function setCategory(nextCategory) {
    const next = {};
    if (city) next.city = city;
    if (modeFromUrl) next.mode = modeFromUrl;
    if (nextCategory) next.category = nextCategory;
    setSearchParams(next);
  }

  const activeFilterCount =
    (filters.type ? 1 : 0) +
    (filters.beds ? 1 : 0) +
    (filters.maxPrice ? 1 : 0);

  return (
    <>
      <Header />

      <main className="pt-28 md:pt-32 bg-slate-50 min-h-screen">
        <div className="container">
          {/* Header / Hero */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#b3975b]/15 text-[#b3975b] text-xs font-bold uppercase tracking-widest mb-3">
                  NCR Properties — NRI Advisory Desk 🇮🇳
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                  {city
                    ? `NRI Property Investments in ${getCityDisplayLabel(city)}`
                    : "NRI Real Estate Advisory & Investment Desk 🇮🇳"}
                </h1>

                <p className="mt-3 text-slate-600 text-sm md:text-base leading-relaxed">
                  {city
                    ? `Curated high-yield and luxury residential assets in ${getCityDisplayLabel(city)}.`
                    : "Seamless property investment, portfolio management, and high-yield acquisitions across India's premier real estate markets for Non-Resident Indians and global investors."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setFilters({ type: "", beds: "", maxPrice: "" });
                    setCityFilter("");
                  }}
                  disabled={!activeFilterCount && !city}
                  title="Clear all filters"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* City Regional Hub pills */}
            <div className="mt-6">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Regional Hubs:
              </div>
              <div className="flex flex-wrap gap-2">
                <Pill active={!city} onClick={() => setCityFilter("")}>
                  All India 🇮🇳
                </Pill>
                <Pill
                  active={city.toLowerCase().includes("delhi") || city.toLowerCase().includes("ncr")}
                  onClick={() => setCityFilter("Delhi NCR")}
                >
                  Delhi NCR
                </Pill>
                <Pill
                  active={city.toLowerCase().includes("tricity") || city.toLowerCase().includes("chandigarh")}
                  onClick={() => setCityFilter("Tricity")}
                >
                  Tricity (Chandigarh • Panchkula • Mohali)
                </Pill>
                <Pill
                  active={city.toLowerCase().includes("bangalore")}
                  onClick={() => setCityFilter("Bangalore")}
                >
                  Bangalore Tech Corridor
                </Pill>
              </div>
            </div>

            {/* Mode pills */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Mode:
              </span>
              {["Buy", "Sell", "Rent"].map((m) => (
                <Pill
                  key={m}
                  active={modeFromUrl === m}
                  onClick={() => setMode(m)}
                >
                  {m}
                </Pill>
              ))}
              <Pill active={!modeFromUrl} onClick={() => setMode("")}>
                ALL
              </Pill>
            </div>

            {/* Category pills */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
                Category:
              </span>
              <Pill
                active={categoryFromUrl === "Residential"}
                onClick={() => setCategory("Residential")}
              >
                Residential
              </Pill>
              <Pill
                active={categoryFromUrl === "Commercial"}
                onClick={() => setCategory("Commercial")}
              >
                Commercial
              </Pill>
              <Pill
                active={categoryFromUrl === "Industrial"}
                onClick={() => setCategory("Industrial")}
              >
                Industrial
              </Pill>
              <Pill active={!categoryFromUrl} onClick={() => setCategory("")}>
                ALL
              </Pill>
            </div>

            {/* Sub-heading for Commercial: Office, Retail, Industrial */}
            {categoryFromUrl === "Commercial" && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 animate-fadeIn">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#b3975b] mr-1">
                  Commercial Sub-categories:
                </span>
                {["Office", "Retail", "Industrial"].map((subType) => (
                  <button
                    key={subType}
                    type="button"
                    onClick={() =>
                      setFilters((f) => ({
                        ...f,
                        type: f.type === subType ? "" : subType,
                      }))
                    }
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition border ${
                      filters.type === subType
                        ? "bg-[#b3975b] text-white border-[#b3975b] shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:border-[#b3975b] hover:text-[#b3975b]"
                    }`}
                  >
                    {subType}
                  </button>
                ))}
              </div>
            )}

            {/* Filters */}
            <div className="mt-6 hidden md:block">
              <div className="grid md:grid-cols-4 gap-4">
                <FilterControls filters={filters} setFilters={setFilters} />
              </div>
            </div>
          </div>

          {/* Results bar */}
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm text-slate-600">
              {loading ? (
                "Loading properties…"
              ) : error ? (
                <span className="text-red-600">{error}</span>
              ) : (
                <>
                  Showing{" "}
                  <span className="font-semibold text-slate-900">
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {properties.length}
                  </span>{" "}
                  properties
                </>
              )}
            </div>

            {!loading &&
            !error &&
            (modeFromUrl || categoryFromUrl || activeFilterCount) ? (
              <div className="flex flex-wrap gap-2">
                {modeFromUrl ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    Mode: {modeFromUrl}
                  </span>
                ) : null}
                {categoryFromUrl ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    Category:{" "}
                    {categoryFromUrl === "Community"
                      ? "Community Projects"
                      : categoryFromUrl}
                  </span>
                ) : null}
                {filters.type ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    Type: {filters.type}
                  </span>
                ) : null}
                {filters.beds ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    Beds: {filters.beds}+
                  </span>
                ) : null}
                {filters.maxPrice ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    Max: ₹ {Number(filters.maxPrice).toLocaleString()}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Grid */}
          <div className="mt-6 pb-16">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {!loading && !error ? (
                filtered.length ? (
                  filtered.map((p) => (
                    <PropertyCard
                      key={p.id || p._id}
                      property={{
                        ...p,
                        price: p.price
                          ? `₹${(p.price * AED_TO_INR).toLocaleString()}`
                          : "Price on request",
                      }}
                    />
                  ))
                ) : (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-slate-600">
                      No properties match your criteria.
                    </div>
                  </div>
                )
              ) : null}

              {loading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                    >
                      <div className="h-56 bg-slate-100 animate-pulse" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 w-2/3 bg-slate-100 animate-pulse rounded" />
                        <div className="h-3 w-1/2 bg-slate-100 animate-pulse rounded" />
                        <div className="h-4 w-1/3 bg-slate-100 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/* ---------------- FILTER CONTROLS ---------------- */

function FilterControls({ filters, setFilters }) {
  return (
    <>
      {/* Type Filter */}
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          Type
        </div>
        <select
          className="input"
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">Any</option>
          <option value="Villa">Villa</option>
          <option value="Apartment">Apartment</option>
          <option value="Townhouse">Townhouse</option>
          <option value="Off-Plan">Off-Plan</option>
          <option value="Office">Office</option>
          <option value="Retail">Retail</option>
          <option value="Industrial">Industrial</option>
        </select>
      </div>

      {/* Bedrooms Filter */}
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          Bedrooms
        </div>
        <select
          className="input"
          value={filters.beds}
          onChange={(e) => setFilters((f) => ({ ...f, beds: e.target.value }))}
        >
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      {/* Max Price Filter */}
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">
          Max Price
        </div>
        <select
          className="input"
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters((f) => ({ ...f, maxPrice: e.target.value }))
          }
        >
          <option value="">Any</option>
          <option value={3000000 * 22}>₹66L</option>
          <option value={5000000 * 22}>₹1.1Cr</option>
          <option value={10000000 * 22}>₹2.2Cr</option>
          <option value={20000000 * 22}>₹4.4Cr+</option>
        </select>
      </div>

      {/* Reset Button */}
      <div className="flex items-end">
        <button
          type="button"
          className="btn-outline w-full"
          onClick={() =>
            setFilters((prev) => ({
              ...prev,
              type: "",
              beds: "",
              maxPrice: "",
            }))
          }
        >
          Reset
        </button>
      </div>
    </>
  );
}
