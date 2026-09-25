import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { appStore, PERSONAS } from "../../lib/appStore";
import { generateCommissionInvoice } from "../../lib/pdfInvoice";
import { clearToken } from "../../lib/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PropertyDetailModal from "../../components/PropertyDetailModal";
import confetti from "canvas-confetti";
import {
  FaSearch,
  FaRobot,
  FaCalendarAlt,
  FaShareAlt,
  FaShieldAlt,
  FaBuilding,
  FaMapMarkerAlt,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCheckCircle,
  FaVideo,
  FaCar,
  FaLock,
  FaCopy,
  FaGift,
  FaExternalLinkAlt,
  FaStar,
  FaMoneyBillWave,
  FaTimes,
  FaClock,
  FaEye,
  FaSignOutAlt,
} from "react-icons/fa";

export default function BuyerDashboard() {
  const [store, setStore] = useState(appStore.getState());
  const currentUser = PERSONAS.buyer;
  const navigate = useNavigate();

  // Active Tab: 'ai-matching' | 'schedule' | 'referrals' | 'holding-deposits'
  const [activeTab, setActiveTab] = useState("ai-matching");

  // Property Detail Modal State (Full Details View)
  const [selectedDetailProperty, setSelectedDetailProperty] = useState(null);

  // AI Matching Engine State
  const [aiPrompt, setAiPrompt] = useState("");
  const [budgetMax, setBudgetMax] = useState(15000000);
  const [commuteLocation, setCommuteLocation] = useState("Any");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isAiSearching, setIsAiSearching] = useState(false);

  // Visit Booking Modal State
  const [visitModalProperty, setVisitModalProperty] = useState(null);
  const [visitDate, setVisitDate] = useState("");
  const [visitTimeSlot, setVisitTimeSlot] = useState("10:00 AM - 11:30 AM");
  const [visitType, setVisitType] = useState("Physical Visit");
  const [visitNotes, setVisitNotes] = useState("");
  const [visitRefCode, setVisitRefCode] = useState("");
  const [visitSuccessMsg, setVisitSuccessMsg] = useState("");

  // Holding Deposit Modal State
  const [depositProperty, setDepositProperty] = useState(null);
  const [depositAmount, setDepositAmount] = useState(50000);
  const [depositSuccessResult, setDepositSuccessResult] = useState(null);

  // Referral State
  const [referralFriendName, setReferralFriendName] = useState("");
  const [referralFriendEmail, setReferralFriendEmail] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const unsub = appStore.subscribe((state) => setStore(state));
    return unsub;
  }, []);

  // Filtered Properties for AI Matching
  const matchedProperties = useMemo(() => {
    const list = store.properties.filter(
      (p) => p.moderationStatus === "approved" || !p.moderationStatus
    );

    return list.map((prop) => {
      let score = 85;
      const reasons = [];

      if (prop.price <= budgetMax) {
        score += 8;
        reasons.push("Within your budget ceiling");
      } else {
        score -= 15;
      }

      if (commuteLocation !== "Any") {
        if (
          prop.location.toLowerCase().includes(commuteLocation.toLowerCase()) ||
          prop.city.toLowerCase().includes(commuteLocation.toLowerCase())
        ) {
          score += 10;
          reasons.push(`Direct prime commute to ${commuteLocation}`);
        }
      }

      if (selectedCategory !== "All") {
        if (
          (prop.featuredCategory &&
            prop.featuredCategory.toLowerCase() === selectedCategory.toLowerCase()) ||
          prop.type.toLowerCase() === selectedCategory.toLowerCase()
        ) {
          score += 6;
          reasons.push(`Matches category preference: ${selectedCategory}`);
        }
      }

      if (aiPrompt.trim()) {
        const query = aiPrompt.toLowerCase();
        if (
          prop.title.toLowerCase().includes(query) ||
          prop.location.toLowerCase().includes(query) ||
          prop.city.toLowerCase().includes(query) ||
          (prop.description && prop.description.toLowerCase().includes(query))
        ) {
          score += 15;
          reasons.push("Highly aligned with your AI prompt requirements");
        }
      }

      const matchPct = Math.min(Math.max(score, 65), 99);

      return {
        ...prop,
        matchPct,
        matchReasons: reasons.length ? reasons : ["High market capital appreciation rating", "Verified luxury inventory"],
      };
    }).sort((a, b) => b.matchPct - a.matchPct);
  }, [store.properties, budgetMax, commuteLocation, selectedCategory, aiPrompt]);

  // Handle Book Visit
  const handleScheduleVisit = (e) => {
    e.preventDefault();
    if (!visitDate || !visitModalProperty) return;

    appStore.bookVisit({
      propertyId: visitModalProperty.id,
      propertyTitle: visitModalProperty.title,
      propertyLocation: `${visitModalProperty.location}, ${visitModalProperty.city}`,
      buyerName: currentUser.name,
      buyerEmail: currentUser.email,
      buyerPhone: "+971 52 987 6543",
      dealerName: visitModalProperty.dealerName || "Vikram Kapoor",
      visitType,
      date: visitDate,
      timeSlot: visitTimeSlot,
      buyerRequestNote: visitNotes,
      referenceCode: visitRefCode,
      referredBy: visitRefCode ? `Ref Code: ${visitRefCode}` : "",
      notes: visitNotes,
    });

    confetti({ particleCount: 50, spread: 60 });
    setVisitSuccessMsg("Visit scheduled successfully! Confirmation dispatched to dealer.");
    setTimeout(() => {
      setVisitModalProperty(null);
      setVisitSuccessMsg("");
      setActiveTab("schedule");
    }, 1400);
  };

  // Handle Holding Deposit
  const handleLockHoldingDeposit = () => {
    if (!depositProperty) return;

    const res = appStore.placeHoldingDeposit({
      propertyId: depositProperty.id,
      propertyTitle: depositProperty.title,
      amount: depositAmount,
      buyerName: currentUser.name,
    });

    confetti({ particleCount: 70, spread: 80 });
    setDepositSuccessResult(res);
  };

  // Handle Referral Submit
  const handleSendReferralInvite = (e) => {
    e.preventDefault();
    if (!referralFriendName || !referralFriendEmail) return;

    appStore.addReferralInvite(referralFriendName, referralFriendEmail, currentUser.id);
    confetti({ particleCount: 40, spread: 60 });
    setReferralFriendName("");
    setReferralFriendEmail("");
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(
      `https://ncrproperties.ae/signup?ref=${currentUser.referralCode}`
    );
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden mb-8">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {currentUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" /> KYC Verified
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-0.5">
                  Client Portal • AI Property Matcher • Escrow Booking • Referral Hub
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2 text-right">
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Referral Points
                </div>
                <div className="text-lg font-bold text-[#b3975b] flex items-center gap-1 justify-end">
                  <FaGift className="text-sm" /> {currentUser.referralPoints} pts
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2 text-right">
                <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                  Holding Escrow Pool
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  AED {currentUser.holdingDepositBalance.toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  clearToken();
                  navigate("/login");
                }}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-2 shadow"
                title="Sign out of Buyer Portal"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab("ai-matching")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "ai-matching"
                  ? "bg-[#b3975b] text-slate-950 font-semibold shadow-lg shadow-[#b3975b]/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaRobot /> AI Matching Engine
            </button>

            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "schedule"
                  ? "bg-[#b3975b] text-slate-950 font-semibold shadow-lg shadow-[#b3975b]/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaCalendarAlt /> Schedule Manager ({store.visits.length})
            </button>

            <button
              onClick={() => setActiveTab("referrals")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "referrals"
                  ? "bg-[#b3975b] text-slate-950 font-semibold shadow-lg shadow-[#b3975b]/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaShareAlt /> Referral Hub ({store.referrals.length})
            </button>
          </div>
        </div>

        {/* TAB 1: AI MATCHING ENGINE */}
        {activeTab === "ai-matching" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Search & Natural Language Bar */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <FaRobot className="text-[#b3975b]" />
                  Natural Language AI Property Query
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Luxury 4-bedroom beachfront villa in Palm Jumeirah or prime penthouse near Golf Course Road with private pool..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl pl-12 pr-28 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#b3975b] text-sm"
                  />
                  <FaSearch className="absolute left-4 top-4 text-slate-500 text-base" />
                  {aiPrompt && (
                    <button
                      onClick={() => setAiPrompt("")}
                      className="absolute right-4 top-3.5 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Preference Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                    <span>Budget Ceiling:</span>
                    <span className="font-bold text-[#b3975b]">
                      AED {(budgetMax / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000000}
                    max={25000000}
                    step={500000}
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="w-full accent-[#b3975b] bg-slate-800 h-2 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Commute & District Focus:
                  </label>
                  <select
                    value={commuteLocation}
                    onChange={(e) => setCommuteLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#b3975b]"
                  >
                    <option value="Any">All Prime Regions (Dubai & India)</option>
                    <option value="Palm Jumeirah">Palm Jumeirah</option>
                    <option value="Downtown">Downtown Dubai & DIFC</option>
                    <option value="Dubai Hills">Dubai Hills Estate</option>
                    <option value="Dubai Marina">Dubai Marina</option>
                    <option value="Jumeirah Village">Jumeirah Village Circle</option>
                    <option value="Golf Course Road">Golf Course Road (Delhi NCR)</option>
                    <option value="Tricity">Tricity (Chandigarh • Panchkula • Mohali)</option>
                    <option value="Bangalore">Bangalore Tech Corridor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Asset Segment:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-[#b3975b]"
                  >
                    <option value="All">All Categories</option>
                    <option value="Residential">Residential Luxury</option>
                    <option value="Commercial">Commercial & Offices</option>
                    <option value="Community">Gated Communities & Villas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Smart Recommendation Cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaStar className="text-amber-400" />
                  AI Personalized Matches ({matchedProperties.length})
                </h2>
                <span className="text-xs text-slate-400">
                  Ranked by AI match confidence algorithm
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col group hover:border-slate-700 hover:shadow-2xl transition duration-300"
                  >
                    {/* Image Container with Match Badge */}
                    <div
                      onClick={() => navigate(`/property/${prop.id}`)}
                      className="relative h-56 w-full overflow-hidden bg-slate-800 cursor-pointer"
                    >
                      <img
                        src={prop.images && prop.images[0] ? prop.images[0] : "/src/img/img1.jpg"}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>

                      {/* AI Match Badge */}
                      <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-bold text-emerald-300">
                          {prop.matchPct}% Match
                        </span>
                      </div>

                      {/* Dealer Badge Bottom-Right Watermark */}
                      <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md border border-[#b3975b]/60 rounded-xl px-2.5 py-1 text-[10px] text-amber-200 flex items-center gap-1 shadow-md">
                        <FaShieldAlt className="text-[#b3975b] text-xs" />
                        <span>Verified Dealer: {prop.dealerName?.split(" ")[0] || "NCR Partner"}</span>
                      </div>

                      <div className="absolute bottom-3 left-3">
                        <span className="text-lg font-bold text-white drop-shadow">
                          {prop.displayPrice || `AED ${Number(prop.price).toLocaleString()}`}
                        </span>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 shadow-xl">
                          <FaEye className="text-[#b3975b]" /> View Property Details
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#b3975b] font-medium mb-1">
                          <FaMapMarkerAlt />
                          <span>
                            {prop.location}, {prop.city}
                          </span>
                        </div>
                        <h3
                          onClick={() => setSelectedDetailProperty(prop)}
                          className="text-base font-bold text-white line-clamp-1 group-hover:text-[#b3975b] transition cursor-pointer"
                        >
                          {prop.title}
                        </h3>

                        {/* Quick Specs */}
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2.5">
                          {prop.beds && (
                            <span className="flex items-center gap-1">
                              <FaBed className="text-slate-500" /> {prop.beds} Beds
                            </span>
                          )}
                          {prop.baths && (
                            <span className="flex items-center gap-1">
                              <FaBath className="text-slate-500" /> {prop.baths} Baths
                            </span>
                          )}
                          {prop.areaSqft && (
                            <span className="flex items-center gap-1">
                              <FaRulerCombined className="text-slate-500" /> {prop.areaSqft} sqft
                            </span>
                          )}
                        </div>

                        {/* AI Match Reasons */}
                        <div className="mt-3.5 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 space-y-1">
                          <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                            AI Recommendation Factor
                          </div>
                          {prop.matchReasons.slice(0, 2).map((reason, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-emerald-300 flex items-start gap-1.5"
                            >
                              <FaCheckCircle className="text-[10px] mt-0.5 shrink-0 text-emerald-400" />
                              <span className="line-clamp-1">{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons: Details, Book Visit, Hold Deposit */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setSelectedDetailProperty(prop)}
                          className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition border border-slate-700"
                        >
                          <FaEye className="text-[#b3975b]" /> View Property Details
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setVisitModalProperty(prop)}
                            className="px-3 py-2 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                          >
                            <FaCalendarAlt className="text-xs" />
                            Book Visit
                          </button>
                          <button
                            onClick={() => setDepositProperty(prop)}
                            className="px-3 py-2 rounded-xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
                          >
                            <FaLock className="text-xs" />
                            Hold Deposit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE MANAGER */}
        {activeTab === "schedule" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Your Property Visit Schedule
                </h2>
                <p className="text-sm text-slate-400">
                  Manage confirmed on-site private tours and virtual 3D walkthroughs
                </p>
              </div>
              <button
                onClick={() => setActiveTab("ai-matching")}
                className="px-4 py-2 rounded-xl bg-[#b3975b] text-slate-950 font-semibold text-xs flex items-center gap-2 self-start"
              >
                <FaCalendarAlt /> Schedule New Visit
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Visits List (Col 1 & 2) */}
              <div className="lg:col-span-2 space-y-4">
                {store.visits.map((visit) => {
                  const statusColors = {
                    Requested: "bg-amber-500/20 text-amber-300 border-amber-500/30",
                    Confirmed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                    Completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                    Cancelled: "bg-rose-500/20 text-rose-300 border-rose-500/30",
                  };

                  return (
                    <div
                      key={visit.id}
                      className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              statusColors[visit.status] || "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {visit.status}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {visit.visitType || "Physical Visit"}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white">
                          {visit.propertyTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                          <span className="flex items-center gap-1 text-[#b3975b]">
                            <FaCalendarAlt /> {visit.date}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <FaClock /> {visit.timeSlot}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <FaBuilding /> Dealer: {visit.dealerName}
                          </span>
                        </div>

                        {visit.notes && (
                          <p className="text-xs text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                            Note: {visit.notes}
                          </p>
                        )}
                      </div>

                      {/* Action / Link */}
                      <div className="flex sm:flex-col items-end gap-2 shrink-0">
                        {visit.meetLink && (
                          <a
                            href={visit.meetLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                          >
                            <FaVideo /> Join Virtual Tour
                          </a>
                        )}
                        <span className="text-[11px] text-slate-500">
                          ID: #{visit.id}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Schedule Summary & Tips */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 h-fit space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FaShieldAlt className="text-[#b3975b]" />
                  Visit Protocol & Guarantees
                </h3>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Private VIP Chauffeur transfer available for Palm Jumeirah & Downtown viewings.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      All property visits conducted by RERA-licensed certified broker partners.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <FaCheckCircle className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Virtual 3D tours recorded with high-definition drone footage and interior floor plan scans.
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">NCR Concierge Helpline</div>
                  <div className="text-sm font-bold text-[#b3975b]">+971 4 800 627 (Toll Free)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: REFERRAL HUB */}
        {activeTab === "referrals" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 rounded-3xl p-6 sm:p-8 border border-amber-500/20 shadow-2xl relative overflow-hidden">
              <div className="max-w-2xl space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#b3975b]/20 text-[#b3975b] border border-[#b3975b]/30">
                  NCR Ambassador Program
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Earn AED 1,000 to AED 5,000 for Every Investor You Introduce
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Share your personalized referral code with fellow property investors and high-net-worth buyers. Receive cash credits or fee vouchers applied directly to your escrow purchases.
                </p>

                {/* Referral Code Box */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
                      Your Referral Code:
                    </span>
                    <span className="text-base font-bold text-[#b3975b] font-mono">
                      {currentUser.referralCode}
                    </span>
                  </div>
                  <button
                    onClick={copyReferralLink}
                    className="px-5 py-3 rounded-2xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
                  >
                    <FaCopy /> {copiedLink ? "Copied Link!" : "Copy Shareable Link"}
                  </button>
                </div>
              </div>
            </div>

            {/* Invite Form & Live Referrals Tracker */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Invite Form */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaGift className="text-[#b3975b]" /> Invite an Investor
                </h3>
                <form onSubmit={handleSendReferralInvite} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Investor Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={referralFriendName}
                      onChange={(e) => setReferralFriendName(e.target.value)}
                      placeholder="e.g. Vikram Singhal"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-[#b3975b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Investor Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={referralFriendEmail}
                      onChange={(e) => setReferralFriendEmail(e.target.value)}
                      placeholder="e.g. vikram@investments.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:ring-2 focus:ring-[#b3975b] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow"
                  >
                    Send VIP VIP Invitation
                  </button>
                </form>
              </div>

              {/* Referral Invitee Pipeline */}
              <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">
                    Invited Investors Pipeline ({store.referrals.length})
                  </h3>
                  <span className="text-xs text-emerald-400 font-medium">
                    Total Reward Earned: AED 3,400
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Invitee</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold text-right">Reward</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {store.referrals.map((ref) => (
                        <tr key={ref.id} className="text-slate-200">
                          <td className="py-3">
                            <div className="font-semibold text-white">{ref.refereeName}</div>
                            <div className="text-[11px] text-slate-400">{ref.refereeEmail}</div>
                          </td>
                          <td className="py-3 text-slate-400">{ref.date}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                              {ref.status}
                            </span>
                          </td>
                          <td className="py-3 text-right font-bold text-[#b3975b]">
                            +{ref.rewardPoints} pts
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: BOOK VISIT POPUP */}
      {visitModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Schedule Private Property Tour
                </h3>
                <p className="text-xs text-slate-400">
                  {visitModalProperty.title}
                </p>
              </div>
              <button
                onClick={() => setVisitModalProperty(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            {visitSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center gap-2">
                <FaCheckCircle /> {visitSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleScheduleVisit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-[#b3975b]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Time Slot
                    </label>
                    <select
                      value={visitTimeSlot}
                      onChange={(e) => setVisitTimeSlot(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:ring-2 focus:ring-[#b3975b]"
                    >
                      <option>10:00 AM - 11:30 AM</option>
                      <option>02:00 PM - 03:30 PM</option>
                      <option>04:30 PM - 06:00 PM</option>
                      <option>07:00 PM - 08:30 PM (Sunset Viewing)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Tour Modality
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVisitType("Physical Visit")}
                      className={`p-3 rounded-xl border flex items-center gap-2 justify-center font-medium ${
                        visitType === "Physical Visit"
                          ? "bg-blue-600/20 border-blue-500 text-blue-300"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      <FaCar /> On-Site VIP Tour
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisitType("Virtual 3D Walkthrough")}
                      className={`p-3 rounded-xl border flex items-center gap-2 justify-center font-medium ${
                        visitType === "Virtual 3D Walkthrough"
                          ? "bg-purple-600/20 border-purple-500 text-purple-300"
                          : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      <FaVideo /> Virtual 3D Drone Tour
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Specific Inquiries or Request Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="e.g. Inquiring about high-floor units, sea view, and 40/60 post-handover payment plan..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#b3975b]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Agent or Investor Reference Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={visitRefCode}
                    onChange={(e) => setVisitRefCode(e.target.value)}
                    placeholder="e.g. NCR-RAHUL-789 or REF-VIP-2026"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase focus:ring-2 focus:ring-[#b3975b]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Providing a reference code routes your inquiry with VIP priority to the authorized listing broker.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setVisitModalProperty(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-bold"
                  >
                    Confirm Tour Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: HOLDING DEPOSIT POPUP */}
      {depositProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaLock className="text-[#b3975b]" />
                  Secure Escrow Holding Deposit
                </h3>
                <p className="text-xs text-slate-400">
                  {depositProperty.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setDepositProperty(null);
                  setDepositSuccessResult(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <FaTimes />
              </button>
            </div>

            {depositSuccessResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <FaCheckCircle className="text-base" /> Escrow Hold Successfully Locked!
                  </div>
                  <p>
                    Certificate:{" "}
                    <span className="font-mono font-bold text-white">
                      {depositSuccessResult.certificateId}
                    </span>
                  </p>
                  <p>
                    Amount:{" "}
                    <span className="font-bold text-white">
                      AED {Number(depositSuccessResult.amount).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-400">
                    The property has been placed under priority holding status. A formal NOC contract draft has been sent to your registered email.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDepositProperty(null);
                    setDepositSuccessResult(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold"
                >
                  Close & View Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Listing Price:</span>
                    <span className="font-bold text-white">
                      AED {Number(depositProperty.price).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dealer / Representative:</span>
                    <span className="text-slate-300">
                      {depositProperty.dealerName || "Vikram Kapoor"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Escrow Security:</span>
                    <span className="text-emerald-400 font-semibold">100% Refundable 14-day Hold</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Select Holding Deposit Amount:
                  </label>
                  <select
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-[#b3975b]"
                  >
                    <option value={25000}>AED 25,000 (Express 7-Day Hold)</option>
                    <option value={50000}>AED 50,000 (Standard 14-Day Priority Hold)</option>
                    <option value={100000}>AED 100,000 (VIP 30-Day Exclusive Contract Hold)</option>
                  </select>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200">
                  Secured by NCR Properties Escrow Vault. Funds held in compliant trustee accounts under UAE Central Bank escrow guidelines.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setDepositProperty(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLockHoldingDeposit}
                    className="px-5 py-2 rounded-xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-bold shadow"
                  >
                    Authorize Escrow Hold
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL PROPERTY DETAILS MODAL */}
      {selectedDetailProperty && (
        <PropertyDetailModal
          property={selectedDetailProperty}
          role="buyer"
          onClose={() => setSelectedDetailProperty(null)}
          onScheduleVisit={(prop) => {
            setVisitModalProperty(prop);
          }}
          onHoldDeposit={(prop) => {
            setDepositProperty(prop);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
