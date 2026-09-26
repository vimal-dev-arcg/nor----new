import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import Footer from "../../components/Footer";
import PropertyDetailModal from "../../components/PropertyDetailModal";
import { appStore, PERSONAS } from "../../lib/appStore";
import { generateCommissionInvoice } from "../../lib/pdfInvoice";
import { fetchProperties } from "../../data/properties";
import confetti from "canvas-confetti";
import axios from "axios";
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
  FaCrown,
  FaMoneyBillWave,
  FaShieldAlt,
  FaBuilding,
  FaUsers,
  FaCheckCircle,
  FaDownload,
  FaLock,
  FaLockOpen,
  FaExchangeAlt,
  FaFileInvoiceDollar,
  FaChartPie,
  FaChartLine,
  FaSearch,
  FaPlus,
  FaTimes,
  FaBan,
  FaUserCheck,
  FaCoins,
  FaServer,
  FaHdd,
  FaCogs,
  FaNetworkWired,
  FaEye,
  FaSlidersH,
  FaRobot,
  FaPercent,
  FaCheckDouble,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [store, setStore] = useState(appStore.getState());
  const currentUser = PERSONAS.super_admin;

  // Active Tab: 'approval-broking' | 'telemetry' | 'escrow-ledger' | 'listings' | 'governance'
  const [activeTab, setActiveTab] = useState("approval-broking");

  // Property Inspector Modal
  const [selectedDetailProp, setSelectedDetailProp] = useState(null);
  const [pendingAdminListings, setPendingAdminListings] = useState([]);

  const [liveListings, setLiveListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Stage 2 Approval & Broking Modal
  const [approvalModalProp, setApprovalModalProp] = useState(null);
  const [brokingPct, setBrokingPct] = useState(5.0);
  const [adminSharePct, setAdminSharePct] = useState(2.0);
  const [dealerSharePct, setDealerSharePct] = useState(2.0);
  const [checkerSharePct, setCheckerSharePct] = useState(1.0);
  const [adminRemarks, setAdminRemarks] = useState("");

  // AI Auto-Check Modal for Admin
  const [autoCheckProp, setAutoCheckProp] = useState(null);
  const [autoCheckReport, setAutoCheckReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Sell Modal / Finalize Deal Engine
  const [sellModalProperty, setSellModalProperty] = useState(null);
  const [agreedSalePrice, setAgreedSalePrice] = useState("");
  const [buyerName, setBuyerName] = useState("Private Sovereign Wealth Client");
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [saleResultTx, setSaleResultTx] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Graph timeframe toggle
  const [chartMetric, setChartMetric] = useState("revenue"); // 'revenue' | 'volume' | 'distribution'

  // const liveListings = store.properties.filter(
  //   (p) =>
  //     p.moderationStatus === "approved" &&
  //     p.checkerApproved &&
  //     p.adminApproved &&
  //     p.status === "Available" // Ensure this matches the backend query
  // );

  function resolveImgSrc(img) {
    if (!img) return "/src/img/img1.jpg";
    if (typeof img === "string" && img.startsWith("/uploads")) {
      return "/src/img/img1.jpg";
    }
    return img;
  }

  useEffect(() => {
    async function fetchLiveListings() {
      try {
        setLoading(true);
        const response = await axios.get("/api/properties", {
          params: { status: "Available" },
        });
  
        if (response.status === 200) {
          setLiveListings(response.data);
        } else {
          throw new Error(`Failed to fetch live listings: ${response.status}`);
        }
      } catch (err) {
        console.error("Failed to fetch live listings:", err);
        setError("Failed to load live listings.");
      } finally {
        setLoading(false);
      }
    }
  
    fetchLiveListings();
  }, []);

  // Fetch data for dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const [liveResponse, allPropertiesResponse] = await Promise.all([
          fetch("/api/properties?status=Available&moderationStatus=approved"),
          fetch("/api/properties"),
        ]);
  
        if (!liveResponse.ok || !allPropertiesResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
  
        const liveData = await liveResponse.json();
        const allData = await allPropertiesResponse.json();
  
        const pending = allData.filter(
          (p) =>
            p.moderationStatus === "pending_admin" ||
            (p.checkerApproved === true && p.adminApproved !== true)
        );
  
        setLiveListings(liveData);
        setPendingAdminListings(pending);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
  
    loadDashboardData();
  }, []);

  useEffect(() => {
    async function loadPendingAdminListings() {
      try {
        const response = await fetch(
          "/api/properties?moderationStatus=pending_admin"
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch pending admin listings: ${response.status}`);
        }
        const data = await response.json();
        setPendingAdminListings(data);
      } catch (error) {
        console.error("Failed to fetch pending admin listings:", error.message);
      }
    }
  
    loadPendingAdminListings();
  }, []);

  // Filter 2-stage approval queues
  const filteredPendingAdminListings = store.properties.filter(
    (p) =>
      p.moderationStatus === "pending_admin" ||
      (p.checkerApproved && !p.adminApproved)
  );

  const pendingCheckerListings = store.properties.filter(
    (p) =>
      p.moderationStatus === "pending_checker" ||
      p.moderationStatus === "pending_review" ||
      (!p.checkerApproved && p.moderationStatus !== "approved")
  );

  // System Matrix Calculations
  const gmv = useMemo(() => {
    return store.escrowLedger.reduce(
      (acc, t) => acc + Number(t.salePrice || 0),
      0
    );
  }, [store.escrowLedger]);

  const totalFeeCollected = useMemo(() => {
    return store.escrowLedger.reduce(
      (acc, t) => acc + Number(t.totalPlatformFee || 0),
      0
    );
  }, [store.escrowLedger]);

  const adminRevenue2Pct = useMemo(() => {
    return store.escrowLedger.reduce(
      (acc, t) => acc + Number(t.adminCut || 0),
      0
    );
  }, [store.escrowLedger]);

  const dealerPayouts2Pct = useMemo(() => {
    return store.escrowLedger.reduce(
      (acc, t) => acc + Number(t.dealerCut || 0),
      0
    );
  }, [store.escrowLedger]);

  const refreshDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const [liveResponse, allProperties] = await Promise.all([
        axios.get("/api/properties", {
          params: { status: "Available" },
        }),
        fetchProperties(),
      ]);

      const liveData = Array.isArray(liveResponse.data)
        ? liveResponse.data
        : liveResponse.data?.properties || [];

      const allData = Array.isArray(allProperties)
        ? allProperties
        : allProperties?.properties || [];

      const pending = allData.filter(
        (p) =>
          p.moderationStatus === "pending_admin" ||
          (p.checkerApproved === true && p.adminApproved !== true)
      );

      setLiveListings(liveData);
      setPendingAdminListings(pending);
    } catch (err) {
      console.error("Failed to refresh dashboard:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to refresh dashboard."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Open Stage 2 Broking & Approval Modal
  const handleOpenApprovalModal = (prop) => {
    setApprovalModalProp(prop);
    const existingBroking = prop.brokingPercentage || 5.0;
    const existingAdmin = prop.adminPlatformPct || 2.0;
    const existingDealer = prop.dealerCommissionPct || 2.0;
    const existingChecker = prop.checkerEscrowPct || 1.0;
  
    setBrokingPct(existingBroking);
    setAdminSharePct(existingAdmin);
    setDealerSharePct(existingDealer);
    setCheckerSharePct(existingChecker);
    setAdminRemarks(
      `Approved for live listing at ${existingBroking}% broking commission.`
    );
  };

  // Trigger Admin AI Auto-Check
  const handleAdminStartAutoCheck = (prop) => {
    setAutoCheckProp(prop);
    setIsScanning(true);
    setAutoCheckReport(null);

    setTimeout(() => {
      const report = appStore.runAutomatedListingCheck(prop);
      setAutoCheckReport(report);
      setIsScanning(false);
    }, 600);
  };

  // Submit Admin Approval (Live Immediately!)
  async function handleAdminConfirmApproval(e) {
    if (e) e.preventDefault();
    if (!approvalModalProp) return;
  
    try {
      const response = await fetch(
        `/api/properties/${approvalModalProp.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brokingPercentage: Number(brokingPct),
            adminPlatformPct: Number(adminSharePct),
            dealerCommissionPct: Number(dealerSharePct),
            checkerEscrowPct: Number(checkerSharePct),
            remarks:
              adminRemarks ||
              `Commercial terms cleared by Super Admin at ${brokingPct}% broking.`,
          }),
        }
      );
  
      if (response.ok) {
        const updatedProperty = await response.json();
        console.log("Property approved:", updatedProperty);
        confetti({ particleCount: 70, spread: 80 });
        setApprovalModalProp(null);
        refreshDashboardData(); // Refresh the dashboard to reflect the changes
      } else {
        console.error("Failed to approve property:", response.statusText);
      }
    } catch (error) {
      console.error("Error approving property:", error.message);
    }
  }

  // Auto-Approve from AI Scan
  const handleAdminAutoApproveFromScan = () => {
    if (!autoCheckProp) return;

    appStore.adminApproveListing(autoCheckProp.id, {
      brokingPercentage: Number(autoCheckProp.brokingPercentage || 5.0),
      adminPlatformPct: 2.0,
      dealerCommissionPct: 2.0,
      checkerEscrowPct: 1.0,
      remarks: `Automated commercial clearance passed (${
        autoCheckReport?.overallScore || 96
      }/100). Live published.`,
      checkType: "auto",
    });

    confetti({ particleCount: 80, spread: 90 });
    setAutoCheckProp(null);
    setAutoCheckReport(null);
  };

  // Monthly Chart Mock Data (Jan - Aug 2026)
  const monthlyData = [
    {
      month: "Jan",
      gmvM: 4.5,
      totalFeeK: 225,
      adminK: 90,
      dealerK: 90,
      checkerK: 45,
      txCount: 2,
    },
    {
      month: "Feb",
      gmvM: 12.45,
      totalFeeK: 622.5,
      adminK: 249,
      dealerK: 249,
      checkerK: 124.5,
      txCount: 4,
    },
    {
      month: "Mar",
      gmvM: 8.2,
      totalFeeK: 410,
      adminK: 164,
      dealerK: 164,
      checkerK: 82,
      txCount: 3,
    },
    {
      month: "Apr",
      gmvM: 15.6,
      totalFeeK: 780,
      adminK: 312,
      dealerK: 312,
      checkerK: 156,
      txCount: 5,
    },
    {
      month: "May",
      gmvM: 19.8,
      totalFeeK: 990,
      adminK: 396,
      dealerK: 396,
      checkerK: 198,
      txCount: 6,
    },
    {
      month: "Jun",
      gmvM: 24.1,
      totalFeeK: 1205,
      adminK: 482,
      dealerK: 482,
      checkerK: 241,
      txCount: 7,
    },
    {
      month: "Jul",
      gmvM: 28.5,
      totalFeeK: 1425,
      adminK: 570,
      dealerK: 570,
      checkerK: 285,
      txCount: 8,
    },
    {
      month: "Aug",
      gmvM: 34.2,
      totalFeeK: 1710,
      adminK: 684,
      dealerK: 684,
      checkerK: 342,
      txCount: 11,
    },
  ];

  // Finalize Sale Transaction
  const handleFinalizeSale = (e) => {
    e.preventDefault();
    if (!sellModalProperty) return;

    setIsProcessingSale(true);
    setErrorMessage("");

    try {
      const tx = appStore.markPropertySold({
        propertyId: sellModalProperty.id,
        salePrice: Number(agreedSalePrice || sellModalProperty.price),
        buyerName,
        dealerId: sellModalProperty.dealerId,
        currency: "AED",
      });

      confetti({ particleCount: 80, spread: 90 });
      setSaleResultTx(tx);
      setIsProcessingSale(false);
    } catch (err) {
      setErrorMessage(
        err.message || "Failed to execute transactional transition"
      );
      setIsProcessingSale(false);
    }
  };

  // Settle Escrow Payout
  const handleSettlePayout = (txId) => {
    appStore.settleEscrowPayout(txId);
    confetti({ particleCount: 40, spread: 60 });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AdminHeader />

      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* System Node & Infrastructure Maintenance Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#b3975b] to-amber-600 p-0.5 shadow-lg shrink-0">
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
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <FaCrown className="text-[10px]" /> Super Admin & Commercial
                    Approval Authority
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>
                    Cluster:{" "}
                    <span className="font-mono text-emerald-400 font-semibold">
                      prod-dxb-node-01
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    Broking Policy:{" "}
                    <span className="font-mono text-amber-300">
                      Admin Configurable
                    </span>
                  </span>
                  <span>•</span>
                  <span>
                    Two-Stage Pipeline:{" "}
                    <span className="text-emerald-400 font-semibold">
                      Enforced (Checker → Admin → Live)
                    </span>
                  </span>
                </p>
              </div>
            </div>

            {/* Platform Master Volume Stats */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Pending Stage 2 Approval
                </div>
                <div className="text-lg font-bold text-amber-400">
                  {filteredPendingAdminListings.length} Awaiting
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-right">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Live Properties
                </div>
                <div className="text-lg font-bold text-emerald-400">
                  {liveListings.length} Active
                </div>
              </div>

              <Link
                to="/admin/properties"
                className="px-4 py-2.5 rounded-2xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg transition"
              >
                <FaPlus /> Add Property
              </Link>
            </div>
          </div>

          {/* TWO-STEP MANDATORY PIPELINE BANNER */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <FaCheckDouble className="text-amber-400" />
              <span>Two-Stage Mandatory Approval Pipeline Workflow:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <div className="font-bold text-cyan-300">
                    Stage 1: Checker Compliance
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Navjeet Singh audits RERA permits, title deeds & watermark.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <div className="font-bold text-amber-300">
                    Stage 2: Admin Broking & Commercials
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Admin Sudhir sets <strong>Broking % (e.g. 5%)</strong> &
                    clears listing to go live.
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <div className="font-bold text-emerald-300">
                    Stage 3: Live on Marketplace
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Both approved → property is live and ready for buyer
                    inquiries & escrow purchase.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab("approval-broking")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "approval-broking"
                  ? "bg-[#b3975b] text-slate-950 font-bold shadow-lg shadow-[#b3975b]/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaPercent /> Stage 2 Broking & Approvals (
              {pendingAdminListings.length})
            </button>

            <button
              onClick={() => setActiveTab("telemetry")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "telemetry"
                  ? "bg-[#b3975b] text-slate-950 font-bold shadow-lg shadow-[#b3975b]/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaChartLine /> Telemetry & Revenue Graphs
            </button>

            <button
              onClick={() => setActiveTab("escrow-ledger")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "escrow-ledger"
                  ? "bg-[#b3975b] text-slate-950 font-bold shadow-lg shadow-[#b3975b]/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaFileInvoiceDollar /> Escrow Ledger & Vault (
              {store.escrowLedger.length})
            </button>

            <button
              onClick={() => setActiveTab("listings")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "listings"
                  ? "bg-[#b3975b] text-slate-950 font-bold shadow-lg shadow-[#b3975b]/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaBuilding /> Master Catalog & Deal Finalizer (
              {store.properties.length})
            </button>

            <button
              onClick={() => setActiveTab("governance")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "governance"
                  ? "bg-[#b3975b] text-slate-950 font-bold shadow-lg shadow-[#b3975b]/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaUsers /> Node Identity Governance
            </button>
          </div>
        </div>

        <div></div>
        {/* TAB 0: STAGE 2 BROKING & APPROVALS CONSOLE */}
        {activeTab === "approval-broking" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Stage 2: Admin Commercial Approval & Broking % Configuration
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect listings passed by Compliance Checker Navjeet Singh.
                  Configure the total Broking Percentage (e.g. 5%) and publish
                  live to marketplace.
                </p>
              </div>
              <span className="text-xs text-amber-300 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20 font-semibold">
                {pendingAdminListings.length} Listings Awaiting Admin Broking
                Setup
              </span>
            </div>

            {/* QUEUE OF PROPERTIES AWAITING ADMIN APPROVAL */}
            {pendingAdminListings.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <FaCheckCircle className="text-emerald-400 text-4xl mx-auto" />
                <h3 className="text-lg font-bold text-white">
                  Stage 2 Admin Approval Queue Clear!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  All properties cleared by Compliance Checker have been
                  configured with Broking % by Admin Sudhir and are currently
                  active on the live marketplace.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingAdminListings.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-slate-900 rounded-3xl border border-amber-500/40 overflow-hidden flex flex-col justify-between shadow-2xl group hover:border-[#b3975b] transition"
                  >
                    <div
                      onClick={() => setSelectedDetailProp(prop)}
                      className="relative h-48 w-full bg-slate-800 cursor-pointer overflow-hidden"
                    >
                      <img
  src={
    prop.images && prop.images[0]
      ? resolveImgSrc(prop.images[0]) // Use resolveImgSrc to handle the image URL
      : "/src/img/img1.jpg" // Default image
  }
  alt={prop.title}
  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
/>
                      <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow">
                        Stage 2: Awaiting Admin Broking %
                      </div>
                      <div className="absolute top-3 right-3 bg-emerald-950/90 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                        ✓ Checker Passed
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-xs text-[#b3975b] font-medium">
                          {prop.location}, {prop.city}
                        </div>
                        <h3
                          onClick={() => setSelectedDetailProp(prop)}
                          className="text-base font-bold text-white mt-0.5 hover:text-[#b3975b] cursor-pointer transition line-clamp-1"
                        >
                          {prop.title}
                        </h3>
                        <div className="text-lg font-extrabold text-emerald-400 mt-1">
                          {prop.displayPrice ||
                            `AED ${Number(prop.price).toLocaleString()}`}
                        </div>
                      </div>

                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-400">
                        <div className="flex justify-between">
                          <span>Checker Verification:</span>
                          <span className="text-emerald-400 font-semibold">
                            Passed ({prop.checkerCheckType || "auto"})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Submitting Dealer:</span>
                          <span className="font-semibold text-white">
                            {prop.dealerName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Proposed Broking %:</span>
                          <span className="font-mono text-amber-300 font-bold">
                            {prop.brokingPercentage || 5.0}% (Configurable)
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons: Auto-Check and Manual Broking Setup */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAdminStartAutoCheck(prop)}
                          className="py-2.5 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-blue-500/30"
                          title="Run automated market sanity check"
                        >
                          <FaRobot className="text-sm" /> Auto-Check
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenApprovalModal(prop)}
                          className="py-2.5 px-3 rounded-xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-lg"
                          title="Set broking % and approve to go live"
                        >
                          <FaSlidersH /> Set Broking & Go Live
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LIVE ACTIVE LISTINGS OVERVIEW */}
            <div className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-400" />
                    Live & Active Marketplace Listings ({liveListings.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Both Stage 1 (Checker) and Stage 2 (Admin) completed.
                    Broking percentages enforced.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">ID</th>
                      <th className="pb-3 font-semibold">Property Title</th>
                      <th className="pb-3 font-semibold">Listing Price</th>
                      <th className="pb-3 font-semibold text-[#b3975b]">
                        Broking %
                      </th>
                      <th className="pb-3 font-semibold">Admin Split</th>
                      <th className="pb-3 font-semibold">Dealer Split</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {liveListings.map((prop) => (
                      <tr
                        key={prop.id}
                        className="text-slate-200 hover:bg-slate-800/30 transition"
                      >
                        <td className="py-4 font-mono text-slate-400">
                          #{prop.id}
                        </td>
                        <td
                          onClick={() => setSelectedDetailProp(prop)}
                          className="py-4 font-bold text-white hover:text-[#b3975b] cursor-pointer"
                        >
                          {prop.title}
                          <div className="text-[11px] text-slate-400 font-normal">
                            {prop.location}
                          </div>
                        </td>
                        <td className="py-4 font-bold text-emerald-400">
                          {prop.displayPrice ||
                            `AED ${Number(prop.price).toLocaleString()}`}
                        </td>
                        <td className="py-4">
                          <button
                            onClick={() => handleOpenApprovalModal(prop)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30 hover:bg-amber-500/30 transition"
                            title="Click to adjust broking percentage"
                          >
                            {prop.brokingPercentage || 5.0}% Broking ✎
                          </button>
                        </td>
                        <td className="py-4 text-[#b3975b] font-semibold">
                          {prop.adminPlatformPct || 2.0}%
                        </td>
                        <td className="py-4 text-slate-300 font-semibold">
                          {prop.dealerCommissionPct || 2.0}%
                        </td>
                        <td className="py-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            {prop.status} (LIVE)
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailProp(prop)}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800 hover:bg-[#b3975b] hover:text-slate-950 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                          >
                            <FaEye />
                            View
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

        {/* TAB 1: SYSTEM TELEMETRY & REVENUE GRAPHS */}
        {activeTab === "telemetry" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* KPI Matrix Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Platform Master GMV
                  </span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-[#b3975b]">
                    <FaCrown />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mt-2">
                  AED {gmv.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <span>●</span> {store.escrowLedger.length} Executed
                  Transactions
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Gross Broking Platform Fee
                  </span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <FaCoins />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-400 mt-2">
                  AED {totalFeeCollected.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Dynamic Broking Commission Engine
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Super Admin Tech Yield
                  </span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <FaServer />
                  </div>
                </div>
                <div className="text-2xl font-bold text-[#b3975b] mt-2">
                  AED {adminRevenue2Pct.toLocaleString()}
                </div>
                <div className="text-xs text-purple-300 mt-1">
                  Platform Core Infrastructure
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Dealer Brokerage Disbursed
                  </span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <FaBuilding />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-400 mt-2">
                  AED {dealerPayouts2Pct.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Partner Broker Commission
                </div>
              </div>
            </div>

            {/* REVENUE, VOLUME & COMMISSION DISTRIBUTION WIDGET */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <FaChartLine className="text-[#b3975b]" />
                    Platform Performance, Volumes & Commission Distribution
                    (2026)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Interactive Recharts analytics covering revenue velocity,
                    closed deed transaction volumes, and commission split
                    distribution.
                  </p>
                </div>

                <div className="flex flex-wrap bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setChartMetric("revenue")}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                      chartMetric === "revenue"
                        ? "bg-[#b3975b] text-slate-950 font-bold shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Revenue Trends (AED)
                  </button>
                  <button
                    onClick={() => setChartMetric("volume")}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                      chartMetric === "volume"
                        ? "bg-[#b3975b] text-slate-950 font-bold shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Transaction Volumes
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/90 rounded-2xl p-6 border border-slate-800/80 space-y-6">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartMetric === "revenue" ? (
                      <AreaChart
                        data={monthlyData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="adminGold"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#b3975b"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#b3975b"
                              stopOpacity={0.05}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={11}
                          tickLine={false}
                          tickFormatter={(v) => `${v}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0f172a",
                            borderColor: "#b3975b",
                            borderRadius: "1rem",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="totalFeeK"
                          name="Gross Platform Yield"
                          stroke="#b3975b"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#adminGold)"
                        />
                      </AreaChart>
                    ) : (
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                        />
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
                          }}
                        />
                        <Bar
                          dataKey="gmvM"
                          name="Total Volume (GMV)"
                          fill="#b3975b"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar
                          dataKey="txCount"
                          name="Deals Finalized"
                          fill="#38bdf8"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ESCROW LEDGER */}
        {activeTab === "escrow-ledger" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Master Escrow Settlement & VAT Invoicing Ledger
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time view of all commission splits, transaction locks,
                  and PDF tax invoice generation.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Invoice & Lock ID</th>
                    <th className="pb-3 font-semibold">Property</th>
                    <th className="pb-3 font-semibold">Sale Price</th>
                    <th className="pb-3 font-semibold">Broking Fee</th>
                    <th className="pb-3 font-semibold text-[#b3975b]">
                      Admin Cut
                    </th>
                    <th className="pb-3 font-semibold text-emerald-400">
                      Dealer Cut
                    </th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {store.escrowLedger.map((tx) => (
                    <tr key={tx.id} className="text-slate-200">
                      <td className="py-4">
                        <div className="font-bold text-white font-mono">
                          {tx.invoiceNumber}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {tx.txLockId}
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-white max-w-xs truncate">
                        {tx.propertyTitle}
                      </td>
                      <td className="py-4 font-bold text-white">
                        AED {Number(tx.salePrice).toLocaleString()}
                      </td>
                      <td className="py-4 font-bold text-slate-300">
                        AED {Number(tx.totalPlatformFee).toLocaleString()} (
                        {tx.brokingPercentage || 5}%)
                      </td>
                      <td className="py-4 font-bold text-[#b3975b]">
                        AED {Number(tx.adminCut).toLocaleString()}
                      </td>
                      <td className="py-4 font-bold text-emerald-400">
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
                      <td className="py-4 text-right space-x-2">
                        {tx.status === "PENDING_ESCROW" && (
                          <button
                            onClick={() => handleSettlePayout(tx.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow"
                          >
                            Settle
                          </button>
                        )}
                        <button
                          onClick={() =>
                            generateCommissionInvoice(tx, "PLATFORM")
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold inline-flex items-center gap-1 shadow"
                        >
                          <FaDownload className="text-[#b3975b]" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: MASTER CATALOG & DEAL FINALIZER */}
        {activeTab === "listings" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Master Listing Catalog & Transaction Finalizer
                </h2>
                <p className="text-xs text-slate-400">
                  Select any active property deed to execute transaction closure
                  (transition to SOLD) and calculate atomic splits.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search master catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:ring-2 focus:ring-[#b3975b]"
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-slate-500 text-xs" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">ID & Property</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Price</th>
                    <th className="pb-3 font-semibold">Broking %</th>
                    <th className="pb-3 font-semibold">State</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {store.properties
                    .filter((p) =>
                      searchQuery
                        ? p.title
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((prop) => (
                      <tr key={prop.id} className="text-slate-200">
                        <td className="py-4 font-bold text-white">
                          #{prop.id} - {prop.title}
                        </td>
                        <td className="py-4 text-slate-300">
                          {prop.location}, {prop.city}
                        </td>
                        <td className="py-4 font-bold text-emerald-400">
                          {prop.displayPrice ||
                            `AED ${Number(prop.price).toLocaleString()}`}
                        </td>
                        <td className="py-4 font-mono text-amber-300 font-bold">
                          {prop.brokingPercentage || 5.0}%
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              prop.status === "SOLD"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            }`}
                          >
                            {prop.status}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedDetailProp(prop)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1 border border-slate-700 transition"
                          >
                            <FaEye className="text-[#b3975b]" /> Inspect
                          </button>

                          {prop.status !== "SOLD" ? (
                            <button
                              onClick={() => {
                                setSellModalProperty(prop);
                                setAgreedSalePrice(prop.price);
                                setSaleResultTx(null);
                                setErrorMessage("");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-bold text-xs inline-flex items-center gap-1 shadow"
                            >
                              <FaMoneyBillWave /> Finalize Sale
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Sold ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: GOVERNANCE */}
        {activeTab === "governance" && (
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Node Identity Governance & Security Policies
              </h2>
              <p className="text-xs text-slate-400">
                Manage platform role access, review KYC overrides, and enforce
                security policies across cluster nodes.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">User Identity Node</th>
                    <th className="pb-3 font-semibold">Authorization Tier</th>
                    <th className="pb-3 font-semibold">KYC Verification</th>
                    <th className="pb-3 font-semibold">License / Ref Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {Object.entries(PERSONAS).map(([roleKey, user]) => (
                    <tr key={roleKey} className="text-slate-200">
                      <td className="py-4 flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="font-bold text-white">
                            {user.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 font-mono text-[10px] font-bold uppercase">
                          {user.roleTitle}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                          Verified & Active
                        </span>
                      </td>
                      <td className="py-4 font-mono text-slate-300">
                        {user.licenseNumber ||
                          user.referralCode ||
                          "SYSTEM_ROOT"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADMIN CONFIGURE BROKING % & APPROVE TO GO LIVE */}
      {approvalModalProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-[#b3975b] max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#b3975b] flex items-center justify-center">
                  <FaSlidersH className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Configure Broking % & Approve Listing (Stage 2)
                  </h3>
                  <p className="text-xs text-slate-400">
                    {approvalModalProp.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovalModalProp(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleAdminConfirmApproval}
              className="space-y-4 text-xs"
            >
              {/* Property Summary */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                  <div className="text-slate-400">Listing Price:</div>
                  <div className="text-lg font-black text-emerald-400 mt-0.5">
                    {prop.displayPrice ||
                      `AED ${Number(prop.price).toLocaleString()}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">Checker Status:</div>
                  <div className="text-emerald-400 font-semibold mt-0.5">
                    ✓ Stage 1 Passed
                  </div>
                </div>
              </div>

              {/* Broking Percentage Slider & Input */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                    Total Broking Commission (%):
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="20"
                      value={brokingPct}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setBrokingPct(val);
                        setAdminSharePct(Number((val * 0.4).toFixed(2)));
                        setDealerSharePct(Number((val * 0.4).toFixed(2)));
                        setCheckerSharePct(Number((val * 0.2).toFixed(2)));
                      }}
                      className="w-20 bg-slate-900 border border-amber-500 rounded-lg px-2 py-1 text-right font-mono font-bold text-amber-300"
                    />
                    <span className="font-bold text-amber-300">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={brokingPct}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setBrokingPct(val);
                    setAdminSharePct(Number((val * 0.4).toFixed(2)));
                    setDealerSharePct(Number((val * 0.4).toFixed(2)));
                    setCheckerSharePct(Number((val * 0.2).toFixed(2)));
                  }}
                  className="w-full accent-[#b3975b] cursor-pointer"
                />

                {/* Sub-split breakdown */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400">Admin Cut:</span>
                    <div className="font-bold text-[#b3975b]">
                      {adminSharePct}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Dealer Cut:</span>
                    <div className="font-bold text-emerald-400">
                      {dealerSharePct}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Checker/Escrow:</span>
                    <div className="font-bold text-purple-400">
                      {checkerSharePct}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Monetary Yield Preview */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  Live Monetary Breakdown on Deal Closure:
                </div>
                <div className="flex justify-between font-bold text-white">
                  <span>Gross Broking Fee ({brokingPct}%):</span>
                  <span className="text-amber-400 font-mono">
                    AED{" "}
                    {(
                      (Number(approvalModalProp.price) * Number(brokingPct)) /
                      100
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>
                    • Net to Property Seller (
                    {(100 - Number(brokingPct)).toFixed(1)}%):
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">
                    AED{" "}
                    {(
                      (Number(approvalModalProp.price) *
                        (100 - Number(brokingPct))) /
                      100
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>• Admin Platform Revenue ({adminSharePct}%):</span>
                  <span className="text-[#b3975b] font-mono">
                    AED{" "}
                    {(
                      (Number(approvalModalProp.price) *
                        Number(adminSharePct)) /
                      100
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>• Dealer Commission ({dealerSharePct}%):</span>
                  <span className="text-blue-300 font-mono">
                    AED{" "}
                    {(
                      (Number(approvalModalProp.price) *
                        Number(dealerSharePct)) /
                      100
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Super Admin Approval Remarks
                </label>
                <textarea
                  rows={2}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#b3975b]"
                  placeholder="e.g. Broking terms confirmed. Approved to go live on public catalog."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setApprovalModalProp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-extrabold shadow-lg flex items-center gap-1.5"
                >
                  <FaCheckCircle /> ✓ Confirm Broking % & Approve to Go Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADMIN AI AUTO-CHECK SCAN */}
      {autoCheckProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-blue-500/40 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FaRobot className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Admin AI Commercial Diagnostic
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
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold text-blue-300 animate-pulse">
                  Executing Automated Market Valuation & Commercial Viability
                  Scan...
                </p>
              </div>
            ) : autoCheckReport ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-slate-400">Commercial Score</div>
                    <div className="text-2xl font-black text-blue-400 mt-0.5">
                      {autoCheckReport.overallScore} / 100
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      {autoCheckReport.passedChecksCount} /{" "}
                      {autoCheckReport.totalChecksCount} Checks Passed
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Recommended Broking: 5.0%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {autoCheckReport.checks.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3"
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

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setAutoCheckProp(null);
                      setAutoCheckReport(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdminAutoApproveFromScan}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold shadow-lg"
                  >
                    ✓ Auto-Approve & Publish Live (5% Broking)
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MODAL: MARK PROPERTY SOLD */}
      {sellModalProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaMoneyBillWave className="text-[#b3975b]" />
                  Finalize Property Sale & Escrow Settlement
                </h3>
                <p className="text-xs text-slate-400">
                  {sellModalProperty.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setSellModalProperty(null);
                  setSaleResultTx(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {saleResultTx ? (
              <div className="space-y-4 text-xs">
                <div className="p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <FaCheckCircle className="text-base" /> Sale Successfully
                    Executed & Locked!
                  </div>
                  <div className="space-y-1 text-slate-200">
                    <p>
                      Invoice Number:{" "}
                      <span className="font-mono font-bold text-white">
                        {saleResultTx.invoiceNumber}
                      </span>
                    </p>
                    <p>
                      DB Concurrency Lock ID:{" "}
                      <span className="font-mono text-amber-300 font-bold">
                        {saleResultTx.txLockId}
                      </span>
                    </p>
                    <p>
                      Final Sale Price:{" "}
                      <span className="font-bold text-white">
                        AED {Number(saleResultTx.salePrice).toLocaleString()}
                      </span>
                    </p>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>
                        Total Broking Fee Settled (
                        {saleResultTx.brokingPercentage || 5}%):
                      </span>
                      <span>
                        AED{" "}
                        {Number(saleResultTx.totalPlatformFee).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#b3975b]">
                      <span>• Super Admin (Sudhir):</span>
                      <span>
                        AED {Number(saleResultTx.adminCut).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>• Property Dealer:</span>
                      <span>
                        AED {Number(saleResultTx.dealerCut).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() =>
                      generateCommissionInvoice(saleResultTx, "PLATFORM")
                    }
                    className="px-4 py-2.5 rounded-xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <FaDownload /> Download Official PDF Invoice
                  </button>
                  <button
                    onClick={() => {
                      setSellModalProperty(null);
                      setSaleResultTx(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFinalizeSale} className="space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Agreed Final Sale Price (AED)
                  </label>
                  <input
                    type="number"
                    required
                    value={agreedSalePrice}
                    onChange={(e) => setAgreedSalePrice(e.target.value)}
                    placeholder="e.g. 9800000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-[#b3975b] font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Buyer / Acquiring Entity Name
                  </label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Sheikh Ahmed Al Thani"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:ring-2 focus:ring-[#b3975b]"
                  />
                </div>

                {agreedSalePrice > 0 && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      Settlement Calculation Preview (
                      {sellModalProperty.brokingPercentage || 5}% Broking)
                    </div>
                    <div className="flex justify-between font-bold text-white">
                      <span>Total Platform Fee:</span>
                      <span className="text-[#b3975b]">
                        AED{" "}
                        {(
                          (Number(agreedSalePrice) *
                            (sellModalProperty.brokingPercentage || 5)) /
                          100
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSellModalProperty(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingSale}
                    className="px-5 py-2 rounded-xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-bold shadow-lg disabled:opacity-50"
                  >
                    {isProcessingSale
                      ? "Processing Sale..."
                      : "Confirm & Finalize Sale"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FULL PROPERTY DETAIL INSPECTION MODAL */}
      {selectedDetailProp && (
        <PropertyDetailModal
          property={selectedDetailProp}
          role="admin"
          onClose={() => setSelectedDetailProp(null)}
          onEdit={(prop) => {
            setSelectedDetailProp(null);
            navigate(`/admin/properties?id=${prop.id || prop._id}`);
          }}
          onStatusChange={(propId, newStatus) => {
            appStore.updatePropertyStatus(propId, newStatus);
            setSelectedDetailProp((prev) =>
              prev ? { ...prev, status: newStatus } : null
            );
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
