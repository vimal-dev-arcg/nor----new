import { useState } from "react";
import {
  FaTimes,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendarAlt,
  FaCar,
  FaCouch,
  FaShieldAlt,
  FaCheckCircle,
  FaDownload,
  FaExternalLinkAlt,
  FaPercent,
  FaClock,
  FaPhoneAlt,
  FaEnvelope,
  FaFilePdf,
  FaPauseCircle,
  FaTrashAlt,
  FaEdit,
  FaHandshake,
  FaLock,
  FaCoins,
  FaEye,
} from "react-icons/fa";

export default function PropertyDetailModal({
  property,
  onClose,
  role = "buyer", // 'buyer' | 'dealer' | 'agent' | 'checker' | 'admin' | 'super_admin'
  onEdit,
  onStatusChange,
  onDelete,
  onScheduleVisit,
  onHoldDeposit,
  onApprove,
  onReject,
  onModerationApprove,
  onModerationReject,
  onFinalizeSale,
}) {
  if (!property) return null;

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const images =
    property.images && property.images.length > 0
      ? property.images
      : property.image
      ? [property.image]
      : ["/src/img/img1.jpg", "/src/img/dubai1.avif", "/src/img/dubai2.avif"];

  const currentImg = images[activeImgIdx] || images[0];
  const numericPrice = Number(property.price || 0);
  const formattedPrice =
    property.displayPrice || `AED ${numericPrice.toLocaleString()}`;

  const isSold =
    String(property.status || "").toUpperCase() === "SOLD" ||
    String(property.status || "").toUpperCase() === "SOLD OUT";

  const isOnHold =
    String(property.status || "").toLowerCase() === "on hold" ||
    String(property.status || "").toLowerCase() === "hold";

  const isAvailable = !isSold && !isOnHold;

  const handleApproveAction = () => {
    if (onApprove) onApprove(property);
    else if (onModerationApprove) onModerationApprove(property);
    onClose();
  };

  const handleRejectAction = () => {
    if (onReject) onReject(property);
    else if (onModerationReject) onModerationReject(property);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200 relative">
        {/* Top Floating Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <a
            href={`/property/${property.id || property._id}`}
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3 rounded-full bg-slate-950/90 hover:bg-[#b3975b] text-slate-300 hover:text-white border border-slate-700 hover:border-[#b3975b] flex items-center gap-1.5 text-xs font-bold transition shadow-lg backdrop-blur"
            title="Open Dedicated Full Page in New Tab"
          >
            <FaExternalLinkAlt className="text-[10px]" />
            <span className="hidden sm:inline">Open Full Page</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-950/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition shadow-lg backdrop-blur"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-6">
          {/* 1. Header Badges & Title */}
          <div className="space-y-2 pr-12">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow ${
                  isSold
                    ? "bg-rose-600 text-white"
                    : isOnHold
                    ? "bg-amber-500 text-slate-950"
                    : "bg-emerald-500 text-slate-950"
                }`}
              >
                {isSold ? "SOLD OUT" : isOnHold ? "ON HOLD" : property.status || "AVAILABLE"}
              </span>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {property.type || "Apartment"} • {property.mode || "Buy"}
              </span>

              {property.hasDiscount && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow flex items-center gap-1">
                  <FaPercent className="text-[9px]" /> {property.discountPercent}% Special Discount
                </span>
              )}

              {property.moderationStatus && (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    property.moderationStatus === "approved"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  {property.moderationStatus === "approved" ? "✓ Verified Live" : "⏳ Pending Checker Moderation"}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {property.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[#b3975b] font-medium">
                <FaMapMarkerAlt /> {property.location}, {property.city}
              </span>
              {property.developer && (
                <span className="flex items-center gap-1">
                  <FaBuilding className="text-slate-500" /> Developer: {property.developer}
                </span>
              )}
              {property.handover && (
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="text-slate-500" /> Handover: {property.handover}
                </span>
              )}
              {property.dealerName && (
                <span className="flex items-center gap-1 text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700">
                  <FaShieldAlt className="text-[#b3975b]" /> Dealer: {property.dealerName} ({property.dealerLicense || "RERA Verified"})
                </span>
              )}
            </div>
          </div>

          {/* Status Alert Banner if Sold or Hold */}
          {isSold && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-100 text-xs sm:text-sm backdrop-blur flex items-center gap-2.5">
              <span className="text-base">🔒</span>
              <span>
                <strong>Deed Closed & Sold Out:</strong> This unit is fully finalized in escrow.
              </span>
            </div>
          )}
          {isOnHold && (
            <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-100 text-xs sm:text-sm backdrop-blur flex items-center gap-2.5">
              <span className="text-base">⏳</span>
              <span>
                <strong>Currently Under Reservation:</strong> In active escrow lock pending buyer final sign-off.
              </span>
            </div>
          )}

          {/* 2. Gallery & Image Viewer */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner group">
              <img
                src={currentImg}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Bottom Right Verified Badge */}
              <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#b3975b]/60 text-[11px] text-white shadow-xl flex items-center gap-1.5">
                <span className="text-[#b3975b] font-bold">★ NCR VERIFIED ASSET</span>
                {property.dealerName && <span>• {property.dealerName}</span>}
              </div>

              {/* Photo Counter */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono text-slate-300">
                Photo {activeImgIdx + 1} of {images.length}
              </div>
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      activeImgIdx === idx
                        ? "border-[#b3975b] ring-2 ring-[#b3975b]/30"
                        : "border-slate-800 hover:border-slate-600 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Pricing & Key Metrics Bar */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Offered Price
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {formattedPrice}
                </span>
                {property.originalPrice && property.originalPrice > property.price && (
                  <span className="text-sm text-slate-500 line-through">
                    AED {Number(property.originalPrice).toLocaleString()}
                  </span>
                )}
              </div>
              {property.discountNote && (
                <div className="text-xs text-amber-300 mt-1 font-medium flex items-center gap-1">
                  <span>🎁</span> {property.discountNote}
                </div>
              )}
            </div>

            {/* Core Unit Specs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <FaBed className="text-[#b3975b]" /> Bedrooms
                </div>
                <div className="text-sm font-bold text-white mt-0.5">{property.beds || 3} Beds</div>
              </div>

              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <FaBath className="text-[#b3975b]" /> Bathrooms
                </div>
                <div className="text-sm font-bold text-white mt-0.5">{property.baths || 3} Baths</div>
              </div>

              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <FaRulerCombined className="text-[#b3975b]" /> Built-up Area
                </div>
                <div className="text-sm font-bold text-white mt-0.5">{property.areaSqft || 2200} sqft</div>
              </div>

              <div className="text-center px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                  <FaCar className="text-[#b3975b]" /> Parking
                </div>
                <div className="text-sm font-bold text-white mt-0.5">{property.parking || "2 Covered"}</div>
              </div>
            </div>
          </div>

          {/* 4. Description & Highlights */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span>📝</span> Property Overview & Specifications
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              {property.description ||
                `${property.title} represents a premier luxury asset in ${property.location}, ${property.city}. Featuring high-end contemporary finishing, expansive panoramic vistas, and effortless connectivity to prime business and leisure hubs.`}
            </p>

            {property.highlights && property.highlights.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <div className="text-xs font-semibold text-[#b3975b]">Key Highlights:</div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  {property.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/50">
                      <FaCheckCircle className="text-emerald-400 mt-0.5 shrink-0" />
                      <span>{typeof h === "string" ? h : h.text || JSON.stringify(h)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 5. Amenities & Community Features */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>✨</span> Amenities & Community Features
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {property.amenities.map((amenity, idx) => {
                  const label = typeof amenity === "string" ? amenity : amenity.name || amenity.title || "Premium Feature";
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
                    >
                      <span className="text-[#b3975b]">✔</span>
                      <span className="font-medium truncate">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Floor Plans / Unit Mix (if available) */}
          {property.floorPlans && property.floorPlans.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span>📐</span> Unit Mix & Floor Layouts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.floorPlans.map((fp, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{fp.title || `Unit Layout ${i + 1}`}</span>
                      <span className="text-[#b3975b] font-mono">{fp.size || `${fp.beds || 3} BHK`}</span>
                    </div>
                    {fp.previewSrc && (
                      <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                        <img src={fp.previewSrc} alt={fp.title} className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Metadata Details Grid */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">RERA Number</span>
              <span className="font-bold text-slate-200 font-mono">{property.reraNumber || "RERA-2026-DXB-991"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Furnishing</span>
              <span className="font-bold text-slate-200">{property.furnishing || "Semi-Furnished"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Service Charges</span>
              <span className="font-bold text-slate-200">{property.serviceCharges || "AED 14 / sqft"}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Listed Date</span>
              <span className="font-bold text-slate-200">{property.listedAt || "2026-02-20"}</span>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer per Role */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          {/* Left Context Info */}
          <div className="text-xs text-slate-400">
            {(role === "dealer" || role === "agent") && (
              <span className="text-amber-400 font-semibold">Agent / Dealer Controls ({property.dealerName || "Authorized Dealer"})</span>
            )}
            {role === "buyer" && (
              <span className="text-emerald-400 font-semibold">VIP Buyer Reservation Hub</span>
            )}
            {role === "checker" && (
              <span className="text-cyan-400 font-semibold">Compliance Moderation (Navjeet Singh)</span>
            )}
            {(role === "admin" || role === "super_admin") && (
              <span className="text-[#b3975b] font-semibold">Master Admin Controls</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dealer & Admin Actions */}
            {(role === "dealer" || role === "agent" || role === "admin" || role === "super_admin") && (
              <>
                {/* Status Toggles: Active / Put on Hold / Sold Out */}
                {!isOnHold && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onStatusChange) onStatusChange(property.id || property._id, "On Hold");
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <FaPauseCircle /> Put on Hold
                  </button>
                )}

                {!isAvailable && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onStatusChange) onStatusChange(property.id || property._id, "Available");
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <FaCheckCircle /> Mark Active
                  </button>
                )}

                {!isSold && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onFinalizeSale) {
                        onFinalizeSale(property);
                      } else if (onStatusChange) {
                        onStatusChange(property.id || property._id, "SOLD");
                      }
                      onClose();
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <FaHandshake /> Mark Sold Out
                  </button>
                )}

                {/* Edit Button */}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onEdit(property);
                      onClose();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#b3975b] hover:bg-[#a08449] text-slate-950 font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <FaEdit /> Edit Property
                  </button>
                )}

                {/* Delete Button */}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${property.title}"?`)) {
                        onDelete(property.id || property._id);
                        onClose();
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold border border-rose-700/60 transition flex items-center gap-1.5"
                  >
                    <FaTrashAlt /> Delete
                  </button>
                )}
              </>
            )}

            {/* Buyer Actions */}
            {role === "buyer" && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onScheduleVisit) onScheduleVisit(property);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg transition flex items-center gap-1.5"
                >
                  <FaCalendarAlt /> Schedule VIP Visit
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onHoldDeposit) onHoldDeposit(property);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-1.5"
                >
                  <FaLock /> Hold with Escrow Deposit
                </button>
              </>
            )}

            {/* Checker Moderation Actions */}
            {role === "checker" && (
              <>
                <button
                  type="button"
                  onClick={handleApproveAction}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <FaCheckCircle /> Approve & Publish Live
                </button>

                <button
                  type="button"
                  onClick={handleRejectAction}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <FaTimes /> Reject / Request Revision
                </button>
              </>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
