import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { appStore } from "../lib/appStore";
import { LATEST_LAUNCHES, CATEGORIZED_PROJECTS } from "../data/newLaunchesData";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaWhatsapp } from "react-icons/fa";

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function filenameOnly(v) {
  const s = String(v || "").trim();
  if (!s) return "";
  const noQ = s.split("?")[0].split("#")[0];
  const parts = noQ.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

function apiOrigin() {
  return String(import.meta?.env?.VITE_API_ORIGIN || "").replace(/\/$/, "");
}

function toUploadSrc(nameOrPath) {
  const t = String(nameOrPath || "").trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t) || t.startsWith("data:") || t.startsWith("/src/") || t.startsWith("/img/") || t.startsWith("/projects/") || t.startsWith("/floorplans/")) return t;

  if (t.startsWith("/uploads/")) {
    const base = apiOrigin();
    return base ? `${base}${t}` : t;
  }

  const f = filenameOnly(t);
  const base = apiOrigin();
  return base ? `${base}/uploads/${f}` : `/uploads/${f}`;
}

function normalizeUploadPath(v) {
  const t = String(v || "").trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/uploads/")) return t;
  const name = t.split("?")[0].split("#")[0].split("/").filter(Boolean).pop();
  return name ? `/uploads/${name}` : "";
}

function uniqStrings(arr) {
  const list = Array.isArray(arr) ? arr : [];
  const out = [];
  const seen = new Set();
  for (const x of list) {
    const t = String(x || "").trim();
    if (!t) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function toGoogleDriveDirectDownload(url) {
  const s = String(url || "").trim();
  if (!s) return "";

  // file/d/<id>/view
  const m1 = s.match(/drive\.google\.com\/file\/d\/([^/]+)\//i);
  if (m1?.[1]) return `https://drive.google.com/uc?export=download&id=${m1[1]}`;

  // open?id=<id>
  try {
    const u = new URL(s);
    if (u.hostname.includes("drive.google.com")) {
      const id = u.searchParams.get("id");
      if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
    }
  } catch {}

  return s;
}

export default function Property() {
  const { id, slug } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inq, setInq] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const [planModal, setPlanModal] = useState({
    open: false,
    src: "",
    title: "",
  });
  const [brochureUnlocked, setBrochureUnlocked] = useState(false);
  const [activeSection, setActiveSection] = useState("details");
  const [stickyTabsOpen, setStickyTabsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const heroSentinelRef = useRef(null);
  const heroTabsSentinelRef = useRef(null);

  const TOPBAR_TEXT_STYLE = {
    color: "rgb(255, 255, 255)",
    fontWeight: 900,
    textShadow:
      "0 1px 0 rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.75), 0 10px 28px rgba(0,0,0,0.55)",
    WebkitTextStroke: "0.35px rgba(0,0,0,0.55)",
  };

  const [heroIdx, setHeroIdx] = useState(0);

  // ✅ add gallery active index state
  const [galleryActiveIdx, setGalleryActiveIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError("");
        setLoading(true);

        // Check new off-plan launches & categorized projects first
        const allNewLaunches = [
          ...LATEST_LAUNCHES,
          ...CATEGORIZED_PROJECTS.residential,
          ...CATEGORIZED_PROJECTS.commercial,
          ...CATEGORIZED_PROJECTS.community,
        ];
        const searchKey = String(id || slug || "");
        found = allNewLaunches.find((p) => {
          const pId = String(p.id ?? "");
          const pSlug = p.slug || slugify(p.project?.projectName || p.title || "");
          return (
            pId === searchKey ||
            pSlug === searchKey ||
            slugify(p.title) === slugify(searchKey) ||
            slugify(p.title) === slugify(slug || "")
          );
        });

        // If not found in launches, fetch from API
        if (!found) {
          try {
            const base = apiOrigin();
            const path = slug
              ? `/api/properties/by-slug/${encodeURIComponent(slug)}`
              : `/api/properties/by/${encodeURIComponent(id)}`;
            const url = base ? `${base}${path}` : path;
            const res = await fetch(url);
            if (res.ok) {
              found = await res.json().catch(() => null);
            }
          } catch {
            // network or API missing, will check appStore next
          }
        }

        // Fallback to appStore properties
        if (!found) {
          const storeProps = appStore.getState().properties || [];
          found = storeProps.find((p) => {
            const pId = String(p.id ?? p._id ?? "");
            const pSlug = p.slug || slugify(p.project?.projectName || p.title || "");
            return (
              pId === searchKey ||
              pSlug === searchKey ||
              slugify(p.title) === slugify(searchKey) ||
              slugify(p.title) === slugify(slug || "")
            );
          });
        }

        if (!found) throw new Error("Property listing not found");
        if (!cancelled) setProperty(found);
      } catch (err) {
        if (!cancelled) {
          setProperty(null);
          setError(err?.message || "Failed to load");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const unsub = appStore.subscribe((state) => {
      if (cancelled) return;
      const storeProps = state.properties || [];
      const searchKey = String(id || slug || "");
      const found = storeProps.find((p) => {
        const pId = String(p.id ?? p._id ?? "");
        const pSlug = p.slug || slugify(p.project?.projectName || p.title || "");
        return (
          pId === searchKey ||
          pSlug === searchKey ||
          slugify(p.title) === slugify(searchKey) ||
          slugify(p.title) === slugify(slug || "")
        );
      });
      if (found) {
        setProperty((prev) => ({ ...prev, ...found }));
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [id, slug]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setPlanModal((s) => ({ ...s, open: false }));
    };
    if (planModal.open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [planModal.open]);

  useEffect(() => {
    if (!id || slug) return;
    if (!property) return;

    const canonicalSlug =
      property.slug ||
      slugify(property?.project?.projectName || property?.title || "");
    if (!canonicalSlug) return;

    const hash = window.location.hash || "";
    navigate(`/projects/${canonicalSlug}${hash}`, { replace: true });
  }, [id, slug, property, navigate]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const project = property?.project || {};

  // =============================
  // FLOOR PLANS (source of truth)
  // =============================
  const floorplanPdfUrl = property?.project?.floorplanPdfUrl || "";

  const floorPlans = useMemo(() => {
    const a = Array.isArray(property?.floorPlans) ? property.floorPlans : [];
    const b = Array.isArray(property?.project?.floorPlans)
      ? property.project.floorPlans
      : [];
    return a.length ? a : b.length ? b : [];
  }, [property?.floorPlans, property?.project?.floorPlans]);

  // =============================
  // HERO IMAGE SLIDER (1–4 images)
  // =============================
  const heroImages = useMemo(() => {
    const imgs = [];
    if (project?.masterImage) imgs.push(project.masterImage);
    const pImgs = Array.isArray(property?.images) ? property.images : [];
    imgs.push(...pImgs);
    return uniqStrings(imgs).map(toUploadSrc).filter(Boolean).slice(0, 4);
  }, [project?.masterImage, property?.images]);

  const masterImg = heroImages[0] || null;

  // =============================
  // GALLERY IMAGES (all images except floor plan images)
  // - include ALL hero images too
  // =============================
  const galleryImages = useMemo(() => {
    // floor plan images to exclude (previewSrc + images[])
    const fpImgs = [];
    for (const fp of Array.isArray(floorPlans) ? floorPlans : []) {
      if (fp?.previewSrc) fpImgs.push(fp.previewSrc);
      if (Array.isArray(fp?.images)) fpImgs.push(...fp.images);
    }

    const exclude = new Set(fpImgs.map((x) => filenameOnly(x)).filter(Boolean));

    // Base gallery sources:
    // 1) heroImages (already toUploadSrc'd URLs)
    // 2) project master + property images (raw names/paths)
    const rawBase = [];
    if (project?.masterImage) rawBase.push(project.masterImage);
    const pImgs = Array.isArray(property?.images) ? property.images : [];
    rawBase.push(...pImgs);

    const normalizedBase = uniqStrings(rawBase.map(normalizeUploadPath));

    const all = uniqStrings([...(heroImages || []), ...normalizedBase]);

    // Filter out floorplan images by filename
    return all.filter((src) => !exclude.has(filenameOnly(src)));
  }, [floorPlans, heroImages, project?.masterImage, property?.images]);

  useEffect(() => {
    setHeroIdx(0);
  }, [property?._id]);

  // ✅ reset gallery active image on property change or gallery list change
  useEffect(() => {
    setGalleryActiveIdx(0);
  }, [property?._id]);

  useEffect(() => {
    if (galleryActiveIdx > (galleryImages.length || 1) - 1) {
      setGalleryActiveIdx(0);
    }
  }, [galleryImages.length, galleryActiveIdx]);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const t = setInterval(() => {
      setHeroIdx((i) => (i + 1) % heroImages.length);
    }, 3500);
    return () => clearInterval(t);
  }, [heroImages.length]);

  const legacyUnitMix = useMemo(
    () => (Array.isArray(property?.unitMix) ? property.unitMix : []),
    [property?.unitMix]
  );

  const plansUi = useMemo(() => {
    const fromFloorPlans = (floorPlans || [])
      .map((fp, i) => {
        const title =
          fp?.label || fp?.title || fp?.type || `Floor plan ${i + 1}`;

        const size =
          fp?.sizeText ||
          (fp?.sqftRange?.min || fp?.sqftRange?.max
            ? `${fp?.sqftRange?.min ? `${fp.sqftRange.min} ` : ""}${
                fp?.sqftRange?.max ? `- ${fp.sqftRange.max} ` : ""
              }sq ft`
                .replace(/\s+/g, " ")
                .trim()
            : fp?.sqft
            ? `${fp.sqft} sq ft`
            : "");

        const preview =
          fp?.previewSrc ||
          (Array.isArray(fp?.images) && fp.images.length ? fp.images[0] : "");

        // ✅ if pdfUrl is google drive share link, convert to direct download
        const downloadHrefRaw = fp?.pdfUrl || floorplanPdfUrl || "";
        const downloadHref = toGoogleDriveDirectDownload(downloadHrefRaw);

        return { title, size, preview, downloadHref, raw: fp };
      })
      // ✅ drop rows that have neither preview image nor download link
      .filter((p) => Boolean(p.preview) || Boolean(p.downloadHref));

    if (fromFloorPlans.length) return fromFloorPlans;

    // legacy fallback
    return (legacyUnitMix || []).map((u, i) => {
      const title = u?.type || `Unit ${i + 1}`;
      const min = u?.sizeRangeSqft?.min ?? null;
      const max = u?.sizeRangeSqft?.max ?? null;

      const size =
        min || max
          ? `${min ? `${min} ` : ""}${max ? `- ${max} ` : ""}sq ft`
              .replace(/\s+/g, " ")
              .trim()
          : "";

      const downloadHrefRaw = floorplanPdfUrl || "";
      const downloadHref = toGoogleDriveDirectDownload(downloadHrefRaw);

      return { title, size, preview: "", downloadHref, raw: u };
    });
  }, [floorPlans, legacyUnitMix, floorplanPdfUrl]);

  useEffect(() => {
    setActivePlanIdx((idx) => {
      if (!plansUi.length) return 0;
      return Math.min(Math.max(0, idx), plansUi.length - 1);
    });
  }, [property?._id, plansUi.length]);

  const activePlan = plansUi[activePlanIdx] || null;

  const submitInquiry = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSent(true);
      setBrochureUnlocked(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const el = heroTabsSentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        setStickyTabsOpen(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "-8px 0px 0px 0px",
      }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll("[data-spy='section']")
    );
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0)
          )[0];

        const id = visible?.target?.id;
        if (id) setActiveSection(id);
      },
      {
        root: null,
        threshold: [0.15, 0.25, 0.35],
        rootMargin: "-30% 0px -60% 0px",
      }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [property?._id]);

  const brochureUrl = project.brochureUrl;
  const brochureHref = brochureUrl ? toUploadSrc(brochureUrl) : "";

  const floorplanHref = floorplanPdfUrl ? toUploadSrc(floorplanPdfUrl) : "";

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] pt-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-slate-900 font-semibold">Loading...</div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] pt-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-slate-900 font-semibold">
                {error ? "Could not load this project" : "Project not found"}
              </div>
              {error ? (
                <div className="mt-2 text-sm text-slate-600">{error}</div>
              ) : null}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const projectName = project.projectName || property.title || "Project";
  const seoTitle =
    project.metaTitle ||
    `${projectName} ${
      project.location ? project.location : ""
    } | NCR Properties`.trim();
  const seoDescription =
    project.metaDescription ||
    `Explore ${projectName} in ${
      project.location || "Dubai"
    } — enquire with NCR Properties.`;

  const aboutText = project.about || property.description || "";
  const conceptText = project.concept || "";

  const heroTitle = project.heroTitle || projectName;
  const heroLocationLine =
    project.heroLocation ||
    project.location ||
    `${property.location || ""}${
      property.city ? `, ${property.city}` : ""
    }`.trim();

  const unitTypesFromFloorPlans = uniqStrings(
    (floorPlans || [])
      .map((fp) => fp?.type || fp?.label || fp?.title)
      .map((s) => String(s || "").trim())
      .filter(Boolean)
  );

  const unitTypesText =
    project.unitTypes ||
    (unitTypesFromFloorPlans.length
      ? unitTypesFromFloorPlans.join(", ")
      : legacyUnitMix.length
      ? legacyUnitMix
          .map((u) => u?.type)
          .map((s) => String(s || "").trim())
          .filter(Boolean)
          .join(", ")
      : "—");

  const keyFacts = [
    {
      label: "Starting Price",
      value:
        project.startingPrice || property.displayPrice || "Price on request",
    },
    { label: "Unit Types", value: unitTypesText },
    { label: "Payment Plan", value: project.paymentPlan || "—" },
    {
      label: "Handover",
      value:
        project.handover || project.estCompletion || property.handover || "—",
    },
    { label: "Location", value: project.location || heroLocationLine || "—" },
  ];

  const driveTimes = Array.isArray(project.driveTimes)
    ? project.driveTimes
    : [];
  const connectivityText =
    project.connectivityText ||
    (project.location
      ? `Located in ${project.location} with access to major road corridors.`
      : "");

  const hasCoords =
    typeof property.coordinates?.lat === "number" &&
    typeof property.coordinates?.lng === "number";

  const mapSrc = hasCoords
    ? `https://www.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&z=13&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(
        project.location || property.location || "Dubai"
      )}&z=12&output=embed`;

  const paymentPlanTitle = project.paymentPlanTitle || "Payment Plan";
  const paymentPlanSteps =
    Array.isArray(project.paymentPlanSteps) && project.paymentPlanSteps.length
      ? project.paymentPlanSteps
      : ["20% on booking", "50% during construction", "30% on handover"];

  const amenityWellness = Array.isArray(project.amenityWellness)
    ? project.amenityWellness
    : [];
  const amenitySocial = Array.isArray(project.amenitySocial)
    ? project.amenitySocial
    : [];
  const amenitySmart = Array.isArray(project.amenitySmart)
    ? project.amenitySmart
    : [];

  const aboutTitle = project.aboutTitle || heroTitle;
  const conceptTitle = project.conceptTitle || "What makes it different";
  const locationTitle = project.locationTitle || "Access to key destinations";
  const floorTitle = project.floorPlansTitle || `Floor Plans — ${projectName}`;

  const canonicalSlug = property.slug || slugify(projectName);

  return (
    <>
      {/* ============================= */}
      {/* SEO / META                    */}
      {/* ============================= */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        {masterImg ? <meta property="og:image" content={masterImg} /> : null}
      </Helmet>

      {/* ============================= */}
      {/* HEADER                        */}
      {/* ============================= */}
      <Header />

      {/* ============================= */}
      {/* HERO IMAGE SLIDER (1–4 IMAGES) */}
      {/* ============================= */}
      <section className="relative w-full bg-black">
        <div
          ref={heroSentinelRef}
          className="absolute top-0 left-0 h-1 w-1 opacity-0 pointer-events-none"
        />

        {/* Slider */}
        {heroImages.length ? (
          <div className="relative w-full mt-16 h-[520px] md:h-[700px] overflow-hidden">
            {heroImages.map((src, idx) => (
              <img
                key={`${src}-${idx}`}
                src={src}
                alt={projectName}
                className={[
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                  idx === heroIdx ? "opacity-100" : "opacity-0",
                ].join(" ")}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            ))}

            {/* Controls */}
            {heroImages.length > 1 ? (
              <>
                {/* ✅ Prev icon button */}
                <button
                  type="button"
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-[2] rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                  onClick={() =>
                    setHeroIdx(
                      (i) => (i - 1 + heroImages.length) % heroImages.length
                    )
                  }
                  title="Previous"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* ✅ Next icon button */}
                <button
                  type="button"
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-[2] rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
                  onClick={() => setHeroIdx((i) => (i + 1) % heroImages.length)}
                  title="Next"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[2]">
                  {heroImages.map((_, i) => (
                    <button
                      key={`hero-dot-${i}`}
                      type="button"
                      onClick={() => setHeroIdx(i)}
                      className={[
                        "h-2.5 w-2.5 rounded-full border border-white/60",
                        i === heroIdx ? "bg-white" : "bg-white/25",
                      ].join(" ")}
                      aria-label={`Go to image ${i + 1}`}
                      title={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <div className="w-full mt-16 h-[520px] md:h-[700px] bg-gradient-to-br from-slate-200 to-slate-300" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

        {/* ============================= */}
        {/* HERO TOP BAR (BREADCRUMBS + SHARE) */}
        {/* ============================= */}
        <div className="absolute inset-x-0 top-0">
          <div className="max-w-7xl mx-auto px-6 pt-7 md:pt-9">
            <div className="flex items-center justify-between gap-6 text-xs md:text-sm">
              <div
                className="flex items-center gap-2 md:gap-3 flex-wrap"
                style={TOPBAR_TEXT_STYLE}
              >
                <a href="/" className="hover:opacity-80 transition">
                  Home
                </a>
                <span className="opacity-70">/</span>
                <a href="/projects" className="hover:opacity-80 transition">
                  Projects
                </a>
                <span className="opacity-70">/</span>
                <span>{projectName}</span>
              </div>

              <button
                type="button"
                aria-label={copied ? "Link copied" : "Share"}
                className={[
                  "inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-3 py-2 hover:bg-white/10 transition",
                  "min-w-[44px]",
                ].join(" ")}
                style={TOPBAR_TEXT_STYLE}
                onClick={async () => {
                  const url = window.location.href;
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: projectName, url });
                    } else {
                      await navigator.clipboard.writeText(url);
                      setCopied(true);
                    }
                  } catch {}
                }}
              >
                {copied ? (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="currentColor"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M16 8a3 3 0 1 0-2.83-4H13a3 3 0 0 0 3 4ZM6 14a3 3 0 1 0-3 3 3 3 0 0 0 3-3Zm14 7a3 3 0 1 0-2.83-4H17a3 3 0 0 0 3 4Z"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.0"
                      />
                      <path
                        d="M15.5 6.5l-7 4M8.5 13.5l7 4"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18 5a2.5 2.5 0 1 0 0.001 5.001A2.5 2.5 0 0 0 18 5ZM6 11.5a2.5 2.5 0 1 0 0.001 5.001A2.5 2.5 0 0 0 6 11.5ZM18 16a2.5 2.5 0 1 0 0.001 5.001A2.5 2.5 0 0 0 18 16Z"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ============================= */}
        {/* HERO BOTTOM (TITLE + CTA + TABS) */}
        {/* ============================= */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-7xl mx-auto px-6 pb-9 md:pb-12">
            <div className="max-w-3xl">
              {/* Prominent Status Pill */}
              {String(property.status || "").toLowerCase() === "sold" || String(project.status || "").toLowerCase() === "sold" ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-600/90 px-4 py-2 text-xs text-white backdrop-blur shadow-lg font-black tracking-widest uppercase">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span>SOLD OUT — DEED CLOSED</span>
                </div>
              ) : String(property.status || "").toLowerCase() === "on hold" || String(property.status || "").toLowerCase() === "hold" ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/90 px-4 py-2 text-xs text-slate-950 backdrop-blur shadow-lg font-black tracking-widest uppercase">
                  <span className="h-2 w-2 rounded-full bg-slate-950 animate-pulse" />
                  <span>ON HOLD — RESERVED UNDER CONTRACT</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] md:text-xs text-white/80 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c6a96b]" />
                  <span className="uppercase tracking-[0.28em] font-semibold">
                    {project.status || property.status || "Featured project"}
                  </span>
                </div>
              )}

              <h1 className="mt-5 text-white text-4xl md:text-6xl font-semibold tracking-tight">
                {heroTitle}
              </h1>

              {/* Status Alert Banner if SOLD or HOLD */}
              {String(property.status || "").toLowerCase() === "sold" && (
                <div className="mt-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-100 text-xs md:text-sm backdrop-blur flex items-center gap-2.5">
                  <span className="text-base">🔒</span>
                  <span><strong>This property is Sold Out.</strong> You can register a backup interest or request upcoming releases in this development.</span>
                </div>
              )}
              {(String(property.status || "").toLowerCase() === "on hold" || String(property.status || "").toLowerCase() === "hold") && (
                <div className="mt-4 p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-100 text-xs md:text-sm backdrop-blur flex items-center gap-2.5">
                  <span className="text-base">⏳</span>
                  <span><strong>Currently Under Hold.</strong> This property is in active escrow reservation with pending final documentation.</span>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-white/75 text-sm md:text-base">
                {project.developer ? (
                  <span>
                    by{" "}
                    <span className="font-semibold text-white/90">
                      {project.developer}
                    </span>
                  </span>
                ) : null}
                {!!heroLocationLine ? (
                  <span className="text-white/70">{heroLocationLine}</span>
                ) : null}
              </div>

              <div className="mt-7 inline-flex flex-col sm:flex-row gap-3">
                <a
                  href="#inquire"
                  className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-xs md:text-sm font-semibold transition ${
                    String(property.status || "").toLowerCase() === "sold"
                      ? "bg-rose-600 text-white hover:bg-rose-500"
                      : "bg-white text-slate-900 hover:opacity-90"
                  }`}
                >
                  {String(property.status || "").toLowerCase() === "sold" ? "Register Backup Inquiry" : "Inquire now"}
                </a>

                <a
                  href={`https://wa.me/97143999999?text=${encodeURIComponent(
                    `Hello NCR Properties, I am interested in inquiring about ${property.title || "this property"} in ${property.location || "Dubai"}. Please share availability and floor plans.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 text-xs md:text-sm font-semibold transition shadow-sm"
                >
                  <FaWhatsapp className="text-base" />
                  <span>WhatsApp VIP Desk</span>
                </a>

                <a
                  href={brochureHref ? "#brochure" : "#floorplans"}
                  className="inline-flex items-center justify-center rounded-xl bg-transparent text-white px-6 py-3 text-xs md:text-sm font-semibold border border-white/20 hover:bg-white/10 transition"
                >
                  {brochureHref ? "Get Brochure" : "View Floor Plans"}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur border-t border-slate-100">
            <div
              ref={heroTabsSentinelRef}
              className="absolute -top-px left-0 h-px w-px opacity-0 pointer-events-none"
            />

            <div className="max-w-7xl mx-auto px-6">
              <nav className="flex gap-7 overflow-x-auto text-sm">
                <a
                  className="py-4 text-slate-700 hover:text-slate-900 whitespace-nowrap"
                  href="#details"
                >
                  Details
                </a>
                <a
                  className="py-4 text-slate-700 hover:text-slate-900 whitespace-nowrap"
                  href="#floorplans"
                >
                  Floor Plans
                </a>
                <a
                  className="py-4 text-slate-700 hover:text-slate-900 whitespace-nowrap"
                  href="#location"
                >
                  Location
                </a>
                <a
                  className="py-4 text-slate-700 hover:text-slate-900 whitespace-nowrap"
                  href="#payment"
                >
                  Payment Plan
                </a>
                <a
                  className="py-4 text-slate-700 hover:text-slate-900 whitespace-nowrap"
                  href="#inquire"
                >
                  Contact
                </a>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* DETAILS / ABOUT SECTION        */}
      {/* ============================= */}
      <section
        id="details"
        data-spy="section"
        className="py-20 md:py-24 bg-white"
      >
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <SectionHeader kicker="About the project" title={aboutTitle} />

            <p className="mt-8 text-slate-700 leading-relaxed text-base md:text-lg whitespace-pre-line">
              {aboutText ||
                "Add project.about in your CMS to show this section."}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_18px_55px_-26px_rgba(2,6,23,0.35)] p-8 sticky top-28">
              <div className="flex items-end justify-between gap-6 mb-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  Key Project Facts
                </h3>
                <div className="h-[2px] w-12 bg-[#c6a96b]" />
              </div>

              <div className="space-y-4 text-sm">
                {keyFacts.map((f) => (
                  <Fact key={f.label} label={f.label} value={f.value} />
                ))}
              </div>

              <p className="text-xs text-slate-400 mt-6">
                *Prices, availability, and purchase terms may change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* GALLERY SECTION (featured-left + thumbs-right) */}
      {/* Right side: 5 columns inline (5-by-5 style grid) */}
      {/* ============================= */}
      {galleryImages.length ? (
        <section
          id="gallery"
          data-spy="section"
          className="py-20 md:py-24 bg-white border-t border-slate-100"
        >
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader kicker="Gallery" title={`Photos — ${projectName}`} />

            {(() => {
              const safeIdx = Math.min(
                Math.max(0, galleryActiveIdx),
                galleryImages.length - 1
              );
              const leftSrc = galleryImages[safeIdx];

              // ✅ keep all images on the right; don't filter out active
              const right = galleryImages.map((src, idx) => ({ src, idx }));

              return (
                <div className="mt-12 grid lg:grid-cols-12 gap-6">
                  {/* Left featured image */}
                  <a
                    href={leftSrc}
                    target="_blank"
                    rel="noreferrer"
                    className="lg:col-span-7 group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50"
                    title="Open image"
                  >
                    <div className="aspect-[4/3] md:aspect-[16/11]">
                      <img
                        src={leftSrc}
                        alt={`${projectName} featured photo`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                        loading="lazy"
                      />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/45 to-transparent">
                      <div className="text-xs text-white/80">
                        {safeIdx + 1} / {galleryImages.length}
                      </div>
                    </div>
                  </a>

                  {/* Right thumbnails (5 columns) */}
                  <div className="lg:col-span-5">
                    <div className="grid grid-cols-5 gap-3">
                      {right.map(({ src, idx }) => {
                        const active = idx === safeIdx;
                        return (
                          <button
                            key={`${src}-${idx}`}
                            type="button"
                            onClick={() => setGalleryActiveIdx(idx)}
                            className={[
                              "group text-left rounded-xl overflow-hidden border bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#c6a96b]/40",
                              active
                                ? "border-[#c6a96b]"
                                : "border-slate-200 hover:border-slate-300",
                            ].join(" ")}
                            title="Make this the main image"
                            aria-current={active ? "true" : "false"}
                          >
                            <div className="aspect-square">
                              <img
                                src={src}
                                alt={`${projectName} photo ${idx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                loading="lazy"
                              />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 text-xs text-slate-500">
                      Click any thumbnail to make it the main image.
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      ) : null}

      {/* ============================= */}
      {/* CONCEPT SECTION (optional)     */}
      {!!conceptText.trim() ? (
        <section className="py-20 md:py-24 bg-slate-50 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6">
            <SectionHeader kicker="Masterplan & concept" title={conceptTitle} />
            <p className="mt-8 text-slate-700 leading-relaxed text-base md:text-lg max-w-4xl whitespace-pre-line">
              {conceptText}
            </p>
          </div>
        </section>
      ) : null}

      {/* ============================= */}
      {/* LOCATION SECTION               */}
      {/* ============================= */}
      <section
        id="location"
        data-spy="section"
        className="py-20 md:py-24 bg-white border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-6">
            <SectionHeader
              kicker="Location & connectivity"
              title={locationTitle}
            />

            {!!connectivityText ? (
              <p className="mt-8 text-slate-700 text-base md:text-lg whitespace-pre-line">
                {connectivityText}
              </p>
            ) : null}

            {!!driveTimes.length ? (
              <div className="mt-8 space-y-3 text-sm md:text-base text-slate-700">
                {driveTimes.map((t, idx) => (
                  <div
                    key={`${t.time}-${t.place}-${idx}`}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-[10px] h-1.5 w-1.5 rounded-full bg-[#c6a96b]" />
                    <div>
                      <span className="font-semibold">{t.time}:</span>{" "}
                      <span className="text-slate-700">{t.place}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <iframe
                title="Google map"
                className="w-full h-[360px] md:h-[420px]"
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Map shown for convenience. Exact pin may vary.
            </p>

            {hasCoords ? (
              <a
                className="btn-outline inline-block mt-4"
                href={`https://maps.google.com/?q=${property.coordinates.lat},${property.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* FLOOR PLANS SECTION            */}
      {/* ============================= */}
      {plansUi.length || floorplanPdfUrl ? (
        <section
          id="floorplans"
          data-spy="section"
          className="py-16 md:py-20 bg-white border-t border-slate-100"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between gap-6 flex-wrap">
              <div>
                <div className="uppercase tracking-[0.38em] text-[11px] text-[#c6a96b] font-semibold">
                  Floor plans
                </div>
                <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">
                  {floorTitle}
                </h2>
              </div>

              <div className="flex gap-3">
                <a
                  href="#inquire"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white px-5 py-3 text-xs md:text-sm font-semibold hover:opacity-90 transition"
                >
                  Register interest
                </a>
                {floorplanHref ? (
                  <a
                    href={floorplanHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs md:text-sm font-semibold text-slate-900 hover:border-slate-300 transition"
                  >
                    Download brochure
                  </a>
                ) : null}
              </div>
            </div>

            {plansUi.length ? (
              <div className="mt-10">
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
                  {plansUi.map((p, idx) => {
                    const active = idx === activePlanIdx;
                    return (
                      <button
                        key={`${p.title}-${idx}`}
                        type="button"
                        onClick={() => setActivePlanIdx(idx)}
                        className={[
                          "shrink-0 rounded-xl px-5 py-3 text-sm font-medium border transition",
                          active
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300",
                        ].join(" ")}
                      >
                        {p.title}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-10 grid lg:grid-cols-12 gap-10 items-start">
                  <div className="lg:col-span-7">
                    <button
                      type="button"
                      className="w-full rounded-2xl bg-white border border-slate-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#c6a96b]/40"
                      onClick={() => {
                        if (!activePlan?.preview) return;
                        setPlanModal({
                          open: true,
                          src: toUploadSrc(activePlan.preview),
                          title: activePlan.title,
                        });
                      }}
                      title={
                        activePlan?.preview
                          ? "Click to view larger"
                          : "No preview"
                      }
                    >
                      <div className="h-[320px] sm:h-[420px] md:h-[520px] bg-slate-50 flex items-center justify-center">
                        {activePlan?.preview ? (
                          <img
                            src={toUploadSrc(activePlan.preview)}
                            alt={`${activePlan.title} floor plan`}
                            className="w-full h-full object-contain bg-white"
                            loading="lazy"
                          />
                        ) : (
                          <div className="text-sm text-slate-400">
                            No floor plan image
                          </div>
                        )}
                      </div>
                    </button>

                    <p className="mt-3 text-xs text-slate-500">
                      Click the plan to enlarge. Plans are indicative and may
                      change.
                    </p>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                      <div className="text-2xl font-semibold text-slate-900">
                        {activePlan?.title || "Floor plan"}
                      </div>

                      <div className="mt-8 divide-y divide-slate-100">
                        <div className="py-4 flex items-start justify-between gap-6">
                          <div className="text-sm text-slate-500">Starting Price</div>
                          <div className="text-sm font-semibold text-slate-900 text-right">
                            {activePlan?.raw?.price || activePlan?.raw?.startingPrice || "Call us"}
                          </div>
                        </div>

                        <div className="py-4 flex items-start justify-between gap-6">
                          <div className="text-sm text-slate-500">
                            Area from
                          </div>
                          <div className="text-sm font-semibold text-slate-900 text-right">
                            {activePlan?.size || "—"}
                          </div>
                        </div>

                        <div className="py-4 flex items-start justify-between gap-6">
                          <div className="text-sm text-slate-500">
                            No. of units
                          </div>
                          <div className="text-sm font-semibold text-slate-900 text-right">
                            {activePlan?.raw?.unitsCount ?? "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 grid gap-3">
                        {activePlan?.downloadHref ? (
                          <a
                            href={toGoogleDriveDirectDownload(
                              activePlan.downloadHref
                            )}
                            download
                            className="inline-flex items-center justify-center w-full rounded-xl bg-slate-900 text-white px-6 py-3 text-xs md:text-sm font-semibold hover:opacity-90 transition"
                          >
                            Download Floor Plan
                          </a>
                        ) : (
                          <a
                            href="#inquire"
                            className="inline-flex items-center justify-center w-full rounded-xl bg-slate-900 text-white px-6 py-3 text-xs md:text-sm font-semibold hover:opacity-90 transition"
                          >
                            Request Floor Plan
                          </a>
                        )}

                        <a
                          href="#inquire"
                          className="inline-flex items-center justify-center w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs md:text-sm font-semibold text-slate-900 hover:border-slate-300 transition"
                        >
                          Contact us
                        </a>
                      </div>

                      {plansUi.length > 1 ? (
                        <div className="mt-6 grid grid-cols-4 gap-3">
                          {plansUi
                            .map((p, idx) => ({ p, idx }))
                            .filter(({ p }) => Boolean(p.preview))
                            .slice(0, 8)
                            .map(({ p, idx }) => (
                              <button
                                key={`fp-mini-${p.title}-${idx}`}
                                type="button"
                                onClick={() => setActivePlanIdx(idx)}
                                className={[
                                  "aspect-square rounded-xl overflow-hidden border bg-slate-50",
                                  idx === activePlanIdx
                                    ? "border-[#c6a96b]"
                                    : "border-slate-200",
                                ].join(" ")}
                                title={p.title}
                              >
                                <img
                                  src={toUploadSrc(p.preview)}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </button>
                            ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-10">
                <a
                  href={floorplanHref}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white px-6 py-3 text-xs md:text-sm font-semibold hover:opacity-90 transition"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download Floor Plans
                </a>
              </div>
            )}
          </div>

          {/* ============================= */}
          {/* FLOOR PLAN MODAL              */}
          {/* ============================= */}
          {planModal.open ? (
            <div
              className="fixed inset-0 z-[80] bg-black/70 p-4 md:p-10"
              onClick={() => setPlanModal((s) => ({ ...s, open: false }))}
            >
              <div
                className="max-w-5xl mx-auto bg-white rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                  <div className="font-semibold text-slate-900">
                    {planModal.title || "Floor plan"}
                  </div>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setPlanModal((s) => ({ ...s, open: false }))}
                  >
                    Close
                  </button>
                </div>
                <div className="p-4 md:p-6 bg-slate-50">
                  <img
                    src={planModal.src}
                    alt={planModal.title}
                    className="w-full max-h-[75vh] object-contain bg-white rounded-xl"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* ============================= */}
      {/* PAYMENT PLAN SECTION           */}
      {/* ============================= */}
      <section
        id="payment"
        data-spy="section"
        className="py-20 md:py-24 bg-white border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader kicker="Payment plan" title={paymentPlanTitle} />

          <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-8">
            {paymentPlanSteps.slice(0, 3).map((s, idx) => (
              <PlanStep key={`${s}-${idx}`} text={s} />
            ))}
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* AMENITIES SECTION              */}
      {/* ============================= */}
      <section className="py-20 md:py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeader
            kicker="Amenities & lifestyle features"
            title="Lifestyle across the community"
          />

          <div className="mt-14 grid md:grid-cols-3 gap-6 md:gap-8">
            <AmenityBox
              title="Wellness & Leisure"
              items={amenityWellness}
              fallback={[]}
            />
            <AmenityBox
              title="Social & Community"
              items={amenitySocial}
              fallback={[]}
            />
            <AmenityBox
              title="Smart Living & Sustainability"
              items={amenitySmart}
              fallback={[]}
            />
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* BROCHURE SECTION (optional)    */}
      {brochureHref ? (
        <section
          id="brochure"
          className="py-20 md:py-24 bg-black text-white border-t border-black"
        >
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-6">
              <div className="uppercase tracking-[0.38em] text-[11px] text-[#c6a96b] font-semibold">
                Download brochure
              </div>
              <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
                Get the official brochure
              </h2>
              <p className="mt-5 text-white/70 max-w-xl">
                Share your details and we’ll send you the latest brochure,
                pricing, and availability.
              </p>

              <div className="mt-10 grid gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-white/60">
                    What you get
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-white/80">
                    <li className="flex gap-3">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#c6a96b]" />
                      Floor plans & sizes
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#c6a96b]" />
                      Payment plan & handover timeline
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#c6a96b]" />
                      Full amenity list & location details
                    </li>
                  </ul>
                </div>

                <a
                  href="#inquire"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-4 uppercase tracking-[0.18em] text-xs font-semibold hover:border-[#c6a96b] hover:text-[#c6a96b] transition"
                >
                  Prefer a call? Contact us
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
                <div className="text-sm font-semibold text-white">
                  Request brochure
                </div>
                <p className="text-sm text-white/60 mt-1">
                  Submit the form to unlock the download.
                </p>

                <form onSubmit={submitInquiry} className="mt-6 grid gap-4">
                  <input
                    className="w-full p-4 rounded-2xl text-black outline-none ring-1 ring-white/10 focus:ring-[#c6a96b]/60"
                    placeholder="Full Name"
                    value={inq.name}
                    onChange={(e) =>
                      setInq((s) => ({ ...s, name: e.target.value }))
                    }
                    required
                  />
                  <input
                    className="w-full p-4 rounded-2xl text-black outline-none ring-1 ring-white/10 focus:ring-[#c6a96b]/60"
                    placeholder="Email"
                    type="email"
                    value={inq.email}
                    onChange={(e) =>
                      setInq((s) => ({ ...s, email: e.target.value }))
                    }
                    required
                  />
                  <input
                    className="w-full p-4 rounded-2xl text-black outline-none ring-1 ring-white/10 focus:ring-[#c6a96b]/60"
                    placeholder="Mobile Number"
                    value={inq.phone}
                    onChange={(e) =>
                      setInq((s) => ({ ...s, phone: e.target.value }))
                    }
                  />

                  <button
                    className="w-full py-4 rounded-2xl bg-[#c6a96b] text-black uppercase tracking-[0.18em] text-xs md:text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
                    type="submit"
                    disabled={sending}
                  >
                    {sending
                      ? "Submitting..."
                      : brochureUnlocked
                      ? "Submitted"
                      : "Submit & unlock"}
                  </button>

                  <a
                    href={brochureHref}
                    className={[
                      "w-full py-4 rounded-2xl uppercase tracking-[0.18em] text-xs md:text-sm font-semibold transition inline-flex items-center justify-center",
                      brochureUnlocked
                        ? "bg-white text-black hover:opacity-90"
                        : "bg-white/10 text-white/50 pointer-events-none",
                    ].join(" ")}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={!brochureUnlocked}
                    tabIndex={brochureUnlocked ? 0 : -1}
                    onClick={(e) => {
                      if (!brochureUnlocked) e.preventDefault();
                    }}
                  >
                    Download brochure
                  </a>

                  <p className="text-xs text-white/60 text-center">
                    By submitting you agree to our privacy policy.
                  </p>

                  {sent ? (
                    <p className="text-sm text-emerald-300 text-center">
                      Thanks — we’ll contact you shortly.
                    </p>
                  ) : null}
                </form>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ============================= */}
      {/* INQUIRY / CONTACT SECTION      */}
      {/* ============================= */}
      <section
        id="inquire"
        data-spy="section"
        className="py-20 md:py-24 bg-white border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <div className="uppercase tracking-[0.38em] text-[11px] text-[#c6a96b] font-semibold">
              Contact us
            </div>
            <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">
              Speak with an advisor
            </h2>
            <p className="mt-5 text-slate-600 max-w-xl">
              Get the latest availability, payment plans, and official
              documents.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Response time
                </div>
                <div className="mt-2 text-sm text-slate-700">
                  Usually within{" "}
                  <span className="font-semibold">15–30 minutes</span> during
                  working hours.
                </div>
              </div>

              <a
                href={brochureHref ? "#brochure" : "#payment"}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-4 uppercase tracking-[0.18em] text-xs font-semibold text-slate-900 hover:border-[#c6a96b] hover:text-[#c6a96b] transition"
              >
                {brochureHref ? "Go to brochure section" : "View payment plan"}
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_18px_55px_-30px_rgba(2,6,23,0.25)] p-6 md:p-10">
              <form
                onSubmit={submitInquiry}
                className="grid md:grid-cols-2 gap-4"
              >
                <input
                  className="w-full p-4 border border-slate-200 rounded-2xl"
                  placeholder="Your Name"
                  value={inq.name}
                  onChange={(e) =>
                    setInq((s) => ({ ...s, name: e.target.value }))
                  }
                  required
                />
                <input
                  className="w-full p-4 border border-slate-200 rounded-2xl"
                  placeholder="Mobile Number"
                  value={inq.phone}
                  onChange={(e) =>
                    setInq((s) => ({ ...s, phone: e.target.value }))
                  }
                />
                <input
                  className="w-full p-4 border border-slate-200 rounded-2xl md:col-span-2"
                  placeholder="Email ID"
                  type="email"
                  value={inq.email}
                  onChange={(e) =>
                    setInq((s) => ({ ...s, email: e.target.value }))
                  }
                  required
                />
                <textarea
                  className="w-full p-4 border border-slate-200 rounded-2xl md:col-span-2 min-h-[140px]"
                  placeholder="Message"
                  value={inq.message}
                  onChange={(e) =>
                    setInq((s) => ({ ...s, message: e.target.value }))
                  }
                />

                <button
                  className="w-full py-4 rounded-2xl bg-black text-white uppercase tracking-[0.18em] text-xs md:text-sm font-semibold hover:opacity-90 transition disabled:opacity-60 md:col-span-2"
                  type="submit"
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Submit"}
                </button>

                {sent ? (
                  <p className="text-sm text-emerald-600 text-center md:col-span-2">
                    Thanks — we’ll contact you shortly.
                  </p>
                ) : null}

                <p className="text-xs text-slate-500 md:col-span-2 text-center">
                  *Prices, availability, and purchase terms may change. Contact
                  NCR Properties for the latest availability, payment plans, and
                  official documents.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= */}
      {/* FOOTER                         */}
      {/* ============================= */}
      <Footer />
    </>
  );
}

function SectionHeader({ kicker, title, align = "left" }) {
  const alignCls =
    align === "center"
      ? "text-center mx-auto"
      : align === "right"
      ? "text-right ml-auto"
      : "text-left";

  return (
    <div className={["max-w-3xl", alignCls].join(" ")}>
      {kicker ? (
        <div className="uppercase tracking-[0.38em] text-[11px] text-[#c6a96b] font-semibold">
          {kicker}
        </div>
      ) : null}
      <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <div
        className={[
          "mt-6 h-[2px] w-14 bg-[#c6a96b]",
          align === "center" ? "mx-auto" : "",
        ].join(" ")}
      />
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-5">
      <div className="text-slate-500">{label}</div>
      <div className="text-slate-900 font-semibold text-right">
        {value || "—"}
      </div>
    </div>
  );
}

function PlanStep({ text }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="h-[2px] w-10 bg-[#c6a96b]" />
      <div className="mt-5 text-slate-900 font-semibold">{text}</div>
    </div>
  );
}

function AmenityBox({ title, items = [], fallback = [] }) {
  const list = items?.length ? items : fallback;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-end justify-between gap-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <div className="h-[2px] w-10 bg-[#c6a96b]" />
      </div>

      {list?.length ? (
        <ul className="space-y-3 text-sm text-slate-700">
          {list.map((x, idx) => (
            <li key={`${x}-${idx}`} className="flex items-start gap-3">
              <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#c6a96b]" />
              <span>{x}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-slate-500">No amenities listed.</div>
      )}
    </div>
  );
}
