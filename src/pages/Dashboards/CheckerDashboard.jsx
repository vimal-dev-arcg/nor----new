import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appStore, PERSONAS } from "../../lib/appStore";
import { generateCommissionInvoice } from "../../lib/pdfInvoice";
import { clearToken } from "../../lib/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PropertyDetailModal from "../../components/PropertyDetailModal";
import confetti from "canvas-confetti";
import {
  FaShieldAlt,
  FaUserCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaHistory,
  FaDownload,
  FaBuilding,
  FaEye,
  FaIdCard,
  FaFileAlt,
  FaSearch,
  FaFilter,
  FaClock,
  FaSignOutAlt,
  FaRobot,
  FaSlidersH,
  FaArrowRight,
  FaCheckDouble,
} from "react-icons/fa";

export default function CheckerDashboard() {
  const API_BASE = import.meta.env.VITE_API_BASE;
  const [store, setStore] = useState(appStore.getState());
  const currentUser = PERSONAS.checker;
  const navigate = useNavigate();

  // Active Tab: 'moderation' | 'kyc-queue' | 'audit-log'
  const [activeTab, setActiveTab] = useState("moderation");

  // Selected Property for Full Details Modal
  const [selectedDetailProp, setSelectedDetailProp] = useState(null);

  // Selected Property for Manual Review / Remarks Modal
  const [reviewProp, setReviewProp] = useState(null);
  const [moderationRemarks, setModerationRemarks] = useState("");

  // Selected Property for Automated AI Inspection Modal
  const [autoCheckProp, setAutoCheckProp] = useState(null);
  const [autoCheckReport, setAutoCheckReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Selected KYC for Review Modal
  const [reviewKyc, setReviewKyc] = useState(null);
  const [kycRemarks, setKycRemarks] = useState("");

  const [properties, setProperties] = useState([]);
  const [kycQueue, setKycQueue] = useState([]);
  const [escrowLedger, setEscrowLedger] = useState([]);

  // Removed unused await statement outside of async function

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch properties
        const propertiesRes = await fetch(`${API_BASE}/properties`);
        if (!propertiesRes.ok) {
          throw new Error(`Failed to fetch properties: ${propertiesRes.status}`);
        }
        const propertiesData = await propertiesRes.json();
        setProperties(propertiesData);
  
        // Fetch KYC queue
        const kycRes = await fetch(`${API_BASE}/properties/kyc-queue`);
        if (!kycRes.ok) {
          console.warn(`KYC queue not found: ${kycRes.status}`);
          setKycQueue([]); // Set an empty array if no data
        } else {
          const kycData = await kycRes.json();
          setKycQueue(kycData);
        }
  
        // Fetch escrow ledger
        const escrowRes = await fetch(`${API_BASE}/properties/escrow-ledger`);
        if (!escrowRes.ok) {
          console.warn(`Escrow ledger not found: ${escrowRes.status}`);
          setEscrowLedger([]); // Set an empty array if no data
        } else {
          const escrowData = await escrowRes.json();
          setEscrowLedger(escrowData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  
    fetchData();
  }, []);

  // Filter properties by 2-stage status
  const pendingCheckerProperties = properties.filter(
    (p) =>
      p.moderationStatus === "pending_checker" ||
      p.moderationStatus === "pending_review" ||
      p.moderationStatus === "revision_requested" ||
      (!p.checkerApproved && p.moderationStatus !== "approved")
  );

  const pendingAdminProperties = properties.filter(
    (p) =>
      p.moderationStatus === "pending_admin" ||
      (p.checkerApproved && !p.adminApproved)
  );

  const liveApprovedProperties = properties.filter(
    (p) =>
      p.moderationStatus === "approved" && p.checkerApproved && p.adminApproved
  );

  const pendingKyc = kycQueue.filter((k) => k.status === "pending");

  const totalCheckerEarned = escrowLedger.reduce(
    (acc, t) => acc + (t.checkerCut || 0),
    0
  );
  const totalGmvAudited = escrowLedger.reduce(
    (acc, t) => acc + (t.salePrice || 0),
    0
  );
  const pendingCheckerPayout = escrowLedger
    .filter((t) => t.status === "PENDING_ESCROW")
    .reduce((acc, t) => acc + (t.checkerCut || 0), 0);

  // Trigger Auto-Check
  const handleStartAutoCheck = (prop) => {
    setAutoCheckProp(prop);
    setIsScanning(true);
    setAutoCheckReport(null);

    setTimeout(() => {
      const report = appStore.runAutomatedListingCheck(prop);
      setAutoCheckReport(report);
      setIsScanning(false);
    }, 700);
  };

  // Submit Auto-Check Approval
  const handleAutoApprove = () => {
    if (!autoCheckProp || !autoCheckReport) return;
  
    appStore.checkerApproveListing(autoCheckProp.id, {
      checkType: "auto",
      score: autoCheckReport.overallScore,
      remarks: `Passed AI compliance check (${autoCheckReport.overallScore}/100). All ${autoCheckReport.passedChecksCount} criteria validated. Forwarded to Admin Sudhir.`,
    });
  
    // Update moderationStatus to "pending_admin"
    appStore.updatePropertyStatus(autoCheckProp.id, "pending_admin");
  
    confetti({ particleCount: 50, spread: 60 });
    setAutoCheckProp(null);
    setAutoCheckReport(null);
  };

  // Handle Manual Moderation Decision
  const handleManualModerationDecision = (decision) => {
    if (!reviewProp) return;
  
    if (decision === "approved") {
      appStore.checkerApproveListing(reviewProp.id, {
        checkType: "manual",
        score: 95,
        remarks:
          moderationRemarks ||
          "Manual audit complete. Title deed, RERA license, and watermark verified by Navjeet Singh. Forwarded to Admin.",
      });
  
      // Update moderationStatus to "pending_admin"
      appStore.updatePropertyStatus(reviewProp.id, "pending_admin");
  
      confetti({ particleCount: 50, spread: 60 });
    } else {
      appStore.updateListingModeration(
        reviewProp.id,
        decision,
        moderationRemarks ||
          `Listing ${decision} by Compliance Officer Navjeet Singh.`
      );
    }
  
    setReviewProp(null);
    setModerationRemarks("");
  };

  // Handle KYC Decision
  const handleKycDecision = (decision) => {
    if (!reviewKyc) return;

    appStore.updateKycStatus(
      reviewKyc.id,
      decision,
      kycRemarks || `KYC profile marked as ${decision} by Compliance Officer.`
    );

    if (decision === "approved") {
      confetti({ particleCount: 50, spread: 60 });
    }

    setReviewKyc(null);
    setKycRemarks("");
  };

  function firstImage(images) {
    if (!images || images.length === 0) {
      return "/src/img/img1.jpg";
    }
  
    if (images[0].startsWith("http://") || images[0].startsWith("https://")) {
      return images[0];
    }
  
    return images[0];
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Compliance Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 p-0.5 shadow-lg shrink-0">
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
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <FaShieldAlt className="text-[10px]" /> Stage 1 Compliance &
                    Verification Checker
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Auditor Console • RERA & KYC Regulatory Clearance • AI
                  Automated & Manual Verification
                </p>
              </div>
            </div>

            {/* Quick Checker Metrics */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Pending Stage 1 Check
                </div>
                <div className="text-lg font-bold text-amber-400">
                  {pendingCheckerProperties.length} Listings
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Pending KYC Verifications
                </div>
                <div className="text-lg font-bold text-cyan-400">
                  {pendingKyc.length} Users
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  clearToken();
                  navigate("/login");
                }}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-2 shadow"
                title="Sign out of Checker Portal"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          {/* TWO-STAGE MODERATION WORKFLOW BAR */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <span>Mandatory 2-Step Listing Approval Pipeline:</span>
              <span className="text-cyan-400 font-normal">
                (Property goes LIVE only after both Checker and Admin approve)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <div className="font-bold text-cyan-300">
                    Stage 1: Checker Verification
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Navjeet Singh verifies RERA license, title deed, photos &
                    pricing via <strong>Auto-Check</strong> or{" "}
                    <strong>Manual Check</strong>.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <div className="font-bold text-amber-300">
                    Stage 2: Admin Broking & Clearance
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Admin Sudhir checks commercial viability, configures{" "}
                    <strong>Broking %</strong> (e.g. 5%), and authorizes
                    listing.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <div className="font-bold text-emerald-300">
                    Stage 3: Live on Marketplace
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    Listing becomes active and visible to all verified buyers,
                    investors, and public visitors.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab("moderation")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "moderation"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaBuilding /> Stage 1 Listing Moderation Queue (
              {pendingCheckerProperties.length})
            </button>

            <button
              onClick={() => setActiveTab("kyc-queue")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "kyc-queue"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaUserCheck /> Account KYC Queue ({pendingKyc.length})
            </button>

            <button
              onClick={() => setActiveTab("audit-log")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "audit-log"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaHistory /> Audit Trail Log ({store.auditLogs.length})
            </button>
          </div>
        </div>

        {/* TAB 1: LISTING MODERATION QUEUE */}
        {activeTab === "moderation" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Stage 1: Checker Compliance Moderation Queue
                </h2>
                <p className="text-xs text-slate-400">
                  Verify dealer license watermark, title deed authenticity,
                  pricing compliance, and image validity using Auto-Check or
                  Manual Check.
                </p>
              </div>
              <span className="text-xs text-amber-300 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20 font-semibold">
                {pendingCheckerProperties.length} Listings Awaiting Checker
                Clearance
              </span>
            </div>

            {pendingCheckerProperties.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <FaCheckCircle className="text-emerald-400 text-4xl mx-auto" />
                <h3 className="text-lg font-bold text-white">
                  Stage 1 Queue Clear!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  All submitted property listings have been verified by Checker
                  Navjeet Singh and forwarded to Admin Sudhir for Commercial
                  Approval & Broking % Setup.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingCheckerProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-slate-900 rounded-3xl border border-amber-500/30 overflow-hidden flex flex-col justify-between shadow-xl group hover:border-amber-500/60 transition"
                  >
                    <div
                      onClick={() => setSelectedDetailProp(prop)}
                      className="relative h-48 w-full bg-slate-800 cursor-pointer overflow-hidden"
                    >
                    <img
  src={firstImage(prop.images)}
  alt={prop.title}
  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
/>
                      <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow">
                        Stage 1: Pending Checker
                      </div>
                      <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm border border-[#b3975b]/60 rounded-lg px-2 py-0.5 text-[9px] text-amber-200">
                        Watermark Attached
                      </div>

                      {/* Click overlay hint */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-bold border border-slate-700 flex items-center gap-1 shadow-lg">
                          <FaEye className="text-cyan-400" /> Click to Inspect
                          Full Details
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-xs text-[#b3975b] font-medium">
                          {prop.location}, {prop.city}
                        </div>
                        <h3
                          onClick={() => setSelectedDetailProp(prop)}
                          className="text-base font-bold text-white mt-0.5 hover:text-cyan-400 cursor-pointer transition line-clamp-1"
                        >
                          {prop.title}
                        </h3>
                        <div className="text-lg font-bold text-cyan-400 mt-1">
                          {prop.displayPrice ||
                            `AED ${Number(prop.price).toLocaleString()}`}
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Submitting Dealer:</span>
                          <span className="font-semibold text-white">
                            {prop.dealerName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>RERA License:</span>
                          <span className="font-mono text-amber-300">
                            {prop.dealerLicense}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Area / Category:</span>
                          <span className="text-white">
                            {prop.areaSqft || "—"} sqft •{" "}
                            {prop.featuredCategory || "Residential"}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Auto-Check and Manual Check */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleStartAutoCheck(prop)}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
                          title="Run automated compliance scan on this listing"
                        >
                          <FaRobot className="text-sm" /> Auto-Check
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReviewProp(prop);
                            setModerationRemarks("");
                          }}
                          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700"
                          title="Inspect manually and enter remarks"
                        >
                          <FaSlidersH /> Manual Check
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PIPELINE STAGE 2: Forwarded to Admin for Broking % Setup */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaCheckDouble className="text-amber-400" />
                    Forwarded to Stage 2: Awaiting Admin Broking % (
                    {pendingAdminProperties.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Approved by Checker Navjeet. Currently with Admin Sudhir to
                    assign Broking % before going live.
                  </p>
                </div>
              </div>

              {pendingAdminProperties.length === 0 ? (
                <div className="p-6 text-center bg-slate-900/60 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
                  No properties currently waiting at Admin review stage.
                </div>
              ) : (
                <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 font-semibold">ID</th>
                        <th className="pb-3 font-semibold">Property</th>
                        <th className="pb-3 font-semibold">Price</th>
                        <th className="pb-3 font-semibold">
                          Checker Verification
                        </th>
                        <th className="pb-3 font-semibold">Admin Status</th>
                        <th className="pb-3 font-semibold text-right">
                          Inspect
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {pendingAdminProperties.map((prop) => (
                        <tr
                          key={prop.id}
                          className="text-slate-200 hover:bg-slate-800/30 transition"
                        >
                          <td className="py-3 font-mono text-slate-400">
                            #{prop.id}
                          </td>
                          <td
                            onClick={() => setSelectedDetailProp(prop)}
                            className="py-3 font-semibold text-white hover:text-cyan-400 cursor-pointer"
                          >
                            {prop.title}
                          </td>
                          <td className="py-3 text-cyan-400 font-bold">
                            AED {Number(prop.price).toLocaleString()}
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                              ✓ Checker Passed (
                              {prop.checkerCheckType || "auto"})
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                              Pending Admin Broking %
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailProp(prop)}
                              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-semibold text-[11px] transition inline-flex items-center gap-1 border border-slate-700"
                            >
                              <FaEye /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Approved & Live Listings Section */}
            <div className="pt-4">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <FaCheckCircle className="text-emerald-400" />
                Fully Approved & Live Inventory on Marketplace (
                {liveApprovedProperties.length})
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Both Checker and Admin have approved these listings. They are
                currently live for buyers and investors.
              </p>

              <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">ID</th>
                      <th className="pb-3 font-semibold">Property</th>
                      <th className="pb-3 font-semibold">Price</th>
                      <th className="pb-3 font-semibold">Broking %</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">
                        Checker Verification
                      </th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {liveApprovedProperties.map((prop) => (
                      <tr
                        key={prop.id}
                        className="text-slate-200 hover:bg-slate-800/30 transition"
                      >
                        <td className="py-3 font-mono text-slate-400">
                          #{prop.id}
                        </td>
                        <td
                          onClick={() => setSelectedDetailProp(prop)}
                          className="py-3 font-semibold text-white hover:text-cyan-400 cursor-pointer"
                        >
                          {prop.title}
                        </td>
                        <td className="py-3 text-cyan-400 font-bold">
                          AED {Number(prop.price).toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">
                            {prop.brokingPercentage || 5}% Broking
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                            {prop.status} (LIVE)
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 text-[11px]">
                          {prop.checkerRemarks || "Verified by Checker"}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailProp(prop)}
                            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-semibold text-[11px] transition inline-flex items-center gap-1 border border-slate-700"
                          >
                            <FaEye /> View
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

        {/* TAB 2: ACCOUNT KYC VERIFICATION QUEUE */}
        {activeTab === "kyc-queue" && (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  User Account KYC & Compliance Verification
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect identity proofs, RERA certifications, and corporate
                  registry records before platform trading activation.
                </p>
              </div>
              <span className="text-xs text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                {pendingKyc.length} Pending Profiles
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Document Type</th>
                    <th className="pb-3 font-semibold">Document #</th>
                    <th className="pb-3 font-semibold">Submitted</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {store.kycQueue.map((item) => (
                    <tr key={item.id} className="text-slate-200">
                      <td className="py-4">
                        <div className="font-bold text-white">
                          {item.userName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.userEmail}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono text-[9px] uppercase">
                          {item.role}
                        </span>
                      </td>
                      <td className="py-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <FaIdCard className="text-cyan-400" />
                          <span>{item.docType}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono text-amber-300 font-semibold">
                        {item.docNumber}
                      </td>
                      <td className="py-4 text-slate-400">
                        {item.submittedAt}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : item.status === "pending"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => {
                            setReviewKyc(item);
                            setKycRemarks("");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs ml-auto shadow"
                        >
                          Review KYC
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LOG */}
        {activeTab === "audit-log" && (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Compliance Audit Trail Log
                </h2>
                <p className="text-xs text-slate-400">
                  Immutable event log recording listing moderation decisions,
                  regulatory verifications, and compliance actions.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {store.auditLogs.length} Records
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {store.auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                        {log.action}
                      </span>
                      <span className="font-semibold text-white">
                        {log.actor}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium">{log.target}</p>
                    <p className="text-slate-400 text-[11px]">{log.details}</p>
                  </div>
                  <div className="text-slate-500 font-mono text-[10px] shrink-0">
                    <FaClock className="inline mr-1" />
                    {log.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: AUTOMATED AI DIAGNOSTIC SCAN */}
      {autoCheckProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-cyan-500/40 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <FaRobot className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    AI Automated Compliance Diagnostic
                  </h3>
                  <p className="text-xs text-slate-400">
                    {autoCheckProp.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAutoCheckProp(null);
                  setAutoCheckReport(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {isScanning ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold text-cyan-300 animate-pulse">
                  Scanning RERA Cadastral Registry, Image Watermarks & Valuation
                  Bounds...
                </p>
              </div>
            ) : autoCheckReport ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">
                      Automated Compliance Score
                    </div>
                    <div className="text-2xl font-black text-cyan-400 mt-0.5">
                      {autoCheckReport.overallScore} / 100
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                      {autoCheckReport.passedChecksCount} of{" "}
                      {autoCheckReport.totalChecksCount} Checks Passed
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Ready for Stage 1 Clearance
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {autoCheckReport.checks.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs"
                    >
                      {c.status === "pass" ? (
                        <FaCheckCircle className="text-emerald-400 text-sm mt-0.5 shrink-0" />
                      ) : (
                        <FaExclamationTriangle className="text-amber-400 text-sm mt-0.5 shrink-0" />
                      )}
                      <div>
                        <div className="font-semibold text-white">
                          {c.title}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {c.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="font-semibold text-amber-300">
                    Stage 1 Routing Notice:
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Approving this listing will complete Stage 1 and immediately
                    route it to <strong>Admin Sudhir</strong> to set the Broking
                    % and approve final live publication.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setAutoCheckProp(null);
                      setAutoCheckReport(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAutoApprove}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg"
                  >
                    <FaCheckCircle /> ✓ Auto-Approve & Route to Admin
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MODAL: MANUAL INSPECT LISTING */}
      {reviewProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaSlidersH className="text-cyan-400" />
                  Manual Listing Compliance Moderation (Stage 1)
                </h3>
                <p className="text-xs text-slate-400">{reviewProp.title}</p>
              </div>
              <button
                onClick={() => setReviewProp(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video">
                <img
                  src={
                    reviewProp.images && reviewProp.images[0]
                      ? reviewProp.images[0]
                      : "/src/img/img1.jpg"
                  }
                  alt={reviewProp.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Price:</span>
                  <span className="font-bold text-white">
                    AED {Number(reviewProp.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-200">
                    {reviewProp.location}, {reviewProp.city}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dealer:</span>
                  <span className="text-slate-200">
                    {reviewProp.dealerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dealer License:</span>
                  <span className="font-mono text-amber-300">
                    {reviewProp.dealerLicense}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Watermark Status:</span>
                  <span className="text-emerald-400 font-semibold">
                    Verified Bottom-Right Badge
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Checker Audit Remarks / Instructions
              </label>
              <textarea
                rows={2}
                value={moderationRemarks}
                onChange={(e) => setModerationRemarks(e.target.value)}
                placeholder="e.g., Watermark and RERA NOC verified. Approved for Stage 2 Admin review."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleManualModerationDecision("rejected")}
                className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 font-semibold text-xs"
              >
                Reject Listing
              </button>
              <button
                onClick={() =>
                  handleManualModerationDecision("revision_requested")
                }
                className="px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 font-semibold text-xs"
              >
                Request Revisions
              </button>
              <button
                onClick={() => handleManualModerationDecision("approved")}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg"
              >
                ✓ Approve & Forward to Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW KYC */}
      {reviewKyc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaUserCheck className="text-cyan-400" />
                  Account KYC Verification
                </h3>
                <p className="text-xs text-slate-400">
                  {reviewKyc.userName} ({reviewKyc.role})
                </p>
              </div>
              <button
                onClick={() => setReviewKyc(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-white font-semibold">
                  {reviewKyc.userEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Document Type:</span>
                <span className="text-cyan-300 font-semibold">
                  {reviewKyc.docType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Document Number:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {reviewKyc.docNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold text-white">{reviewKyc.status}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Auditor Assessment Notes
              </label>
              <textarea
                rows={2}
                value={kycRemarks}
                onChange={(e) => setKycRemarks(e.target.value)}
                placeholder="e.g. Identity verified via government database."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => handleKycDecision("rejected")}
                className="px-4 py-2 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/40 text-xs font-semibold"
              >
                Reject KYC
              </button>
              <button
                onClick={() => handleKycDecision("approved")}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow"
              >
                ✓ Approve User Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL PROPERTY DETAILS INSPECTION MODAL */}
      {selectedDetailProp && (
        <PropertyDetailModal
          property={selectedDetailProp}
          role="checker"
          onClose={() => setSelectedDetailProp(null)}
          onModerationApprove={(prop) => {
            appStore.checkerApproveListing(prop.id, {
              checkType: "manual",
              score: 95,
              remarks: "Verified by Navjeet Singh. Forwarded to Admin.",
            });
            confetti({ particleCount: 60, spread: 70 });
            setSelectedDetailProp(null);
          }}
          onModerationReject={(prop) => {
            setReviewProp(prop);
            setModerationRemarks(
              "Listing rejected due to non-compliant documentation."
            );
            setSelectedDetailProp(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
