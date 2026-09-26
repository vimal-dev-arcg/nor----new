import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import Footer from "../../components/Footer";
import { getToken } from "../../lib/auth";
import { appStore } from "../../lib/appStore";
import {
  fetchProperties,
  createProperty,
  updateProperty,
} from "../../data/properties";

const emptyForm = {
  title: "",
  slug: "",
  mode: "Buy",
  price: 0,
  displayPrice: "Price on request",
  location: "",
  community: "",
  city: "Dubai",
  address: "",
  type: "Off-Plan",
  status: "New Launch",
  featuredCategory: "", // "Residential" | "Commercial" | "Community"
  beds: "",
  baths: "",
  areaSqft: "",
  parking: "",
  furnished: false,
  handover: "",
  yearBuilt: "",
  agentId: "",
  lat: "",
  lng: "",
  listedAt: "",
  description: "",

  highlightsCsv: "",

  project: {
    aboutTitle: "",
    projectName: "",
    developer: "",
    architect: "",
    location: "",
    plotNumber: "",
    plotAreaSqft: "",
    plotArea: "",
    estCompletion: "",
    towerHeight: "",
    finishing: "",
    lobbyCeilingHeightMm: "",
    lobbyCeilingHeight: "",
    estimatedServiceCharges: "",
    numberOfParking: "",
    elevatorsCsv: "",
    parkingAllocationCsv: "",
    reraNumber: "",
    totalUnits: "",
    branded: "",
    anticipatedServiceFees: "",
    whiteGoods: "",
    brandOfWhiteGoods: "",
    sanitaryBrand: "",

    // ✅ ADD: media + long text + SEO + brochure + location copy
    masterImage: "",
    heroTitle: "",
    heroLocation: "",
    about: "",
    conceptTitle: "",
    concept: "",
    connectivityText: "",

    // ✅ ADD: SEO
    metaTitle: "",
    metaDescription: "",

    // ✅ ADD: brochures
    brochureUrl: "",
    floorplanPdfUrl: "",

    // ✅ ADD: payment plan section
    paymentPlanTitle: "",
    paymentPlanStepsCsv: "",

    // ✅ ADD: amenities buckets
    amenityWellnessCsv: "",
    amenitySocialCsv: "",
    amenitySmartCsv: "",

    // ✅ ADD: drive times
    driveTimesCsv: "",

    // ✅ ADD: key facts helpers (optional: used in facts box)
    startingPrice: "",
    unitTypes: "",
    paymentPlan: "",
    handover: "",
  },

  amenities: [{ type: "", sizeSqft: "", details: "", metaJson: "" }],

  // ✅ Floor plans now ALSO carry unit-mix fields
  floorPlans: [
    {
      label: "",
      type: "",
      sizeText: "",
      unitsCount: "",
      sizeMinSqft: "",
      sizeMaxSqft: "",
      previewSrc: "",
      pdfUrl: "",
      imagesCsv: "",
    },
  ],
};

function slugify(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function toNumberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toIntOrNull(v) {
  const n = toNumberOrNull(v);
  return n === null ? null : Math.trunc(n);
}

function uniq(arr) {
  return Array.from(
    new Set((arr || []).map((x) => String(x || "").trim()).filter(Boolean))
  );
}

function uniqStrings(list) {
  const out = [];
  const seen = new Set();
  for (const x of Array.isArray(list) ? list : []) {
    const t = String(x || "").trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

function normalizeUploadPath(v) {
  const t = String(v || "").trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (t.startsWith("/uploads/")) return t;
  const name = t.split("?")[0].split("#")[0].split("/").filter(Boolean).pop();
  return name ? `/uploads/${name}` : "";
}

// ✅ use ONE function for images everywhere (prevents dupes like `uploads/x` vs `/uploads/x`)
function normalizeAndUniqUploads(list) {
  return uniqStrings(
    (Array.isArray(list) ? list : []).map(normalizeUploadPath)
  );
}

function toCsvArray(s) {
  return (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function fromArrayToCsv(arr) {
  return Array.isArray(arr) ? arr.filter(Boolean).join(", ") : "";
}

function toLinesArray(s) {
  return (s || "")
    .split(/\n|,/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseJsonOrNull(s) {
  const t = String(s || "").trim();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return "__INVALID_JSON__";
  }
}

function normalizeAmenities(rows) {
  const list = Array.isArray(rows) ? rows : [];
  return list
    .map((r) => {
      const meta = parseJsonOrNull(r.metaJson);
      return {
        type: (r.type || "").trim(),
        sizeSqft: toIntOrNull(r.sizeSqft),
        details: toLinesArray(r.details),
        meta: meta === "__INVALID_JSON__" ? null : meta,
        __metaInvalid: meta === "__INVALID_JSON__",
      };
    })
    .filter(
      (r) => r.type || r.sizeSqft || (r.details && r.details.length) || r.meta
    );
}

function isProbablyImageFile(file) {
  return (
    file && typeof file.type === "string" && file.type.startsWith("image/")
  );
}

function toMaybeUrl(s) {
  const t = String(s || "").trim();
  return t;
}

// ✅ keeps saved data consistent: all "unit mix" data ends up in floorPlans[]
function normalizeFloorPlans(rows) {
  const list = Array.isArray(rows) ? rows : [];

  return list
    .map((r) => {
      const images = uniq(toLinesArray(r.imagesCsv || ""));
      const previewSrc = (r.previewSrc || "").trim();

      return {
        label: (r.label || "").trim(),
        title: "", // optional; keep empty unless you add it to UI
        type: (r.type || "").trim(), // ✅ old unitMix.type
        sizeText: (r.sizeText || "").trim(),

        // ✅ old unitMix.units
        unitsCount: toIntOrNull(r.unitsCount),

        // ✅ old unitMix.sizeRangeSqft
        sqftRange: {
          min: toIntOrNull(r.sizeMinSqft),
          max: toIntOrNull(r.sizeMaxSqft),
        },

        previewSrc,
        pdfUrl: (r.pdfUrl || "").trim(),
        images,
      };
    })
    .map((fp) => {
      // ensure preview is included in images and preview auto-fills from images
      const mergedImages = fp.previewSrc
        ? uniq([fp.previewSrc, ...fp.images])
        : fp.images;
      return {
        ...fp,
        images: mergedImages,
        previewSrc: fp.previewSrc || mergedImages[0] || "",
      };
    })
    .filter((fp) => {
      // drop completely empty rows
      const hasMedia = Boolean(
        fp.previewSrc || fp.pdfUrl || (fp.images && fp.images.length)
      );
      const hasText = Boolean(fp.label || fp.type || fp.sizeText);
      const hasUnitMixNumbers =
        fp.unitsCount !== null ||
        fp.sqftRange?.min !== null ||
        fp.sqftRange?.max !== null;
      return hasMedia || hasText || hasUnitMixNumbers;
    });
}

// ✅ Small presentational component for consistent section headers
function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        {subtitle ? (
          <div className="text-sm text-slate-500 mt-1">{subtitle}</div>
        ) : null}
      </div>
      {right ? <div className="text-xs text-slate-500">{right}</div> : null}
    </div>
  );
}

function mergeLegacyUnitMixIntoFloorPlansUi(full) {
  const fps = Array.isArray(full?.floorPlans) ? full.floorPlans : [];
  const unitMix = Array.isArray(full?.unitMix) ? full.unitMix : [];
  if (!unitMix.length) return fps;

  const next = [...fps];

  const normKey = (s) =>
    String(s || "")
      .trim()
      .toLowerCase();
  const findIdx = (um) =>
    next.findIndex(
      (fp) => normKey(fp?.type || fp?.label) === normKey(um?.type)
    );

  for (const um of unitMix) {
    const t = String(um?.type || "").trim();
    const min = um?.sizeRangeSqft?.min ?? "";
    const max = um?.sizeRangeSqft?.max ?? "";
    const units = um?.units ?? "";

    if (!t && min === "" && max === "" && units === "") continue;

    const idx = findIdx(um);
    if (idx >= 0) {
      const cur = next[idx] || {};
      next[idx] = {
        ...cur,
        type: cur.type || t,
        label: cur.label || t,
        unitsCount: cur.unitsCount ?? units,
        sqftRange: {
          min: cur?.sqftRange?.min ?? (min === "" ? null : min),
          max: cur?.sqftRange?.max ?? (max === "" ? null : max),
        },
      };
    } else {
      next.push({
        label: t,
        title: "",
        type: t,
        sizeText: "",
        unitsCount: units,
        sqftRange: {
          min: min === "" ? null : min,
          max: max === "" ? null : max,
        },
        previewSrc: "",
        images: [],
        pdfUrl: "",
      });
    }
  }

  return next;
}

function toPairsLines(s) {
  // "15 minutes - Expo City" -> {time:"15 minutes", place:"Expo City"}
  return (s || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((line) => {
      const parts =
        line.split("—").length > 1 ? line.split("—") : line.split("-");
      const time = (parts[0] || "").trim();
      const place = parts.slice(1).join("-").trim();
      return { time, place };
    })
    .filter((x) => x.time && x.place);
}

const MAX_IMAGES = Infinity; // set to a number like 50 if you want a cap

export default function AdminPropertyListings({
  embedded = false,
  defaultBackUrl = "/admin",
  onSaved = null,
  initialEditProperty = null,
}) {
  const token = useMemo(() => getToken(), []);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [editMongoId, setEditMongoId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [availableImages, setAvailableImages] = useState([]);
  const [imagesSelected, setImagesSelected] = useState([]);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState("");
  const [saveAlertMsg, setSaveAlertMsg] = useState(null); // { type: 'success' | 'error' | 'warning', message: '', details?: '' }

  // ✅ NEW: per-floorplan-row drag highlight
  const [floorDragIdx, setFloorDragIdx] = useState(null);
  const [editingLoading, setEditingLoading] = useState(false);

  const formRef = useRef(null);

  // Sync initialEditProperty when passed via prop
  useEffect(() => {
    if (initialEditProperty) {
      startEdit(initialEditProperty);
    }
  }, [initialEditProperty]);

  // Helper to read local file as Data URL (instant preview without backend dependency)
  function readFileAsDataUrl(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  // ✅ Replace setImageAt with generic setter
  function setImages(value) {
    setImagesSelected(normalizeAndUniqUploads(value));
  }

  async function loadProps() {
    setLoading(true);
    try {
      const props = await fetchProperties();
      setProperties(props);
    } catch (error) {
      console.error("Failed to load properties:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailableImages() {
    try {
      const res = await fetch("/api/uploads/images");
      const data = res.ok ? await res.json() : { images: [] };
      setAvailableImages(normalizeAndUniqUploads(data.images || []));
    } catch {
      setAvailableImages([]);
    }
  }

  useEffect(() => {
    loadProps();
    loadAvailableImages();
  }, []);

  // ✅ Auto-open edit mode when coming from Admin dashboard links: /admin/properties?id=...
  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;

    let cancelled = false;

    (async () => {
      setEditingLoading(true);
      try {
        // make sure we have listings loaded (optional but useful)
        if (!properties.length) await loadProps();

        const full = await fetchPropertyById(id);
        if (!full) throw new Error("Failed to load property for editing");

        if (cancelled) return;
        await startEdit(full);
      } catch (e) {
        if (!cancelled) alert(e?.message || "Failed to load property");
      } finally {
        if (!cancelled) setEditingLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, token]);

  function startCreate() {
    setEditMongoId(null);
    setForm(emptyForm);
    setImagesSelected([]);
  }

  async function fetchPropertyById(id) {
    if (!id) return null;

    // try admin endpoint first (if exists)
    const tryFetch = async (url) => {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }).catch(() => null);
      if (!res || !res.ok) return null;
      return await res.json().catch(() => null);
    };

    return (
      (await tryFetch(`/api/properties/${id}`)) ||
      (await tryFetch(`/api/properties/by/${id}`))
    );
  }

  async function startEdit(p) {
    const id = p?._id || p?.id;
    if (!id && !p?.title) return;

    setEditingLoading(true);
    try {
      // ✅ always load the full doc before filling form, fallback to p
      const full = (id ? await fetchPropertyById(id) : null) || p;
      const targetId = full._id || full.id || id;

      setEditMongoId(targetId);

      const mergedFloorPlans = mergeLegacyUnitMixIntoFloorPlansUi(full);
      const proj = full.project || {};
      const am = Array.isArray(full.amenities) ? full.amenities : [];

      // ✅ important: also sync the selected images state, otherwise image UI looks empty
      const resolvedImages = full.images || (full.image ? [full.image] : []);
      setImagesSelected(normalizeAndUniqUploads(resolvedImages));

      setForm({
        ...emptyForm,
        title: full.title || "",
        slug:
          full.slug ||
          (full.title
            ? full.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
            : ""),
        mode: full.mode || "Buy",
        price: full.price ?? full.originalPrice ?? 0,
        displayPrice:
          full.displayPrice ||
          (full.price ? `AED ${Number(full.price).toLocaleString()}` : ""),
        location: full.location || "",
        community: full.community || full.location || "",
        city: full.city || "Dubai",
        address:
          full.address || `${full.location || ""}, ${full.city || "Dubai"}`,
        type: full.type || "Apartment",
        status: full.status || "Available",
        featuredCategory: full.featuredCategory || "Residential",
        beds: full.beds ?? "",
        baths: full.baths ?? "",
        areaSqft: full.areaSqft ?? "",
        parking: full.parking ?? 1,
        furnished: Boolean(full.furnished),
        handover: full.handover || proj.handover || "",
        yearBuilt: full.yearBuilt ?? 2024,
        agentId: full.agentId ?? full.dealerId ?? "",
        lat: full.coordinates?.lat ?? 25.2048,
        lng: full.coordinates?.lng ?? 55.2708,
        listedAt: full.listedAt || new Date().toISOString().slice(0, 10),
        description: full.description || proj.about || "",
        highlightsCsv: Array.isArray(full.highlights)
          ? full.highlights.join("\n")
          : "",

        project: {
          ...emptyForm.project,
          aboutTitle: proj.aboutTitle || `ABOUT ${full.title || ""}`,
          projectName: proj.projectName || full.title || "",
          developer:
            proj.developer || full.dealerName || "NCR Premier Developments",
          architect: proj.architect || "",
          location: proj.location || full.location || "",
          plotNumber: proj.plotNumber || "",
          plotAreaSqft: proj.plotAreaSqft ?? "",
          plotArea: proj.plotArea || "",
          estCompletion: proj.estCompletion || full.handover || "",
          towerHeight: proj.towerHeight || "",
          finishing: proj.finishing || "High-End Luxury",
          lobbyCeilingHeightMm: proj.lobbyCeilingHeightMm ?? "",
          lobbyCeilingHeight: proj.lobbyCeilingHeight || "",
          estimatedServiceCharges:
            proj.estimatedServiceCharges || "AED 16 / sqft",
          numberOfParking: proj.numberOfParking ?? (full.parking || 1),
          elevatorsCsv: fromArrayToCsv(proj.elevators),
          parkingAllocationCsv: fromArrayToCsv(proj.parkingAllocation),
          reraNumber: proj.reraNumber || full.dealerLicense || "",
          totalUnits: proj.totalUnits ?? "",
          branded: proj.branded || "",
          anticipatedServiceFees: proj.anticipatedServiceFees || "",
          whiteGoods: proj.whiteGoods || "Fully Fitted Italian Kitchen",
          brandOfWhiteGoods: proj.brandOfWhiteGoods || "Miele / Bosch",
          sanitaryBrand: proj.sanitaryBrand || "Kohler / Grohe",

          masterImage: proj.masterImage || resolvedImages[0] || "",
          heroTitle: proj.heroTitle || full.title || "",
          heroLocation: proj.heroLocation || full.location || "",
          about: proj.about || full.description || "",
          conceptTitle: proj.conceptTitle || "Architectural Vision",
          concept: proj.concept || "",
          connectivityText: proj.connectivityText || "",

          metaTitle: proj.metaTitle || full.title || "",
          metaDescription: proj.metaDescription || full.description || "",

          brochureUrl: proj.brochureUrl || "",
          floorplanPdfUrl: proj.floorplanPdfUrl || "",

          paymentPlanTitle:
            proj.paymentPlanTitle ||
            proj.paymentPlan ||
            "Flexible Milestone Payment Plan",
          paymentPlanStepsCsv: Array.isArray(proj.paymentPlanSteps)
            ? proj.paymentPlanSteps.join("\n")
            : "",

          amenityWellnessCsv: Array.isArray(proj.amenityWellness)
            ? proj.amenityWellness.join("\n")
            : "",
          amenitySocialCsv: Array.isArray(proj.amenitySocial)
            ? proj.amenitySocial.join("\n")
            : "",
          amenitySmartCsv: Array.isArray(proj.amenitySmart)
            ? proj.amenitySmart.join("\n")
            : "",

          driveTimesCsv: Array.isArray(proj.driveTimes)
            ? proj.driveTimes.map((d) => `${d.time} — ${d.place}`).join("\n")
            : "",

          startingPrice:
            proj.startingPrice ||
            full.displayPrice ||
            (full.price ? `AED ${Number(full.price).toLocaleString()}` : ""),
          unitTypes:
            proj.unitTypes ||
            `${full.beds || 2} Bedroom ${full.type || "Apartment"}`,
          paymentPlan: proj.paymentPlan || "60/40 Construction Linked",
          handover: proj.handover || full.handover || "Q4 2026",
        },

        amenities: am.length
          ? am.map((a) => ({
              type: a.type || "",
              sizeSqft: a.sizeSqft ?? "",
              details: Array.isArray(a.details)
                ? a.details.join("\n")
                : a.details || "",
              metaJson: a.meta ? JSON.stringify(a.meta, null, 2) : "",
            }))
          : [
              {
                type: "Infinity Swimming Pool",
                sizeSqft: "2500",
                details: "Temperature controlled",
                metaJson: "",
              },
            ],

        floorPlans: mergedFloorPlans.length
          ? mergedFloorPlans.map((fp) => ({
              label: fp.label || fp.title || "",
              type: fp.type || "",
              sizeText: fp.sizeText || "",
              unitsCount: fp.unitsCount ?? "",
              sizeMinSqft: fp.sqftRange?.min ?? "",
              sizeMaxSqft: fp.sqftRange?.max ?? "",
              previewSrc: fp.previewSrc || "",
              pdfUrl: fp.pdfUrl || "",
              imagesCsv: Array.isArray(fp.images) ? fp.images.join("\n") : "",
            }))
          : [...emptyForm.floorPlans],
      });

      requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } finally {
      setEditingLoading(false);
    }
  }

  async function uploadImages(files) {
    const list = Array.from(files || []).filter(Boolean);
    if (!list.length) return;

    const imgs = list.filter(isProbablyImageFile);
    if (!imgs.length) {
      setSaveAlertMsg({
        type: "error",
        message: "Please upload valid image files only (JPG, PNG, WebP, AVIF).",
      });
      return;
    }

    const remaining =
      MAX_IMAGES === Infinity
        ? imgs.length
        : Math.max(0, MAX_IMAGES - uniq(imagesSelected).length);

    const toUpload = MAX_IMAGES === Infinity ? imgs : imgs.slice(0, remaining);

    if (!toUpload.length) {
      setSaveAlertMsg({
        type: "error",
        message: `Maximum ${MAX_IMAGES} images reached. Remove an image to upload another.`,
      });
      return;
    }

    setUploadingImages(true);
    setUploadStatusMsg("Processing image uploads...");

    try {
      let uploaded = [];

      // Try server upload endpoint first
      try {
        const fd = new FormData();
        for (const f of toUpload) fd.append("images", f);

        const res = await fetch("/api/uploads/images", {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          const j = await res.json().catch(() => ({}));
          uploaded = Array.isArray(j.images)
            ? j.images
            : Array.isArray(j.uploaded)
            ? j.uploaded
            : [];
        }
      } catch {
        // Fallback gracefully below
      }

      // If server upload returned no urls (or failed in static dev runtime), convert files to Data URLs locally
      if (!uploaded.length) {
        const dataUrls = await Promise.all(toUpload.map(readFileAsDataUrl));
        uploaded = dataUrls.filter(Boolean);
      }

      if (uploaded.length) {
        const merged = normalizeAndUniqUploads([
          ...imagesSelected,
          ...uploaded,
        ]);
        setImagesSelected(
          MAX_IMAGES === Infinity ? merged : merged.slice(0, MAX_IMAGES)
        );
        setAvailableImages((prev) =>
          normalizeAndUniqUploads([...prev, ...uploaded])
        );
        setSaveAlertMsg({
          type: "success",
          message: `${uploaded.length} image(s) processed and added to listing preview successfully!`,
        });
      }
    } catch (err) {
      setSaveAlertMsg({
        type: "error",
        message: `Image upload processing notice: ${
          err.message || "Failed to parse images"
        }`,
      });
    } finally {
      setUploadingImages(false);
      setUploadStatusMsg("");
    }
  }

  // ✅ upload floor plan images (with local Data URL fallback)
  async function uploadFloorPlanImages(rowIdx, files) {
    const list = Array.from(files || []).filter(Boolean);
    if (!list.length) return;

    const imgs = list.filter(isProbablyImageFile);
    if (!imgs.length) {
      setSaveAlertMsg({
        type: "error",
        message: "Please upload valid image files only (JPG, PNG, WebP).",
      });
      return;
    }

    setUploadingImages(true);
    try {
      let uploaded = [];
      try {
        const fd = new FormData();
        for (const f of imgs) fd.append("images", f);

        const res = await fetch("/api/uploads/images", {
          method: "POST",
          body: fd,
        });

        if (res.ok) {
          const j = await res.json().catch(() => ({}));
          uploaded = Array.isArray(j.images)
            ? j.images
            : Array.isArray(j.uploaded)
            ? j.uploaded
            : [];
        }
      } catch {
        // Fallback locally
      }

      if (!uploaded.length) {
        const dataUrls = await Promise.all(imgs.map(readFileAsDataUrl));
        uploaded = dataUrls.filter(Boolean);
      }

      if (!uploaded.length) return;

      setForm((f) => {
        const next = [...(f.floorPlans || [])];
        const cur = next[rowIdx] || {
          label: "",
          type: "",
          sizeText: "",
          unitsCount: "",
          sizeMinSqft: "",
          sizeMaxSqft: "",
          previewSrc: "",
          pdfUrl: "",
          imagesCsv: "",
        };

        const existing = uniq(toLinesArray(cur.imagesCsv || ""));
        const merged = uniq([...existing, ...uploaded]);

        next[rowIdx] = {
          ...cur,
          previewSrc: (cur.previewSrc || "").trim()
            ? cur.previewSrc
            : uploaded[0],
          imagesCsv: merged.join("\n"),
        };

        return { ...f, floorPlans: next };
      });
    } catch (err) {
      setSaveAlertMsg({
        type: "error",
        message: `Floorplan upload notice: ${
          err.message || "Failed to process floorplan"
        }`,
      });
    } finally {
      setUploadingImages(false);
      setFloorDragIdx(null);
    }
  }

  async function onDelete(p) {
    if (!p?._id) return;
    if (!window.confirm(`Delete "${p.title}"?`)) return;

    try {
      const res = await fetch(`/api/properties/${p._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Delete failed");
      }
      setSaveAlertMsg({
        type: "success",
        message: `Property "${p.title}" deleted.`,
      });
      await loadProps();
    } catch (e) {
      setSaveAlertMsg({
        type: "error",
        message: `Failed to delete property: ${e.message}`,
      });
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editMongoId) {
        await updateProperty(editMongoId, form);
      } else {
        await createProperty(form);
      }
      setSaveAlertMsg({
        type: "success",
        message: "Property saved successfully!",
      });
      loadProps();
    } catch (error) {
      setSaveAlertMsg({
        type: "error",
        message: "Failed to save property.",
        details: error.message,
      });
    } finally {
      setSaving(false);
    }
  }

  const formJsx = (
    <div className={embedded ? "w-full space-y-6" : "container"}>
      {!embedded ? (
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <h1 className="heading-lg">Property Listings</h1>
            <p className="text-slate-600 mt-2">
              Create and update listings. Keep fields consistent with your site
              inventory schema.
            </p>
          </div>

          <div className="flex gap-3">
            <Link className="btn-outline" to={defaultBackUrl}>
              Back to Dashboard
            </Link>
            <button className="btn-primary" onClick={startCreate} type="button">
              New Property
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Property Listing Form
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete inventory schema with project specifications, media
              uploads, unit floor plans, and amenities.
            </p>
          </div>

          <button
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            onClick={startCreate}
            type="button"
          >
            Clear / New Listing
          </button>
        </div>
      )}

      {/* In-Form Alerts & Status Banners */}
      {saveAlertMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-md animate-in fade-in duration-200 ${
            saveAlertMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-rose-50 text-rose-800 border-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">
              {saveAlertMsg.type === "success" ? "✓" : "⚠️"}
            </span>
            <span>{saveAlertMsg.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveAlertMsg(null)}
            className="text-slate-500 hover:text-slate-900 font-bold ml-3 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {uploadStatusMsg && (
        <div className="p-3 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-medium flex items-center gap-2 shadow-sm animate-pulse">
          <span>🔄</span> {uploadStatusMsg}
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={onSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 mb-10 text-slate-900 shadow-xl"
      >
        {/* Top meta ribbon */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-5 mb-6 border-b border-slate-200">
          <div className="text-sm text-slate-600">
            {editingLoading ? (
              <span>Loading property...</span>
            ) : editMongoId ? (
              <>
                Editing{" "}
                <span className="font-semibold text-slate-900">
                  {form.title || "Untitled"}
                </span>
              </>
            ) : (
              <span>Creating a new property</span>
            )}
          </div>

          <button
            className="btn-primary"
            disabled={saving || editingLoading}
            type="submit"
          >
            {saving
              ? "Saving..."
              : editMongoId
              ? "Update Property"
              : "Create Property"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Basic */}
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">
              Basics
            </div>
          </div>

          <input
            className="input"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          />

          <select
            className="input"
            value={form.mode}
            onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
          >
            <option value="Buy">Buy</option>
            <option value="Rent">Rent</option>
            <option value="Sell">Sell</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              placeholder="Type"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
            />
          </div>

          <select
            className="input"
            value={form.featuredCategory}
            onChange={(e) =>
              setForm((f) => ({ ...f, featuredCategory: e.target.value }))
            }
          >
            <option value="">Featured Category (optional)</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Community">Community Projects</option>
          </select>

          <input
            className="input"
            placeholder="Display Price"
            value={form.displayPrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, displayPrice: e.target.value }))
            }
          />
          <input
            className="input"
            type="number"
            placeholder="Numeric Price"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />

          <input
            className="input"
            placeholder="Location"
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
          />
          <input
            className="input"
            placeholder="Community"
            value={form.community}
            onChange={(e) =>
              setForm((f) => ({ ...f, community: e.target.value }))
            }
          />

          <input
            className="input"
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
          />

          <input
            className="input"
            placeholder="Handover (e.g. Q2 2028)"
            value={form.handover}
            onChange={(e) =>
              setForm((f) => ({ ...f, handover: e.target.value }))
            }
          />
          <input
            className="input"
            type="number"
            placeholder="Year Built (optional)"
            value={form.yearBuilt}
            onChange={(e) =>
              setForm((f) => ({ ...f, yearBuilt: e.target.value }))
            }
          />

          {/* Images */}
          <div className="md:col-span-2 border border-slate-200 rounded-2xl p-5 mt-2">
            <SectionHeader
              title="Images"
              subtitle="Upload via drag & drop or choose from existing uploads. You can select many images."
              right={
                uploadingImages
                  ? "Uploading…"
                  : `Selected: ${uniq(imagesSelected).length}${
                      MAX_IMAGES === Infinity ? "" : `/${MAX_IMAGES}`
                    }`
              }
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                {/* ✅ Multi select instead of 4 fixed dropdowns */}
                <select
                  className="input min-h-[240px]"
                  multiple
                  value={uniq(imagesSelected)}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(
                      (o) => o.value
                    );
                    setImages(selected);
                  }}
                >
                  {availableImages.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setImagesSelected([])}
                    disabled={uploadingImages}
                  >
                    Clear selection
                  </button>

                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      // quick "select all" (be careful if you have thousands)
                      setImagesSelected(
                        MAX_IMAGES === Infinity
                          ? [...availableImages]
                          : availableImages.slice(0, MAX_IMAGES)
                      );
                    }}
                    disabled={uploadingImages || !availableImages.length}
                  >
                    Select all
                  </button>
                </div>

                <div
                  className={[
                    "rounded-2xl border p-4 transition",
                    "focus-within:ring-2 focus-within:ring-blue-200",
                    isDragging
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 bg-slate-50",
                    uploadingImages ? "opacity-70 pointer-events-none" : "",
                  ].join(" ")}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDragging(false);
                    uploadImages(e.dataTransfer.files);
                  }}
                >
                  <div className="text-sm text-slate-900 font-medium">
                    Drag & drop images here
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Or select files (JPG/PNG/WebP).
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <label className="btn-outline cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => uploadImages(e.target.files)}
                        disabled={uploadingImages}
                      />
                      {uploadingImages ? "Uploading..." : "Choose files"}
                    </label>

                    <div className="text-xs text-slate-500">
                      Files appear in the list after upload.
                    </div>
                  </div>

                  {/* Quick Luxury Presets Selector */}
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-600 mb-1.5 flex items-center gap-1">
                      <span>✨</span> Quick Luxury Presets (1-Click Add):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: "Skyline Tower", src: "/src/img/img1.jpg" },
                        { name: "Dubai Marina", src: "/src/img/dubai1.avif" },
                        { name: "Palm Villa", src: "/src/img/pexels.avif" },
                        { name: "Penthouse Suite", src: "/src/img/img5.jpg" },
                        { name: "Golf Estate", src: "/src/img/img7.jpg" },
                      ].map((preset) => (
                        <button
                          key={preset.src}
                          type="button"
                          onClick={() => {
                            setImagesSelected((prev) =>
                              normalizeAndUniqUploads([...prev, preset.src])
                            );
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium transition flex items-center gap-1.5 border border-slate-200"
                        >
                          <img
                            src={preset.src}
                            alt={preset.name}
                            className="w-3.5 h-3.5 rounded object-cover"
                          />
                          +{preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {uniq(imagesSelected).map((src) => (
                  <div
                    key={src}
                    className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50"
                    title={src}
                  >
                    <img
                      src={src}
                      alt="selected"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
                {!uniq(imagesSelected).length && (
                  <div className="col-span-4 text-sm text-slate-500">
                    No images selected.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project */}
          <div className="md:col-span-2 border border-slate-200 rounded-2xl p-5">
            <SectionHeader
              title="Project"
              subtitle={
                <>
                  Structured fields matching <code>project</code> in your data
                  schema.
                </>
              }
            />

            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="input"
                placeholder="About Title (e.g. ABOUT CAPITAL ONE - JVC)"
                value={form.project.aboutTitle}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, aboutTitle: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Project Name"
                value={form.project.projectName}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, projectName: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Developer"
                value={form.project.developer}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, developer: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Architect"
                value={form.project.architect}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, architect: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Project Location"
                value={form.project.location}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, location: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Plot Number"
                value={form.project.plotNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, plotNumber: e.target.value },
                  }))
                }
              />

              <input
                className="input"
                type="number"
                placeholder="Plot Area (sqft)"
                value={form.project.plotAreaSqft}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, plotAreaSqft: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Plot Area (e.g. 24,219 Sqft)"
                value={form.project.plotArea}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, plotArea: e.target.value },
                  }))
                }
              />

              <input
                className="input"
                placeholder="Estimated Completion (e.g. Q2 2028)"
                value={form.project.estCompletion}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      estCompletion: e.target.value,
                    },
                  }))
                }
              />

              <input
                className="input"
                placeholder="Tower Height (e.g. 3B+G+5P+23+R)"
                value={form.project.towerHeight}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, towerHeight: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Finishing (e.g. Shell & Core)"
                value={form.project.finishing}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, finishing: e.target.value },
                  }))
                }
              />

              <input
                className="input"
                type="number"
                placeholder="Lobby Ceiling Height (mm)"
                value={form.project.lobbyCeilingHeightMm}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      lobbyCeilingHeightMm: e.target.value,
                    },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Lobby Ceiling Height (e.g. 4550 mm)"
                value={form.project.lobbyCeilingHeight}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      lobbyCeilingHeight: e.target.value,
                    },
                  }))
                }
              />

              <input
                className="input"
                placeholder="Estimated Service Charges (e.g. AED 15 per sqft)"
                value={form.project.estimatedServiceCharges}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      estimatedServiceCharges: e.target.value,
                    },
                  }))
                }
              />

              <input
                className="input"
                type="number"
                placeholder="Number of Parking"
                value={form.project.numberOfParking}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      numberOfParking: e.target.value,
                    },
                  }))
                }
              />

              <textarea
                className="input md:col-span-2 min-h-[90px]"
                placeholder='Elevators (comma separated) e.g. "8 Office use, 1 Service use"'
                value={form.project.elevatorsCsv}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, elevatorsCsv: e.target.value },
                  }))
                }
              />

              <textarea
                className="input md:col-span-2 min-h-[90px]"
                placeholder='Parking Allocation (comma separated) e.g. "1 space for every 50 sqm..., 1 space for every 70 sqm..."'
                value={form.project.parkingAllocationCsv}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      parkingAllocationCsv: e.target.value,
                    },
                  }))
                }
              />

              <input
                className="input"
                placeholder="RERA Number"
                value={form.project.reraNumber}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, reraNumber: e.target.value },
                  }))
                }
              />

              <input
                className="input"
                type="number"
                placeholder="Total Number of Units"
                value={form.project.totalUnits}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, totalUnits: e.target.value },
                  }))
                }
              />

              <input
                className="input"
                placeholder="Branded (Yes/No)"
                value={form.project.branded}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, branded: e.target.value },
                  }))
                }
              />

              <input
                className="input"
                placeholder="Anticipated Service Fees (e.g. 18 AED / Sq. Ft.)"
                value={form.project.anticipatedServiceFees}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      anticipatedServiceFees: e.target.value,
                    },
                  }))
                }
              />

              <textarea
                className="input md:col-span-2 min-h-[80px]"
                placeholder="White Goods"
                value={form.project.whiteGoods}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, whiteGoods: e.target.value },
                  }))
                }
              />

              <input
                className="input"
                placeholder="Brand of White Goods"
                value={form.project.brandOfWhiteGoods}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      brandOfWhiteGoods: e.target.value,
                    },
                  }))
                }
              />

              <input
                className="input"
                placeholder="Sanitary Brand"
                value={form.project.sanitaryBrand}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      sanitaryBrand: e.target.value,
                    },
                  }))
                }
              />

              <input
                className="input"
                placeholder="Master Image"
                value={form.project.masterImage}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, masterImage: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Hero Title"
                value={form.project.heroTitle}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, heroTitle: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Hero Location"
                value={form.project.heroLocation}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, heroLocation: e.target.value },
                  }))
                }
              />
              <textarea
                className="input md:col-span-2 min-h-[80px]"
                placeholder="About"
                value={form.project.about}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, about: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Concept Title"
                value={form.project.conceptTitle}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, conceptTitle: e.target.value },
                  }))
                }
              />
              <textarea
                className="input md:col-span-2 min-h-[80px]"
                placeholder="Concept"
                value={form.project.concept}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, concept: e.target.value },
                  }))
                }
              />
              <textarea
                className="input md:col-span-2 min-h-[80px]"
                placeholder="Connectivity Text"
                value={form.project.connectivityText}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      connectivityText: e.target.value,
                    },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Meta Title"
                value={form.project.metaTitle}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, metaTitle: e.target.value },
                  }))
                }
              />
              <textarea
                className="input md:col-span-2 min-h-[80px]"
                placeholder="Meta Description"
                value={form.project.metaDescription}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      metaDescription: e.target.value,
                    },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Brochure URL"
                value={form.project.brochureUrl}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, brochureUrl: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Floorplan PDF URL"
                value={form.project.floorplanPdfUrl}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      floorplanPdfUrl: e.target.value,
                    },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Payment Plan Title"
                value={form.project.paymentPlanTitle}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      paymentPlanTitle: e.target.value,
                    },
                  }))
                }
              />
              <textarea
                className="input md:col-span-2 min-h-[80px]"
                placeholder="Payment Plan Steps (comma or newline separated)"
                value={form.project.paymentPlanStepsCsv}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      paymentPlanStepsCsv: e.target.value,
                    },
                  }))
                }
              />
              <textarea
                className="input md:col-span-2 min-h-[80px]"
                placeholder="Amenity Wellness (comma or newline separated)"
                value={form.project.amenityWellnessCsv}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      amenityWellnessCsv: e.target.value,
                    },
                  }))
                }
              />
              <textarea
                className="input md:col-span-2 min-h-[80px]"
                placeholder="Amenity Social (comma or newline separated)"
                value={form.project.amenitySocialCsv}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      amenitySocialCsv: e.target.value,
                    },
                  }))
                }
              />
              <textarea
                className="input md:col-span-2 min-h-[80px]"
                placeholder="Amenity Smart (comma or newline separated)"
                value={form.project.amenitySmartCsv}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      amenitySmartCsv: e.target.value,
                    },
                  }))
                }
              />
              <textarea
                className="input md:col-span-2 min-h-[80px]"
                placeholder="Drive Times (comma or newline separated)"
                value={form.project.driveTimesCsv}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      driveTimesCsv: e.target.value,
                    },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Starting Price"
                value={form.project.startingPrice}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: {
                      ...f.project,
                      startingPrice: e.target.value,
                    },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Unit Types"
                value={form.project.unitTypes}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, unitTypes: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Payment Plan"
                value={form.project.paymentPlan}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, paymentPlan: e.target.value },
                  }))
                }
              />
              <input
                className="input"
                placeholder="Handover"
                value={form.project.handover}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    project: { ...f.project, handover: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          {/* Amenities */}
          <div className="md:col-span-2 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Amenities
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Add amenity rows (Type + optional size + details).
                </div>
              </div>

              <button
                type="button"
                className="btn-outline"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    amenities: [
                      ...(f.amenities || []),
                      { type: "", sizeSqft: "", details: "", metaJson: "" },
                    ],
                  }))
                }
              >
                Add Row
              </button>
            </div>

            <div className="grid gap-3">
              {(form.amenities || []).map((row, idx) => (
                <div
                  key={idx}
                  className="grid md:grid-cols-6 gap-3 items-start border border-slate-200 rounded-xl p-3"
                >
                  <input
                    className="input md:col-span-2"
                    placeholder="Type (Pool / Gym / Kids Pool...)"
                    value={row.type}
                    onChange={(e) =>
                      setForm((f) => {
                        const next = [...(f.amenities || [])];
                        next[idx] = { ...next[idx], type: e.target.value };
                        return { ...f, amenities: next };
                      })
                    }
                  />

                  <input
                    className="input"
                    type="number"
                    placeholder="Size (sqft)"
                    value={row.sizeSqft}
                    onChange={(e) =>
                      setForm((f) => {
                        const next = [...(f.amenities || [])];
                        next[idx] = {
                          ...next[idx],
                          sizeSqft: e.target.value,
                        };
                        return { ...f, amenities: next };
                      })
                    }
                  />

                  <textarea
                    className="input md:col-span-2 min-h-[44px]"
                    placeholder={
                      "Details (one per line)\nExample:\n1.2 M Depth\nDimension: 22.3 M x 10 M"
                    }
                    value={row.details}
                    onChange={(e) =>
                      setForm((f) => {
                        const next = [...(f.amenities || [])];
                        next[idx] = {
                          ...next[idx],
                          details: e.target.value,
                        };
                        return { ...f, amenities: next };
                      })
                    }
                  />

                  <textarea
                    className="input md:col-span-6 min-h-[90px]"
                    placeholder={
                      'Meta (JSON) - optional\nExample:\n{\n  "zone": "Indoor",\n  "floor": "Basement",\n  "dimensionLxWxH_mm": "9700 x 6000 x 4450",\n  "ceilingHeightMm": 3200\n}'
                    }
                    value={row.metaJson || ""}
                    onChange={(e) =>
                      setForm((f) => {
                        const next = [...(f.amenities || [])];
                        next[idx] = {
                          ...next[idx],
                          metaJson: e.target.value,
                        };
                        return { ...f, amenities: next };
                      })
                    }
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() =>
                        setForm((f) => {
                          const cur = [...(f.amenities || [])];
                          cur.splice(idx, 1);
                          return {
                            ...f,
                            amenities: cur.length
                              ? cur
                              : [
                                  {
                                    type: "",
                                    sizeSqft: "",
                                    details: "",
                                    metaJson: "",
                                  },
                                ],
                          };
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-slate-500 mt-3">
              Tip: leave Size empty if unknown. Details can be multiple lines.
            </div>
          </div>

          {/* Floor Plans */}
          <div className="md:col-span-2 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Floor Plans
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  Add floor plan cards shown on the property page (preview image
                  + optional PDF).
                  <br />
                  <span className="text-slate-500">
                    This also replaces <code>unitMix[]</code> (units + min/max
                    sqft are stored per plan).
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn-outline"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    floorPlans: [
                      ...(f.floorPlans || []),
                      {
                        label: "",
                        type: "",
                        sizeText: "",
                        unitsCount: "",
                        sizeMinSqft: "",
                        sizeMaxSqft: "",
                        previewSrc: "",
                        pdfUrl: "",
                        imagesCsv: "",
                      },
                    ],
                  }))
                }
              >
                Add Floor Plan
              </button>
            </div>

            <div className="grid gap-3">
              {(form.floorPlans || []).map((row, idx) => {
                const preview =
                  row.previewSrc || toLinesArray(row.imagesCsv || "")[0] || "";

                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl p-4 grid gap-3"
                  >
                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        className="input"
                        placeholder="Label (e.g. 1 Bedroom)"
                        value={row.label}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...(f.floorPlans || [])];
                            next[idx] = {
                              ...next[idx],
                              label: e.target.value,
                            };
                            return { ...f, floorPlans: next };
                          })
                        }
                      />

                      <input
                        className="input"
                        placeholder="Type (optional: 1BR / Studio)"
                        value={row.type}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...(f.floorPlans || [])];
                            next[idx] = {
                              ...next[idx],
                              type: e.target.value,
                            };
                            return { ...f, floorPlans: next };
                          })
                        }
                      />

                      <input
                        className="input md:col-span-2"
                        placeholder="Size text (e.g. from 600 sq ft)"
                        value={row.sizeText}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...(f.floorPlans || [])];
                            next[idx] = {
                              ...next[idx],
                              sizeText: e.target.value,
                            };
                            return { ...f, floorPlans: next };
                          })
                        }
                      />

                      <input
                        className="input"
                        type="number"
                        placeholder="No. of units (optional)"
                        value={row.unitsCount ?? ""}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...(f.floorPlans || [])];
                            next[idx] = {
                              ...next[idx],
                              unitsCount: e.target.value,
                            };
                            return { ...f, floorPlans: next };
                          })
                        }
                      />

                      {/* ✅ merged from Unit Mix */}
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          className="input"
                          type="number"
                          placeholder="Min sqft (optional)"
                          value={row.sizeMinSqft ?? ""}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...(f.floorPlans || [])];
                              next[idx] = {
                                ...next[idx],
                                sizeMinSqft: e.target.value,
                              };
                              return { ...f, floorPlans: next };
                            })
                          }
                        />
                        <input
                          className="input"
                          type="number"
                          placeholder="Max sqft (optional)"
                          value={row.sizeMaxSqft ?? ""}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...(f.floorPlans || [])];
                              next[idx] = {
                                ...next[idx],
                                sizeMaxSqft: e.target.value,
                              };
                              return { ...f, floorPlans: next };
                            })
                          }
                        />
                      </div>

                      <select
                        className="input md:col-span-2"
                        value={row.previewSrc}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...(f.floorPlans || [])];
                            next[idx] = {
                              ...next[idx],
                              previewSrc: e.target.value,
                            };
                            return { ...f, floorPlans: next };
                          })
                        }
                      >
                        <option value="">
                          Preview Image (optional) — choose from uploads
                        </option>
                        {availableImages.map((src) => (
                          <option key={src} value={src}>
                            {src}
                          </option>
                        ))}
                      </select>

                      <div
                        className={[
                          "md:col-span-2 rounded-2xl border p-4 transition",
                          "focus-within:ring-2 focus-within:ring-blue-200",
                          "border-slate-200 bg-slate-50",
                          uploadingImages
                            ? "opacity-70 pointer-events-none"
                            : "",
                        ].join(" ")}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          uploadFloorPlanImages(idx, e.dataTransfer.files);
                        }}
                      >
                        <div className="text-sm text-slate-900 font-medium">
                          Drag & drop floor plan images here
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Upload PNG/JPG/WebP. After upload, images appear in
                          the dropdown and the first one will be used as Preview
                          (if empty).
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <label className="btn-outline cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) =>
                                uploadFloorPlanImages(idx, e.target.files)
                              }
                              disabled={uploadingImages}
                            />
                            {uploadingImages ? "Uploading..." : "Choose files"}
                          </label>

                          <button
                            type="button"
                            className="btn-outline"
                            onClick={() =>
                              setForm((f) => {
                                const next = [...(f.floorPlans || [])];
                                next[idx] = {
                                  ...next[idx],
                                  previewSrc: "",
                                };
                                return { ...f, floorPlans: next };
                              })
                            }
                            disabled={uploadingImages}
                            title="Clear preview selection"
                          >
                            Clear preview
                          </button>
                        </div>
                      </div>

                      <input
                        className="input md:col-span-2"
                        placeholder="PDF URL (optional)"
                        value={row.pdfUrl}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...(f.floorPlans || [])];
                            next[idx] = {
                              ...next[idx],
                              pdfUrl: e.target.value,
                            };
                            return { ...f, floorPlans: next };
                          })
                        }
                      />

                      <textarea
                        className="input md:col-span-2 min-h-[70px]"
                        placeholder={
                          "More images (optional) — one per line or comma separated\n(used as fallback if preview not set)"
                        }
                        value={row.imagesCsv}
                        onChange={(e) =>
                          setForm((f) => {
                            const next = [...(f.floorPlans || [])];
                            next[idx] = {
                              ...next[idx],
                              imagesCsv: e.target.value,
                            };
                            return { ...f, floorPlans: next };
                          })
                        }
                      />
                    </div>

                    {/* preview */}
                    <div className="grid md:grid-cols-3 gap-3 items-start">
                      <div className="md:col-span-2">
                        <div className="text-xs text-slate-500 mb-2">
                          Preview
                        </div>
                        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-48">
                          {preview ? (
                            <img
                              src={preview}
                              alt="floor plan preview"
                              className="w-full h-full object-contain bg-white"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                              No preview image
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex md:justify-end">
                        <button
                          type="button"
                          className="btn-outline"
                          onClick={() =>
                            setForm((f) => {
                              const cur = [...(f.floorPlans || [])];
                              cur.splice(idx, 1);
                              return {
                                ...f,
                                floorPlans: cur.length
                                  ? cur
                                  : [
                                      {
                                        label: "",
                                        type: "",
                                        sizeText: "",
                                        unitsCount: "",
                                        sizeMinSqft: "",
                                        sizeMaxSqft: "",
                                        previewSrc: "",
                                        pdfUrl: "",
                                        imagesCsv: "",
                                      },
                                    ],
                              };
                            })
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">
              Description
            </div>
          </div>

          <textarea
            className="input md:col-span-2 min-h-[110px]"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />

          <div className="md:col-span-2">
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">
              Highlights
            </div>
          </div>

          <textarea
            className="input md:col-span-2 min-h-[110px]"
            placeholder="Highlights (comma or newline separated)"
            value={form.highlightsCsv}
            onChange={(e) =>
              setForm((f) => ({ ...f, highlightsCsv: e.target.value }))
            }
          />
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-6 pt-6 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {loading
              ? "Loading listings…"
              : `${properties.length} total listings`}
          </div>

          <div className="flex justify-end gap-3">
            {editMongoId ? (
              <button
                type="button"
                className="btn-outline"
                onClick={startCreate}
                disabled={saving}
              >
                Cancel
              </button>
            ) : null}

            <button className="btn-primary" disabled={saving} type="submit">
              {saving
                ? "Saving..."
                : editMongoId
                ? "Update Property"
                : "Create Property"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  if (embedded) {
    return formJsx;
  }

  return (
    <>
      <AdminHeader />
      <section className="pt-32 section">{formJsx}</section>
      <Footer />
    </>
  );
}
