import { Link } from "react-router-dom";

function resolveImageSrc(img) {
  if (!img) return "";
  if (typeof img === "string") {
    if (img.startsWith("data:") || img.startsWith("blob:") || img.startsWith("/") || /^https?:\/\//i.test(img)) {
      return img;
    }
    return `/${img.replace(/^\/+/, "")}`;
  }
  if (typeof img === "object" && typeof img.default === "string") {
    return img.default;
  }
  return "";
}

function normalizeHandover(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw;

  const t = new Date(raw).getTime();
  if (!Number.isNaN(t)) {
    return new Date(t).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  }
  return "";
}

function getHandoverText(property) {
  const raw =
    property?.handover ||
    property?.handoverDate ||
    property?.handover_time ||
    property?.handoverTime ||
    property?.completion ||
    property?.completionDate ||
    property?.deliveryDate;

  const v = normalizeHandover(raw);
  if (!v) return "";
  return String(v).toLowerCase().includes("handover") ? v : `Handover; ${v}`;
}

export default function PropertyCard({ property }) {
  const routeId = property?.id ?? property?._id;

  const firstImage = Array.isArray(property?.images)
    ? property.images[0]
    : property?.image || null;
  const imageSrc = resolveImageSrc(firstImage);

  const handoverText = getHandoverText(property);
  const statusStr = String(property?.status || "").trim();
  const isSold = statusStr.toLowerCase() === "sold" || statusStr.toLowerCase() === "sold out";
  const isHold = statusStr.toLowerCase() === "on hold" || statusStr.toLowerCase() === "hold" || statusStr.toLowerCase() === "reserved";

  return (
    <Link
      to={`/property/${routeId}`}
      className="group block overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition relative"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden bg-slate-900">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={property?.title || "Property"}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              isSold ? "grayscale-[30%] opacity-90" : ""
            }`}
            loading="lazy"
            onError={(e) => {
              e.target.src = "/src/img/img1.jpg";
            }}
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs">
            No Image Available
          </div>
        )}

        {/* Subtle vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Handover pill */}
        {handoverText && !isSold && !isHold && (
          <div className="absolute left-3 top-3 z-10">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 px-3 py-1.5 shadow-sm">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white font-semibold whitespace-nowrap">
                {handoverText}
              </div>
            </div>
          </div>
        )}

        {/* Prominent Status Badges (SOLD / HOLD / AVAILABLE) */}
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1">
          {isSold ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-600/95 backdrop-blur-md text-white text-[11px] font-black tracking-wider uppercase shadow-lg border border-rose-400/40">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              SOLD
            </span>
          ) : isHold ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/95 backdrop-blur-md text-slate-950 text-[11px] font-black tracking-wider uppercase shadow-lg border border-amber-300/40">
              <span className="w-2 h-2 rounded-full bg-slate-950 animate-pulse" />
              ON HOLD
            </span>
          ) : statusStr && statusStr !== "Available" ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20">
              {statusStr}
            </span>
          ) : null}
        </div>

        {/* SOLD Overlay Banner */}
        {isSold && (
          <div className="absolute inset-x-0 bottom-0 bg-rose-950/80 backdrop-blur-sm border-t border-rose-500/30 px-3 py-1.5 flex items-center justify-between text-white z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-200">
              Deed Closed & Settled
            </span>
            <span className="text-[10px] font-semibold text-rose-300">
              View History →
            </span>
          </div>
        )}

        {/* HOLD Overlay Banner */}
        {isHold && (
          <div className="absolute inset-x-0 bottom-0 bg-amber-950/80 backdrop-blur-sm border-t border-amber-500/30 px-3 py-1.5 flex items-center justify-between text-white z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-200">
              Under Active Reservation
            </span>
            <span className="text-[10px] font-semibold text-amber-300">
              Pending Contract →
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
          <span className="truncate font-medium text-slate-600">{property?.location || property?.city || "Dubai"}</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-700 uppercase text-[9px] tracking-wider shrink-0">
            {property?.type || "Property"}
          </span>
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-[#b3975b] transition-colors">
          {property?.title}
        </h3>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Price</span>
            <span className="font-bold text-[#b3975b] text-base">
              {property?.displayPrice || (property?.price ? `AED ${Number(property.price).toLocaleString()}` : "Price on Request")}
            </span>
          </div>

          <div className="text-right text-xs text-slate-600 font-medium">
            <span>{property?.beds || 2} Beds</span>
            <span className="mx-1.5 text-slate-300">•</span>
            <span>{property?.areaSqft || 1200} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
