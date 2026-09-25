import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";

// If you run frontend+backend on same dev origin with Vite proxy, keep this empty.
// If deployed separately, set VITE_API_BASE_URL="https://api.yoursite.com"
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function absUrlMaybe(url) {
  if (!url) return "/src/img/img1.jpg"; // Default fallback
  if (/^https?:\/\//i.test(url)) return url; // If already absolute, return as is
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

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modeFromUrl = searchParams.get("mode") || ""; // Buy | Rent | Sell | ""
  const categoryFromUrl = searchParams.get("category") || ""; // Residential | Commercial | Community | ""

  const [filters, setFilters] = useState({
    type: "",
    beds: "",
    maxPrice: "",
  });

  const [open, setOpen] = useState(false);

  // ✅ dynamic backend data
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const url = API_BASE ? `${API_BASE}/api/properties` : "/api/properties";
        const res = await fetch(url);

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(
            j.message || `Failed to load properties (${res.status})`
          );
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data ?? [];

        const normalized = list.map((p) => {
          const imgs = Array.isArray(p.images) ? p.images : [];
          return {
            ...p,
            images: imgs.length
              ? imgs.map((img) => absUrlMaybe(img))
              : ["/src/img/img1.jpg"],
          };
        });

        if (!ignore) setProperties(normalized);
      } catch (e) {
        if (!ignore) setError(e?.message || "Failed to load properties");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const minBeds = filters.beds ? Number(filters.beds) : null;
      const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;

      const passMode = !modeFromUrl || p.mode === modeFromUrl;
      const passType = !filters.type || p.type === filters.type;
      const passBeds = !minBeds || Number(p.beds || 0) >= minBeds;
      const passPrice = !maxPrice || Number(p.price || 0) <= maxPrice;

      let passCategory = true;
      if (categoryFromUrl === "Residential") {
        passCategory =
          p.featuredCategory === "Residential" ||
          (!p.featuredCategory &&
            !["Office", "Retail", "Industrial"].includes(p.type));
      } else if (categoryFromUrl === "Commercial") {
        passCategory =
          p.featuredCategory === "Commercial" ||
          ["Office", "Retail", "Industrial"].includes(p.type) ||
          p.type?.toLowerCase().includes("commercial");
      } else if (categoryFromUrl === "Industrial") {
        passCategory =
          p.featuredCategory === "Industrial" ||
          p.type === "Industrial" ||
          p.title?.toLowerCase().includes("industrial");
      }

      return passMode && passType && passBeds && passPrice && passCategory;
    });
  }, [properties, filters, modeFromUrl, categoryFromUrl]);

  function setMode(nextMode) {
    const next = {};
    if (nextMode) next.mode = nextMode;
    if (categoryFromUrl) next.category = categoryFromUrl;
    setSearchParams(next);
  }

  function setCategory(nextCategory) {
    const next = {};
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
              <div className="max-w-2xl">
                <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Listings
                </div>

                <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                  Available Properties{" "}
                  {modeFromUrl ? (
                    <span className="text-slate-500">· {modeFromUrl}</span>
                  ) : null}
                </h1>

                <p className="mt-3 text-slate-600">
                  Filter by mode, category, and key preferences to quickly find
                  the right listing.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="btn-outline md:hidden"
                  onClick={() => setOpen(true)}
                  type="button"
                >
                  Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
                </button>

                <button
                  type="button"
                  className="btn-outline"
                  onClick={() =>
                    setFilters({ type: "", beds: "", maxPrice: "" })
                  }
                  disabled={!activeFilterCount}
                  title="Clear filters"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* NEW: Bayut-like chooser section (only when mode not selected) */}
            {/* {!modeFromUrl ? (
              <div className="mt-8 grid md:grid-cols-2 gap-5">
                <button
                  type="button"
                  onClick={() => setMode("Buy")}
                  className={[
                    "text-left rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition",
                    "p-6 md:p-7 shadow-sm hover:shadow",
                    "focus:outline-none focus:ring-2 focus:ring-[#b3975b]/40 focus:border-[#b3975b]",
                  ].join(" ")}
                >
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Option 01
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">
                    Buy Property
                  </div>
                  <p className="mt-2 text-sm text-slate-600 max-w-md">
                    Explore ready and off-plan options, compare like-for-like,
                    and book viewings with an advisor.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b3975b]">
                    Browse Buy Listings <span aria-hidden="true">→</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("Rent")}
                  className={[
                    "text-left rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition",
                    "p-6 md:p-7 shadow-sm hover:shadow",
                    "focus:outline-none focus:ring-2 focus:ring-[#b3975b]/40 focus:border-[#b3975b]",
                  ].join(" ")}
                >
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                    Option 02
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">
                    Rent Property
                  </div>
                  <p className="mt-2 text-sm text-slate-600 max-w-md">
                    Find rentals by area, price, and bedrooms—shortlist with
                    clarity and speed.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b3975b]">
                    Browse Rental Listings <span aria-hidden="true">→</span>
                  </div>
                </button>
              </div>
            ) : null} */}

            {/* Mode pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
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

            {/* Desktop filters row */}
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
                    Max: AED {Number(filters.maxPrice).toLocaleString()}
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
                    <PropertyCard key={p.id || p._id} property={p} />
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

      {/* Mobile Filter Drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl border border-slate-200 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Filters
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mt-2">
                  Refine results
                </h3>
              </div>

              <button
                onClick={() => setOpen(false)}
                type="button"
                className="btn-outline"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4">
              <FilterControls filters={filters} setFilters={setFilters} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="btn-outline w-full"
                onClick={() => setFilters({ type: "", beds: "", maxPrice: "" })}
              >
                Reset
              </button>
              <button
                className="btn-primary w-full"
                onClick={() => setOpen(false)}
                type="button"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

/* ---------------- FILTER CONTROLS ---------------- */

function FilterControls({ filters, setFilters }) {
  return (
    <>
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

      {/* <div>
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
      </div> */}

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
          <option value="3000000">AED 3M</option>
          <option value="5000000">AED 5M</option>
          <option value="10000000">AED 10M</option>
          <option value="20000000">AED 20M+</option>
        </select>
      </div>

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
