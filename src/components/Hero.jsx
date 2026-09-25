import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isIndiaProperty } from "../lib/propertyUtils";

function resolveImgSrc(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object" && typeof img.default === "string")
    return img.default;
  return "";
}

// Mongo ObjectId -> timestamp (ms). Works as a last-resort sort key.
function objectIdToMs(id) {
  if (typeof id !== "string" || id.length < 8) return 0;
  const hex = id.slice(0, 8);
  const seconds = Number.parseInt(hex, 16);
  return Number.isFinite(seconds) ? seconds * 1000 : 0;
}

function toMs(v) {
  if (!v) return 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}

// ✅ build exactly 5 slides: newest by publish time, hero uses only FIRST image
function buildLaunchesFromProperties(props) {
  const arr = Array.isArray(props) ? props : [];

  // Strictly exclude properties belonging to India (they belong exclusively in /india)
  const filteredProps = arr.filter((p) => !isIndiaProperty(p));

  const sorted = filteredProps.slice().sort((a, b) => {
    const aTime =
      toMs(a?.createdAt) ||
      toMs(a?.updatedAt) ||
      toMs(a?.listedAt) ||
      objectIdToMs(a?._id);

    const bTime =
      toMs(b?.createdAt) ||
      toMs(b?.updatedAt) ||
      toMs(b?.listedAt) ||
      objectIdToMs(b?._id);

    return bTime - aTime;
  });

  const mapped = sorted
    .map((p) => {
      // ✅ Hero uses ONLY the first image of the property
      const imgs = Array.isArray(p?.images) ? p.images : [];
      const bg = resolveImgSrc(imgs[0]);
      if (!bg) return null;

      const id = p?.id ?? p?._id;
      const to = id ? `/property/${id}` : "/listings";

      const projectName = p?.project?.projectName || p?.title || "Latest Listing";
      const subtitle =
        p?.project?.developer ||
        [p?.community || p?.location, p?.city].filter(Boolean).join(", ") ||
        "Explore our latest listing";

      const key = String(p?._id || id || bg);
      return { key, to, bg, projectName, subtitle };
    })
    .filter(Boolean);

  const unique = Array.from(new Map(mapped.map((x) => [x.key, x])).values());
  if (!unique.length) return [];

  const out = [...unique];
  while (out.length < 5) out.push(unique[out.length % unique.length]);
  return out.slice(0, 5);
}

export default function Hero() {
  const navigate = useNavigate();

  const [apiProperties, setApiProperties] = useState([]);
  const [index, setIndex] = useState(0);

  // Master search (Springfield-like simple)
  const [q, setQ] = useState("");

  useEffect(() => {
    let canceled = false;

    async function load() {
      try {
        const res = await fetch("/api/properties");
        if (!res.ok) throw new Error("Failed to load properties");
        const data = await res.json();
        if (!canceled) setApiProperties(Array.isArray(data) ? data : []);
      } catch {
        if (!canceled) setApiProperties([]);
      }
    }

    load();
    return () => {
      canceled = true;
    };
  }, []);

  const launches = useMemo(
    () => buildLaunchesFromProperties(apiProperties),
    [apiProperties]
  );

  useEffect(() => setIndex(0), [launches.length]);

  useEffect(() => {
    if (!launches.length) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % launches.length);
    }, 4500);
    return () => clearInterval(t);
  }, [launches.length]);

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    navigate(`/listings?${params.toString()}`);
  };

  const active = launches[index];

  return (
    <section className="relative h-screen overflow-hidden">
      {/* ✅ Image Background (Developer image) */}
      {launches.map((item, i) => (
        <Link
          key={`${item.key}-${i}`}
          to={item.to}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label={`View ${item.projectName}`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${item.bg})` }}
          />
        </Link>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/10" />

      {/* Content (flow order) */}
      <div className="relative h-full">
        <div className="container h-full flex flex-col justify-end pb-24 md:pb-12">
          {/* New launch text */}
          <div className="inline-flex items-center gap-3 px-5 py-3 mb-4 rounded-full bg-black/60 backdrop-blur border border-[#b3975b]/40 w-fit">
            <span className="h-2 w-2 rounded-full bg-[#b3975b]" />
            <span className="text-[11px] uppercase tracking-[0.35em] text-[#b3975b] font-semibold">
              New Launch
            </span>
          </div>

          {/* Name of the project */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-3 max-w-3xl leading-tight tracking-tight">
            {active?.projectName || "Explore New Launches"}
          </h1>

          {/* Short subtitle */}
          <p className="text-white/85 text-sm md:text-base mb-6 max-w-xl leading-relaxed">
            {active?.subtitle ||
              "Discover premium off-plan projects across prime Dubai communities."}
          </p>

          {/* View more (CTA) */}
          <div className="mb-6">
            <Link
              to={active?.to || "/listings"}
              className="inline-flex items-center justify-center rounded-xl bg-[#b3975b] text-black font-medium px-5 py-3 hover:opacity-90 transition"
            >
              View More
            </Link>
          </div>

          {/* Master search (Like Springfield) */}
          <form
            onSubmit={onSearch}
            className="bg-white/95 rounded-2xl p-3 md:p-4 max-w-3xl"
          >
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <input
                className="input w-full"
                placeholder="Search properties by location, community, or project…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />

              <button
                type="submit"
                className="w-full md:w-auto bg-[#b3975b] text-black font-medium rounded-xl px-6 py-3 hover:opacity-90 transition shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Indicators (5) */}
          {!!launches.length && (
            <div className="flex gap-2 mt-5">
              {launches.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1 w-10 rounded-full transition ${
                    i === index ? "bg-[#b3975b]" : "bg-white/40"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
