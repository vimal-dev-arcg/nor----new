import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { appStore, PERSONAS } from "../../lib/appStore";
import { generateCommissionInvoice } from "../../lib/pdfInvoice";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminPropertyListings from "../Admin/AdminPropertyListings";
import PropertyDetailModal from "../../components/PropertyDetailModal";
import confetti from "canvas-confetti";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaBuilding,
  FaPlusCircle,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaFileInvoiceDollar,
  FaBed,
  FaBath,
  FaRulerCombined,
  FaPercentage,
  FaEdit,
  FaTimes,
  FaChartLine,
  FaDownload,
  FaCommentDots,
  FaSearch,
  FaUserTag,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCoins,
  FaHandshake,
  FaEye,
  FaTrashAlt,
  FaPauseCircle,
} from "react-icons/fa";

export default function DealerDashboard() {
  const navigate = useNavigate();
  const [store, setStore] = useState(appStore.getState());
  const currentUser = PERSONAS.dealer;

  // Active Tab: 'listings' | 'create' | 'pipeline' | 'finances'
  const [activeTab, setActiveTab] = useState("listings");

  // Property Details & Edit State
  const [selectedDetailProp, setSelectedDetailProp] = useState(null);
  const [editingProp, setEditingProp] = useState(null);

  // Lead Pipeline Filters
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("ALL");

  // Finances Chart Metric
  const [financesMetric, setFinancesMetric] = useState("commission"); // 'commission' | 'sales' | 'distribution'

  // Discount Modal for Existing Listings
  const [discountModalProp, setDiscountModalProp] = useState(null);
  const [modalDiscountPct, setModalDiscountPct] = useState(5);
  const [modalDiscountNote, setModalDiscountNote] = useState("Exclusive Platinum Dealer Discount");

  // Lead Detail & Agent Note Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [agentPrivateNoteInput, setAgentPrivateNoteInput] = useState("");
  const [leadRefInput, setLeadRefInput] = useState("");
  const [leadReferredByInput, setLeadReferredByInput] = useState("");
  const [leadBuyerNoteInput, setLeadBuyerNoteInput] = useState("");

  useEffect(() => {
    const unsub = appStore.subscribe((state) => setStore(state));
    return unsub;
  }, []);

  // Filter listings by dealer
  const dealerListings = store.properties.filter(
    (p) => p.dealerId === currentUser.id || p.dealerName?.includes(currentUser.name.split(" ")[0])
  );

  // Financial Calculations for Dealer (2% cut on SOLD)
  const dealerTransactions = store.escrowLedger.filter(
    (t) => t.dealerId === currentUser.id || t.dealerName?.includes(currentUser.name.split(" ")[0])
  );

  const totalClosedSalesVolume = dealerTransactions.reduce((acc, t) => acc + (t.salePrice || 0), 0);
  const totalEarnedCommission = dealerTransactions.reduce((acc, t) => acc + (t.dealerCut || 0), 0);
  const pendingPayoutCommission = dealerTransactions
    .filter((t) => t.status === "PENDING_ESCROW")
    .reduce((acc, t) => acc + (t.dealerCut || 0), 0);
  const settledCommission = dealerTransactions
    .filter((t) => t.status === "SETTLED")
    .reduce((acc, t) => acc + (t.dealerCut || 0), 0);

  // Monthly Revenue Data for Dealer Chart
  const dealerMonthlyChart = [
    { month: "Jan", salesM: 4.5, commissionK: 90 },
    { month: "Feb", salesM: 9.8, commissionK: 196 },
    { month: "Mar", salesM: 6.2, commissionK: 124 },
    { month: "Apr", salesM: 11.4, commissionK: 228 },
    { month: "May", salesM: 14.8, commissionK: 296 },
    { month: "Jun", salesM: 18.0, commissionK: 360 },
    { month: "Jul", salesM: 22.5, commissionK: 450 },
    { month: "Aug", salesM: 27.2, commissionK: 544 },
  ];

  // Handle Apply Discount on Existing Listing
  const handleSaveDiscount = (e) => {
    e.preventDefault();
    if (!discountModalProp) return;

    appStore.applyPropertyDiscount({
      propertyId: discountModalProp.id,
      discountPercent: Number(modalDiscountPct),
      discountNote: modalDiscountNote,
    });

    confetti({ particleCount: 50, spread: 70 });
    setDiscountModalProp(null);
  };

  // Handle Save Agent Lead Note & Reference
  const handleSaveLeadDetails = (e) => {
    e.preventDefault();
    if (!selectedLead) return;

    appStore.updateAgentVisitDetails(selectedLead.id, {
      agentNotes: agentPrivateNoteInput,
      referenceCode: leadRefInput,
      referredBy: leadReferredByInput || (leadRefInput ? "Direct Reference Lead" : "Organic Direct"),
      buyerRequestNote: leadBuyerNoteInput,
    });

    setSelectedLead(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Top Dealer Identity & Revenue Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shrink-0">
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
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    2% Platinum Dealer
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {currentUser.agencyName} • License:{" "}
                  <span className="font-mono text-amber-300 font-bold">
                    {currentUser.licenseNumber}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2 text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  2% Accrued Commission
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  AED {totalEarnedCommission.toLocaleString()}
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2 text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Pending in Escrow
                </div>
                <div className="text-lg font-bold text-amber-400">
                  AED {pendingPayoutCommission.toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => setActiveTab("create")}
                className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition"
              >
                <FaPlusCircle /> Property Listing
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab("listings")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "listings"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaBuilding /> My Listings & Discount Hub ({dealerListings.length})
            </button>

            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "create"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaPlusCircle /> Property Listing
            </button>

            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "pipeline"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaCalendarCheck /> Lead & Visit Pipeline ({store.visits.length})
            </button>

            <button
              onClick={() => setActiveTab("finances")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "finances"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaChartLine /> 2% Revenue Graphs & Metrics
            </button>
          </div>
        </div>

        {/* TAB 1: DEALER LISTINGS & DISCOUNT HUB */}
        {activeTab === "listings" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Agency Portfolio & Discount Management
                </h2>
                <p className="text-xs text-slate-400">
                  Manage your active property assets, apply custom dealer discounts, and track Checker moderation status.
                </p>
              </div>

              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                {dealerListings.filter((p) => p.status !== "SOLD").length} Active Listings on Market
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dealerListings.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition group"
                >
                  <div
                    onClick={() => navigate(`/property/${prop.id}`)}
                    className="relative aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={prop.images?.[0] || "/src/img/img1.jpg"}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Watermark badge indication */}
                    <div className="absolute bottom-2 right-2 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-[#b3975b]/60 text-[10px] text-white">
                      <span className="text-[#b3975b] font-bold">★ VERIFIED DEALER</span>: {currentUser.name}
                    </div>

                    {/* Status & Discount Pill */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          prop.status === "SOLD" || prop.status === "Sold Out"
                            ? "bg-rose-500/90 text-white"
                            : prop.status === "On Hold" || prop.status === "Hold"
                            ? "bg-amber-500/90 text-slate-950"
                            : "bg-emerald-500/90 text-slate-950"
                        }`}
                      >
                        {prop.status || "Available"}
                      </span>
                      {prop.hasDiscount && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 shadow flex items-center gap-1">
                          <FaPercentage className="text-[8px]" /> {prop.discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Moderation Pill */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          prop.moderationStatus === "approved"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {prop.moderationStatus === "approved" ? "Verified Live" : "Pending Checker"}
                      </span>
                    </div>

                    {/* Hover Click to View Hint */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 shadow-xl">
                        <FaEye className="text-[#b3975b]" /> View Live Property Page
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] text-[#b3975b] font-semibold uppercase tracking-wider">
                        {prop.location}, {prop.city}
                      </div>
                      <h3
                        onClick={() => navigate(`/property/${prop.id}`)}
                        className="text-base font-bold text-white mt-1 line-clamp-1 cursor-pointer hover:text-emerald-400 transition"
                      >
                        {prop.title}
                      </h3>

                      {/* Pricing with Discount Strikethrough */}
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-extrabold text-emerald-400">
                          {prop.displayPrice || `AED ${Number(prop.price).toLocaleString()}`}
                        </span>
                        {prop.originalPrice && prop.originalPrice > prop.price && (
                          <span className="text-xs text-slate-500 line-through">
                            AED {Number(prop.originalPrice).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {prop.discountNote && (
                        <p className="text-[11px] text-amber-300/90 font-medium mt-1">
                          🎁 {prop.discountNote}
                        </p>
                      )}
                    </div>

                    {/* Specs & Actions */}
                    <div className="pt-3 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <FaBed className="text-slate-500" /> {prop.beds || 3} Beds
                        </span>
                        <span className="flex items-center gap-1">
                          <FaBath className="text-slate-500" /> {prop.baths || 3} Baths
                        </span>
                        <span className="flex items-center gap-1">
                          <FaRulerCombined className="text-slate-500" /> {prop.areaSqft || 2400} sqft
                        </span>
                      </div>

                      {/* Quick Status Bar */}
                      <div className="flex items-center justify-between gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-[10px]">
                        <span className="text-slate-400 px-1 font-semibold">Status:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => appStore.updatePropertyStatus(prop.id, "Available")}
                            className={`px-2 py-1 rounded-lg font-bold transition ${
                              prop.status === "Available"
                                ? "bg-emerald-500 text-slate-950 shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Active
                          </button>
                          <button
                            type="button"
                            onClick={() => appStore.updatePropertyStatus(prop.id, "On Hold")}
                            className={`px-2 py-1 rounded-lg font-bold transition ${
                              prop.status === "On Hold"
                                ? "bg-amber-500 text-slate-950 shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Hold
                          </button>
                          <button
                            type="button"
                            onClick={() => appStore.updatePropertyStatus(prop.id, "SOLD")}
                            className={`px-2 py-1 rounded-lg font-bold transition ${
                              prop.status === "SOLD" || prop.status === "Sold Out"
                                ? "bg-rose-500 text-white shadow"
                                : "text-slate-400 hover:text-white"
                            }`}
                          >
                            Sold
                          </button>
                        </div>
                      </div>

                      {/* Actions: View, Edit, Discount, Delete */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/property/${prop.id}`)}
                          className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-700"
                          title="Open Live Property Details Page"
                        >
                          <FaEye className="text-[#b3975b]" /> View
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingProp(prop);
                            setActiveTab("create");
                          }}
                          className="py-2 rounded-xl bg-[#b3975b]/20 hover:bg-[#b3975b]/30 text-[#d4af37] text-xs font-bold transition flex items-center justify-center gap-1 border border-[#b3975b]/30"
                          title="Edit in Master Form"
                        >
                          <FaEdit /> Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDiscountModalProp(prop);
                            setModalDiscountPct(prop.discountPercent || 5);
                            setModalDiscountNote(prop.discountNote || "Exclusive Dealer Special Discount");
                          }}
                          className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1 border border-slate-700"
                          title="Apply Price Discount"
                        >
                          <FaPercentage /> %
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete listing "${prop.title}"?`)) {
                              appStore.deleteProperty(prop.id);
                            }
                          }}
                          className="py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900 text-rose-300 text-xs font-bold transition flex items-center justify-center gap-1 border border-rose-800/40"
                          title="Delete Listing"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MASTER ADMIN PROPERTY LISTING FORM */}
        {activeTab === "create" && (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">
                {editingProp ? `Editing: "${editingProp.title}"` : "Creating a new verified listing"}
              </span>
              {editingProp && (
                <button
                  type="button"
                  onClick={() => setEditingProp(null)}
                  className="text-xs text-amber-400 hover:underline"
                >
                  Clear & Switch to New Listing
                </button>
              )}
            </div>
            <AdminPropertyListings
              embedded={true}
              defaultBackUrl="/dashboard/dealer"
              initialEditProperty={editingProp}
              onSaved={() => {
                confetti({ particleCount: 70, spread: 80 });
                setEditingProp(null);
                setActiveTab("listings");
              }}
            />
          </div>
        )}

        {/* TAB 3: LEAD & VISIT PIPELINE WITH BUYER REQUEST NOTES & REFERENCES */}
        {activeTab === "pipeline" && (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <FaUserTag className="text-emerald-400" />
                  Agent Lead & Visit Management Pipeline
                </h2>
                <p className="text-xs text-slate-400">
                  Review buyer requests, reference codes, add internal agent notes, and confirm tour appointments.
                </p>
              </div>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                {store.visits.filter((v) => v.status === "Requested").length} New Requests Pending Action
              </span>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
              <div className="relative w-full sm:w-72">
                <FaSearch className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search buyer, property, or ref code..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                {["ALL", "Requested", "Confirmed", "Completed"].map((statusKey) => (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setLeadStatusFilter(statusKey)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition shrink-0 ${
                      leadStatusFilter === statusKey
                        ? "bg-emerald-500 text-slate-950 font-bold shadow"
                        : "text-slate-400 hover:text-white bg-slate-900/60"
                    }`}
                  >
                    {statusKey === "ALL" ? "All Inquiries" : statusKey}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Client & Contact</th>
                    <th className="pb-3 font-semibold">Property</th>
                    <th className="pb-3 font-semibold">Buyer Request / Note</th>
                    <th className="pb-3 font-semibold">Referral / Source</th>
                    <th className="pb-3 font-semibold">Schedule</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {store.visits
                    .filter((v) => {
                      if (leadStatusFilter !== "ALL" && v.status !== leadStatusFilter) return false;
                      if (!leadSearch.trim()) return true;
                      const q = leadSearch.toLowerCase();
                      return (
                        v.buyerName?.toLowerCase().includes(q) ||
                        v.buyerEmail?.toLowerCase().includes(q) ||
                        v.propertyTitle?.toLowerCase().includes(q) ||
                        v.referenceCode?.toLowerCase().includes(q) ||
                        v.buyerRequestNote?.toLowerCase().includes(q) ||
                        v.agentNotes?.toLowerCase().includes(q)
                      );
                    })
                    .map((visit) => (
                      <tr key={visit.id} className="text-slate-200 hover:bg-slate-800/30 transition">
                        <td className="py-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {visit.buyerName}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <FaEnvelope className="text-slate-500 text-[10px]" /> {visit.buyerEmail}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <FaPhoneAlt className="text-slate-500 text-[10px]" /> {visit.buyerPhone}
                          </div>
                        </td>
                        <td className="py-4 max-w-[200px]">
                          <div className="font-semibold text-white truncate" title={visit.propertyTitle}>
                            {visit.propertyTitle}
                          </div>
                          <div className="text-[11px] text-[#b3975b] flex items-center gap-1">
                            <FaMapMarkerAlt className="text-[10px]" /> {visit.propertyLocation}
                          </div>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                            {visit.visitType}
                          </span>
                        </td>

                        {/* Buyer Request / Note */}
                        <td className="py-4 max-w-xs">
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                            <div className="font-semibold text-[#b3975b] flex items-center gap-1 mb-1">
                              <FaCommentDots /> Buyer Specific Request:
                            </div>
                            <p className="line-clamp-2 italic text-slate-300">
                              "{visit.buyerRequestNote || visit.notes || "Inquiring about immediate viewing and pricing options."}"
                            </p>
                          </div>
                          {visit.agentNotes && (
                            <div className="mt-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-500/20">
                              <span className="font-bold">Agent Note:</span> {visit.agentNotes}
                            </div>
                          )}
                        </td>

                        {/* Reference / Referral */}
                        <td className="py-4">
                          {visit.referenceCode ? (
                            <div className="space-y-1">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold font-mono inline-block">
                                #{visit.referenceCode}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {visit.referredBy ? `Source: ${visit.referredBy}` : "Direct Referral Code"}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-slate-400 text-[11px] font-semibold bg-slate-800 px-2 py-0.5 rounded">
                                Organic Direct
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Schedule */}
                        <td className="py-4">
                          <div className="font-medium text-white">{visit.date}</div>
                          <div className="text-[11px] text-slate-400">{visit.timeSlot}</div>
                        </td>

                        {/* Status */}
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              visit.status === "Confirmed"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : visit.status === "Requested"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {visit.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 text-right space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedLead(visit);
                              setAgentPrivateNoteInput(visit.agentNotes || "");
                              setLeadRefInput(visit.referenceCode || "");
                              setLeadReferredByInput(visit.referredBy || "");
                              setLeadBuyerNoteInput(visit.buyerRequestNote || visit.notes || "");
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                            title="Edit notes & referral source"
                          >
                            <FaEdit className="inline mr-1 text-[#b3975b]" /> Edit Notes & Source
                          </button>

                          {visit.status === "Requested" && (
                            <button
                              onClick={() => {
                                appStore.updateVisitStatus(visit.id, "Confirmed");
                                confetti({ particleCount: 30, spread: 60 });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow transition"
                            >
                              Confirm
                            </button>
                          )}

                          {visit.status === "Confirmed" && (
                            <button
                              onClick={() => appStore.updateVisitStatus(visit.id, "Completed")}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold shadow transition"
                            >
                              Completed
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: 2% REVENUE GRAPHS & METRICS */}
        {activeTab === "finances" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Lifetime Closed Sales Volume
                </div>
                <div className="text-xl font-bold text-white mt-1">
                  AED {totalClosedSalesVolume.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-400 mt-1">
                  {dealerTransactions.length} Deals Finalized
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Total 2% Commission Accrued
                </div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  AED {totalEarnedCommission.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">2.00% Fixed Platinum Ratio</div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Pending in Escrow
                </div>
                <div className="text-xl font-bold text-amber-400 mt-1">
                  AED {pendingPayoutCommission.toLocaleString()}
                </div>
                <div className="text-[10px] text-amber-300/80 mt-1">Awaiting Trustee wire</div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xl">
                <div className="text-[11px] text-slate-400 uppercase font-semibold">
                  Settled & Disbursed
                </div>
                <div className="text-xl font-bold text-blue-400 mt-1">
                  AED {settledCommission.toLocaleString()}
                </div>
                <div className="text-[10px] text-blue-300/80 mt-1">Transferred to Bank Account</div>
              </div>
            </div>

            {/* DEALER REVENUE, TRANSACTION VOLUME & COMMISSION DISTRIBUTION WIDGET */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaChartLine className="text-emerald-400" />
                    Dealer Commission Trends, Transaction Volumes & Distribution (2026)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time Recharts visualization of monthly commission yields, closed transaction volumes, and 50/50 commercial split distribution (excluding the 1% compliance checker split).
                  </p>
                </div>

                {/* Metric Toggle */}
                <div className="flex flex-wrap bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setFinancesMetric("commission")}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                      financesMetric === "commission"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    2% Commission Cut (AED)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinancesMetric("sales")}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                      financesMetric === "sales"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Sales Volume (AED M)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinancesMetric("distribution")}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                      financesMetric === "distribution"
                        ? "bg-emerald-500 text-slate-950 font-bold shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Commission Distribution
                  </button>
                </div>
              </div>

              {/* Recharts Chart Component */}
              <div className="bg-slate-950/90 rounded-2xl p-6 border border-slate-800/80 space-y-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {financesMetric === "commission" ? (
                      <AreaChart data={dealerMonthlyChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dealerCommission" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(v) => `${v}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#10b981",
                            borderRadius: "1rem",
                            color: "#fff",
                            fontSize: "12px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                          }}
                          formatter={(value) => [
                            `AED ${(value * 1000).toLocaleString()}`,
                            "2% Dealer Commission",
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="commissionK"
                          name="2% Commission"
                          stroke="#10b981"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#dealerCommission)"
                        />
                      </AreaChart>
                    ) : financesMetric === "sales" ? (
                      <BarChart data={dealerMonthlyChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(v) => `${v}M`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#38bdf8",
                            borderRadius: "1rem",
                            color: "#fff",
                            fontSize: "12px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                          }}
                          formatter={(value) => [
                            `AED ${value}M (${value * 1000000} AED)`,
                            "Closed Property Sales Volume",
                          ]}
                        />
                        <Bar
                          dataKey="salesM"
                          name="Sales Volume (AED M)"
                          fill="#38bdf8"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center justify-around h-full gap-4">
                        <div className="h-56 w-56 relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#0f172a",
                                  borderColor: "#10b981",
                                  borderRadius: "1rem",
                                  color: "#fff",
                                  fontSize: "12px",
                                }}
                                formatter={(val, name) => [`AED ${Number(val).toLocaleString()} (50.0%)`, name]}
                              />
                              <Pie
                                data={[
                                  { name: "Dealer Commission (2.0%)", value: totalEarnedCommission || 196000, color: "#10b981" },
                                  { name: "Admin Platform Fee (2.0%)", value: totalEarnedCommission || 196000, color: "#b3975b" },
                                ]}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={78}
                                paddingAngle={5}
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#b3975b" />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute text-center pointer-events-none">
                            <span className="text-[9px] text-slate-400 block uppercase font-mono">Commission</span>
                            <span className="text-sm font-black text-emerald-400">2.0%</span>
                          </div>
                        </div>

                        {/* Distribution Legend & Split Notes */}
                        <div className="space-y-2.5 max-w-sm text-xs">
                          <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                              <span className="font-bold text-white">Your Dealer Cut</span>
                            </div>
                            <span className="font-mono font-bold text-emerald-300">50.0% (2.0% of GMV)</span>
                          </div>

                          <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/30 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full bg-[#b3975b]" />
                              <span className="font-bold text-white">Platform Technology Node</span>
                            </div>
                            <span className="font-mono font-bold text-amber-300">50.0% (2.0% of GMV)</span>
                          </div>

                          <div className="p-2 bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400">
                            <span className="text-emerald-400 font-semibold">Excluding 1% Split:</span> 1.00% compliance checker escrow allocation is excluded from this commercial distribution pool.
                          </div>
                        </div>
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>Calculated at fixed 2.0% statutory broker commission entitlement</span>
                  </div>
                  <div className="font-mono text-emerald-400 font-semibold">
                    MoM Velocity: +31.2% Sales Growth
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Ledger Table */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  2% Dealer Commission Transaction Ledger
                </h3>
                <span className="text-xs text-slate-400">
                  Calculated automatically upon property SOLD status transition
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Invoice & Property</th>
                      <th className="pb-3 font-semibold">Final Sale Price</th>
                      <th className="pb-3 font-semibold">Mandatory 5% Fee</th>
                      <th className="pb-3 font-semibold text-emerald-400 font-bold">Your 2% Cut</th>
                      <th className="pb-3 font-semibold">Escrow Status</th>
                      <th className="pb-3 font-semibold text-right">PDF Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {dealerTransactions.map((tx) => (
                      <tr key={tx.id} className="text-slate-200">
                        <td className="py-4">
                          <div className="font-bold text-white">{tx.propertyTitle}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {tx.invoiceNumber} • Lock: {tx.txLockId}
                          </div>
                        </td>
                        <td className="py-4 font-bold text-white">
                          AED {Number(tx.salePrice).toLocaleString()}
                        </td>
                        <td className="py-4 text-slate-400">
                          AED {Number(tx.totalPlatformFee).toLocaleString()} (5%)
                        </td>
                        <td className="py-4 font-bold text-emerald-400 text-sm">
                          AED {Number(tx.dealerCut).toLocaleString()}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === "SETTLED"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => generateCommissionInvoice(tx, "DEALER")}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] flex items-center gap-1.5 ml-auto shadow"
                          >
                            <FaDownload className="text-[#b3975b]" /> PDF Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: APPLY / EDIT DISCOUNT ON PROPERTY */}
      {discountModalProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FaPercentage className="text-amber-400" /> Apply Dealer Discount
              </h3>
              <button
                onClick={() => setDiscountModalProp(null)}
                className="text-slate-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="text-slate-300 font-semibold">{discountModalProp.title}</div>
            <div className="text-slate-400">
              Original Base Price:{" "}
              <span className="font-bold text-white">
                AED {Number(discountModalProp.originalPrice || discountModalProp.price).toLocaleString()}
              </span>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={modalDiscountPct}
                  onChange={(e) => setModalDiscountPct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Promotional Offer Tag / Note
                </label>
                <input
                  type="text"
                  value={modalDiscountNote}
                  onChange={(e) => setModalDiscountNote(e.target.value)}
                  placeholder="e.g. 5% Early Bird Discount"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Price Preview */}
              {modalDiscountPct > 0 && (
                <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 text-amber-300 space-y-1">
                  <div className="flex justify-between">
                    <span>Discount Savings:</span>
                    <span>
                      AED{" "}
                      {Math.round(
                        ((discountModalProp.originalPrice || discountModalProp.price) * modalDiscountPct) / 100
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-white">
                    <span>New Published Price:</span>
                    <span className="text-emerald-400">
                      AED{" "}
                      {Math.round(
                        (discountModalProp.originalPrice || discountModalProp.price) * (1 - modalDiscountPct / 100)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDiscountModalProp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Save & Apply Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT AGENT LEAD NOTE & REFERENCE */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FaCommentDots className="text-emerald-400" /> Lead Details & Agent Notes
              </h3>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-white">{selectedLead.buyerName}</div>
              <div className="text-slate-400">{selectedLead.buyerEmail} • {selectedLead.buyerPhone}</div>
              <div className="text-[#b3975b] font-medium">{selectedLead.propertyTitle}</div>
            </div>

            {/* Buyer custom request */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="font-semibold text-slate-300 block">Buyer Initial Note / Request:</span>
              <p className="text-slate-400">
                {selectedLead.buyerRequestNote || selectedLead.notes || "No special request stated."}
              </p>
            </div>

            <form onSubmit={handleSaveLeadDetails} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Referral Code / Tag
                  </label>
                  <input
                    type="text"
                    value={leadRefInput}
                    onChange={(e) => setLeadRefInput(e.target.value)}
                    placeholder="e.g. NCR-RAHUL-789"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Specific Referral Source
                  </label>
                  <input
                    type="text"
                    value={leadReferredByInput}
                    onChange={(e) => setLeadReferredByInput(e.target.value)}
                    placeholder="e.g. VIP Investor / Private Banking Desk"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Buyer Inquiry Request & Specific Needs
                </label>
                <textarea
                  rows={2}
                  value={leadBuyerNoteInput}
                  onChange={(e) => setLeadBuyerNoteInput(e.target.value)}
                  placeholder="Buyer's specific viewing preferences, budget requirements, and payment plan requests..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Dealer Private Follow-Up Note (Internal CRM)
                </label>
                <textarea
                  rows={3}
                  value={agentPrivateNoteInput}
                  onChange={(e) => setAgentPrivateNoteInput(e.target.value)}
                  placeholder="Enter private notes on buyer budget, viewing outcome, or follow-up plan..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow"
                >
                  Save Lead Details & Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PROPERTY DETAIL MODAL */}
      {selectedDetailProp && (
        <PropertyDetailModal
          property={selectedDetailProp}
          role="dealer"
          onClose={() => setSelectedDetailProp(null)}
          onEdit={(prop) => {
            setEditingProp(prop);
            setActiveTab("create");
          }}
          onStatusChange={(propId, newStatus) => {
            appStore.updatePropertyStatus(propId, newStatus);
            // also update modal's property state if open
            setSelectedDetailProp((prev) => (prev ? { ...prev, status: newStatus } : null));
          }}
          onDelete={(propId) => {
            appStore.deleteProperty(propId);
            setSelectedDetailProp(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
