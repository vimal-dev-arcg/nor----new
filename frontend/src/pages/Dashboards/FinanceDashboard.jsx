import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { appStore, PERSONAS } from "../../lib/appStore";
import { generateCommissionInvoice } from "../../lib/pdfInvoice";
import { clearToken } from "../../lib/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
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
  FaWallet,
  FaMoneyCheckAlt,
  FaFileInvoiceDollar,
  FaExchangeAlt,
  FaDownload,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaLock,
  FaLockOpen,
  FaBuilding,
  FaUsers,
  FaChartLine,
  FaChartPie,
  FaSignOutAlt,
  FaCoins,
  FaHandHoldingUsd,
  FaShieldAlt,
  FaEye,
  FaFileCsv,
  FaPrint,
  FaReceipt,
  FaUserShield,
  FaKey,
  FaCheckDouble,
  FaCertificate,
  FaBalanceScale,
  FaInfoCircle,
} from "react-icons/fa";

export default function FinanceDashboard() {
  const [store, setStore] = useState(appStore.getState());
  const currentUser = PERSONAS.finance || {
    name: "Ananya Roy",
    roleTitle: "Chief Escrow & Financial Comptroller",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  };
  const navigate = useNavigate();

  // Active Tab: 'master-ledger' | 'role-breakdown' | 'buyer-escrow' | 'seller-payouts' | 'commissions' | 'analytics'
  const [activeTab, setActiveTab] = useState("master-ledger");

  // Role Ledger Filter: 'ALL' | 'super_admin' | 'dealer' | 'checker' | 'buyer' | 'seller'
  const [roleFilter, setRoleFilter] = useState("ALL");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'SETTLED' | 'PENDING_ESCROW'
  const [typeFilter, setTypeFilter] = useState("ALL"); // 'ALL' | 'COMMISSION_SPLIT' | 'HOLDING_DEPOSIT'

  // Selected Transaction for Detail Modal
  const [selectedTx, setSelectedTx] = useState(null);

  // Settlement Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const unsub = appStore.subscribe((state) => setStore(state));
    return unsub;
  }, []);

  const summary = useMemo(() => {
    return appStore.getFinancialSummary();
  }, [store.escrowLedger]);

  // Filtered Transactions
  const filteredLedger = useMemo(() => {
    return (store.escrowLedger || []).filter((tx) => {
      const matchSearch =
        searchQuery === "" ||
        tx.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.txHash?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.txLockId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.sellerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.dealerName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "ALL" || tx.status === statusFilter;
      const matchType = typeFilter === "ALL" || (tx.type || "COMMISSION_SPLIT") === typeFilter;

      // Role Filter Check
      let matchRole = true;
      if (roleFilter === "super_admin") {
        matchRole = Number(tx.adminCut || 0) > 0;
      } else if (roleFilter === "dealer") {
        matchRole = Number(tx.dealerCut || 0) > 0;
      } else if (roleFilter === "checker") {
        matchRole = Number(tx.checkerCut || 0) > 0;
      } else if (roleFilter === "buyer") {
        matchRole = Boolean(tx.buyerDeposit || tx.buyerName);
      } else if (roleFilter === "seller") {
        matchRole = Boolean(tx.sellerNetPayout || tx.sellerName);
      }

      return matchSearch && matchStatus && matchType && matchRole;
    });
  }, [store.escrowLedger, searchQuery, statusFilter, typeFilter, roleFilter]);

  // Buyer Deposits Data
  const buyerDeposits = useMemo(() => {
    return (store.escrowLedger || []).map((tx) => ({
      id: tx.id,
      invoiceNumber: tx.invoiceNumber,
      txLockId: tx.txLockId || `LOCK-BYR-${tx.id}`,
      buyerName: tx.buyerName || "VIP Investor",
      buyerEmail: tx.buyerEmail || "investor@gulfassets.com",
      propertyTitle: tx.propertyTitle,
      propertyLocation: tx.propertyLocation,
      depositAmount: tx.buyerDeposit || Math.round(Number(tx.salePrice || 0) * 0.1),
      salePrice: tx.salePrice,
      currency: tx.currency || "AED",
      date: tx.date,
      status: tx.status,
      refundable: tx.status === "PENDING_ESCROW",
    }));
  }, [store.escrowLedger]);

  // Seller Net Payouts Data (Pending vs Settled)
  const sellerPayouts = useMemo(() => {
    return (store.escrowLedger || []).map((tx) => {
      const price = Number(tx.salePrice || 0);
      const fee = Number(tx.totalPlatformFee || 0);
      const net = Number(tx.sellerNetPayout || (price - fee));
      return {
        id: tx.id,
        invoiceNumber: tx.invoiceNumber,
        txLockId: tx.txLockId || `LOCK-SLR-${tx.id}`,
        sellerName: tx.sellerName || "Property Seller / Developer",
        propertyTitle: tx.propertyTitle,
        salePrice: price,
        brokingDeduction: fee,
        brokingPercentage: tx.brokingPercentage || 5.0,
        netPayout: net,
        currency: tx.currency || "AED",
        status: tx.status,
        date: tx.date,
        settledAt: tx.settledAt,
      };
    });
  }, [store.escrowLedger]);

  // Pending Payouts Aggregate Metrics
  const pendingSellerPayoutsTotal = useMemo(() => {
    return sellerPayouts
      .filter((s) => s.status === "PENDING_ESCROW")
      .reduce((acc, curr) => acc + curr.netPayout, 0);
  }, [sellerPayouts]);

  const settledSellerPayoutsTotal = useMemo(() => {
    return sellerPayouts
      .filter((s) => s.status === "SETTLED")
      .reduce((acc, curr) => acc + curr.netPayout, 0);
  }, [sellerPayouts]);

  const pendingBuyerEscrowTotal = useMemo(() => {
    return buyerDeposits
      .filter((b) => b.status === "PENDING_ESCROW")
      .reduce((acc, curr) => acc + curr.depositAmount, 0);
  }, [buyerDeposits]);

  // Commissions By Role Breakdown
  const roleCommissions = useMemo(() => {
    const adminTotal = (store.escrowLedger || []).reduce((acc, t) => acc + Number(t.adminCut || 0), 0);
    const dealerTotal = (store.escrowLedger || []).reduce((acc, t) => acc + Number(t.dealerCut || 0), 0);
    const checkerTotal = (store.escrowLedger || []).reduce((acc, t) => acc + Number(t.checkerCut || 0), 0);
    const totalPlatform = (store.escrowLedger || []).reduce((acc, t) => acc + Number(t.totalPlatformFee || 0), 0);

    const adminPending = (store.escrowLedger || []).filter(t => t.status === "PENDING_ESCROW").reduce((acc, t) => acc + Number(t.adminCut || 0), 0);
    const dealerPending = (store.escrowLedger || []).filter(t => t.status === "PENDING_ESCROW").reduce((acc, t) => acc + Number(t.dealerCut || 0), 0);
    const checkerPending = (store.escrowLedger || []).filter(t => t.status === "PENDING_ESCROW").reduce((acc, t) => acc + Number(t.checkerCut || 0), 0);

    return {
      adminTotal,
      adminPending,
      dealerTotal,
      dealerPending,
      checkerTotal,
      checkerPending,
      totalPlatform,
    };
  }, [store.escrowLedger]);

  // Monthly Financial Analytics
  const monthlyRevenueData = [
    { month: "Jan", gmvM: 14.5, platformFeeK: 725, sellerNetM: 13.77, dealerPayoutK: 290, adminYieldK: 290 },
    { month: "Feb", gmvM: 26.2, platformFeeK: 1310, sellerNetM: 24.89, dealerPayoutK: 524, adminYieldK: 524 },
    { month: "Mar", gmvM: 18.8, platformFeeK: 940, sellerNetM: 17.86, dealerPayoutK: 376, adminYieldK: 376 },
    { month: "Apr", gmvM: 32.4, platformFeeK: 1620, sellerNetM: 30.78, dealerPayoutK: 648, adminYieldK: 648 },
    { month: "May", gmvM: 38.6, platformFeeK: 1930, sellerNetM: 36.67, dealerPayoutK: 772, adminYieldK: 772 },
    { month: "Jun", gmvM: 44.0, platformFeeK: 2200, sellerNetM: 41.80, dealerPayoutK: 880, adminYieldK: 880 },
    { month: "Jul", gmvM: 51.5, platformFeeK: 2575, sellerNetM: 48.92, dealerPayoutK: 1030, adminYieldK: 1030 },
    { month: "Aug", gmvM: 58.2, platformFeeK: 2910, sellerNetM: 55.29, dealerPayoutK: 1164, adminYieldK: 1164 },
  ];

  // Pie chart data for Commission Split Distribution
  const pieDistributionData = [
    { name: "Super Admin Platform Yield (40%)", value: roleCommissions.adminTotal || 200000, color: "#b3975b" },
    { name: "Dealer Commission Share (40%)", value: roleCommissions.dealerTotal || 200000, color: "#3b82f6" },
    { name: "Compliance & Escrow Audit (20%)", value: roleCommissions.checkerTotal || 100000, color: "#a855f7" },
  ];

  // Settle single transaction
  const handleSettlePayout = (txId) => {
    appStore.settleEscrowPayout(txId);
    setToastMessage(`Transaction ${txId} successfully settled and escrow disbursed!`);
    setTimeout(() => setToastMessage(""), 4000);
    confetti({ particleCount: 50, spread: 60 });
  };

  // Batch settle all
  const handleBatchSettle = () => {
    appStore.batchSettleAllPending();
    setToastMessage("All pending escrow balances and seller proceeds successfully batch-settled!");
    setTimeout(() => setToastMessage(""), 4000);
    confetti({ particleCount: 80, spread: 90 });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Invoice Number",
      "TX Lock ID",
      "TX Hash",
      "Property Title",
      "Sale Price (AED)",
      "Broking %",
      "Total Platform Fee (AED)",
      "Admin Share (AED)",
      "Dealer Cut (AED)",
      "Checker Cut (AED)",
      "Seller Net Payout (AED)",
      "Buyer Name",
      "Status",
      "Date",
    ];

    const rows = (store.escrowLedger || []).map((tx) => [
      tx.invoiceNumber,
      tx.txLockId || `LOCK-${tx.id}`,
      tx.txHash,
      `"${tx.propertyTitle?.replace(/"/g, '""')}"`,
      tx.salePrice,
      tx.brokingPercentage || 5,
      tx.totalPlatformFee,
      tx.adminCut,
      tx.dealerCut,
      tx.checkerCut,
      tx.sellerNetPayout || (tx.salePrice - tx.totalPlatformFee),
      `"${tx.buyerName?.replace(/"/g, '""')}"`,
      tx.status,
      tx.date,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `NCR_Secure_Master_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#b3975b] selection:text-white">
      <Header />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* TOAST ALERT */}
        {toastMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-sm font-semibold flex items-center justify-between shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-emerald-400 text-lg" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage("")} className="text-emerald-400 hover:text-white text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* FINANCIAL RECORD CENTER & VAULT HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden mb-8">
          {/* Security Badge in Background */}
          <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
            <FaShieldAlt className="text-[260px] text-emerald-400" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#b3975b] via-emerald-500 to-teal-500 p-0.5 shadow-lg shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Financial Record Center & Ledger
                  </h1>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                    <FaLock className="text-[10px]" /> AES-256 Escrow Vault Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Ledger Comptroller: <strong className="text-slate-200">{currentUser.name}</strong></span>
                  <span>•</span>
                  <span>Consolidated Multi-Role Settlement Engine</span>
                  <span>•</span>
                  <span className="text-[#b3975b]">UAE RERA Escrow Certified</span>
                </p>
              </div>
            </div>

            {/* QUICK ACTIONS & EXPORTS */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-2 shadow"
                title="Export Comprehensive Multi-Role Master Ledger to CSV"
              >
                <FaFileCsv className="text-emerald-400" /> Export CSV Ledger
              </button>

              {summary.totalPendingEscrow > 0 && (
                <button
                  type="button"
                  onClick={handleBatchSettle}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg"
                >
                  <FaMoneyCheckAlt /> Settle All Escrows (AED {summary.totalPendingEscrow.toLocaleString()})
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  clearToken();
                  navigate("/login");
                }}
                className="px-4 py-2.5 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-2 shadow"
                title="Sign out of Finance Portal"
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          </div>

          {/* FINANCIAL KPI MATRIX: CONSOLIDATED ACROSS ROLES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-slate-800/80">
            {/* 1. Total GMV */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Total Volume (GMV)
              </div>
              <div className="text-base sm:text-lg font-extrabold text-white mt-1">
                AED {summary.totalGMV.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">Marketplace Value</div>
            </div>

            {/* 2. Escrow Pending Reserve */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Pending Escrow
              </div>
              <div className="text-base sm:text-lg font-extrabold text-amber-400 mt-1">
                AED {summary.totalPendingEscrow.toLocaleString()}
              </div>
              <div className="text-[10px] text-amber-300/80 font-medium">Locked in Custody</div>
            </div>

            {/* 3. Total Earned Commissions */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 hover:border-[#b3975b]/30 transition">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Total Broking Cut
              </div>
              <div className="text-base sm:text-lg font-extrabold text-[#b3975b] mt-1">
                AED {roleCommissions.totalPlatform.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">5.0% Atomic Fee Pool</div>
            </div>

            {/* 4. Dealer Brokerage Share */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Dealer Commissions
              </div>
              <div className="text-base sm:text-lg font-extrabold text-blue-400 mt-1">
                AED {roleCommissions.dealerTotal.toLocaleString()}
              </div>
              <div className="text-[10px] text-blue-300/80 font-medium">2.0% Agent Payouts</div>
            </div>

            {/* 5. Admin Platform Yield */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Admin Net Yield
              </div>
              <div className="text-base sm:text-lg font-extrabold text-emerald-400 mt-1">
                AED {roleCommissions.adminTotal.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-300/80 font-medium">2.0% Platform License</div>
            </div>

            {/* 6. Checker Compliance Audit */}
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 hover:border-purple-500/30 transition">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Checker Audit Fee
              </div>
              <div className="text-base sm:text-lg font-extrabold text-purple-400 mt-1">
                AED {roleCommissions.checkerTotal.toLocaleString()}
              </div>
              <div className="text-[10px] text-purple-300/80 font-medium">1.0% Compliance Cut</div>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => {
                setActiveTab("master-ledger");
                setRoleFilter("ALL");
              }}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "master-ledger" && roleFilter === "ALL"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaFileInvoiceDollar /> Consolidated Master Ledger ({store.escrowLedger.length})
            </button>

            <button
              onClick={() => setActiveTab("commissions")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "commissions"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaBalanceScale /> Earned Commissions By Role
            </button>

            <button
              onClick={() => setActiveTab("buyer-escrow")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "buyer-escrow"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaCoins /> Buyer Escrow & Deposits (AED {summary.totalBuyerDeposits.toLocaleString()})
            </button>

            <button
              onClick={() => setActiveTab("seller-payouts")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "seller-payouts"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaHandHoldingUsd /> Seller Payouts (AED {summary.totalSellerNetPayouts.toLocaleString()})
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 ${
                activeTab === "analytics"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FaChartLine /> Treasury Analytics
            </button>
          </div>
        </div>

        {/* TAB 1: CONSOLIDATED MASTER LEDGER VIEW (WITH ROLE SELECTOR) */}
        {activeTab === "master-ledger" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Role Filter Bar */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FaUserShield className="text-emerald-400" /> Filter By Role:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "ALL", label: "All Roles", count: store.escrowLedger.length },
                    { id: "super_admin", label: "Super Admin (Sudhir)", count: store.escrowLedger.length },
                    { id: "dealer", label: "Dealers (Vikram & Co)", count: store.escrowLedger.length },
                    { id: "checker", label: "Compliance (Navjeet)", count: store.escrowLedger.length },
                    { id: "buyer", label: "Buyers (Rahul & VIPs)", count: buyerDeposits.length },
                    { id: "seller", label: "Sellers (Developers)", count: sellerPayouts.length },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRoleFilter(r.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                        roleFilter === r.id
                          ? "bg-[#b3975b] text-white shadow"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search invoice, buyer, property, hash..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:ring-2 focus:ring-emerald-500 w-52 sm:w-64"
                  />
                  <FaSearch className="absolute left-2.5 top-2.5 text-slate-500 text-xs" />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SETTLED">Settled</option>
                  <option value="PENDING_ESCROW">Pending Escrow</option>
                </select>
              </div>
            </div>

            {/* Comprehensive Record Center Table */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-x-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="font-bold text-white text-sm">
                    Cryptographic Settlement Ledger ({filteredLedger.length} Records)
                  </h3>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-3">
                  <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                    <FaKey className="text-[9px]" /> SELECT FOR UPDATE Atomic Locks Active
                  </span>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                    <th className="pb-3 font-semibold">Invoice & TX Lock</th>
                    <th className="pb-3 font-semibold">Property Asset</th>
                    <th className="pb-3 font-semibold">Agreed Sale Price</th>
                    <th className="pb-3 font-semibold text-amber-300">Broking Fee (5%)</th>
                    <th className="pb-3 font-semibold text-emerald-400">Seller Net (95%)</th>
                    <th className="pb-3 font-semibold text-blue-400">Dealer (2%)</th>
                    <th className="pb-3 font-semibold text-[#b3975b]">Admin (2%)</th>
                    <th className="pb-3 font-semibold text-purple-400">Checker (1%)</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLedger.map((tx) => (
                    <tr key={tx.id} className="text-slate-200 hover:bg-slate-800/40 transition">
                      {/* Invoice & Lock ID */}
                      <td className="py-4 font-mono">
                        <div className="font-bold text-white flex items-center gap-1">
                          <FaFileInvoiceDollar className="text-emerald-400 text-xs" />
                          {tx.invoiceNumber}
                        </div>
                        <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5" title="Database Transaction Lock ID">
                          {tx.txLockId || `LOCK-TX-${tx.id}`}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[110px]" title={tx.txHash}>
                          {tx.txHash ? `${tx.txHash.substring(0, 12)}...` : "0x7a3f89b1c2..."}
                        </div>
                        <span className="text-[9px] text-slate-500">{tx.date}</span>
                      </td>

                      {/* Property Details */}
                      <td className="py-4">
                        <div className="font-semibold text-white max-w-xs truncate">
                          {tx.propertyTitle}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Buyer: <span className="text-slate-200 font-medium">{tx.buyerName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Seller: <span className="text-slate-200 font-medium">{tx.sellerName || "Developer"}</span>
                        </div>
                      </td>

                      {/* Sale Price */}
                      <td className="py-4 font-bold text-white">
                        AED {Number(tx.salePrice).toLocaleString()}
                      </td>

                      {/* Broking Fee */}
                      <td className="py-4">
                        <div className="font-bold text-amber-300">
                          AED {Number(tx.totalPlatformFee).toLocaleString()}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {tx.brokingPercentage || 5.0}% Total
                        </span>
                      </td>

                      {/* Seller Net */}
                      <td className="py-4 font-bold text-emerald-400">
                        AED {Number(tx.sellerNetPayout || (tx.salePrice - tx.totalPlatformFee)).toLocaleString()}
                      </td>

                      {/* Dealer Cut */}
                      <td className="py-4 font-bold text-blue-400">
                        AED {Number(tx.dealerCut).toLocaleString()}
                      </td>

                      {/* Admin Cut */}
                      <td className="py-4 font-bold text-[#b3975b]">
                        AED {Number(tx.adminCut).toLocaleString()}
                      </td>

                      {/* Checker Cut */}
                      <td className="py-4 font-bold text-purple-400">
                        AED {Number(tx.checkerCut || (tx.totalPlatformFee * 0.2)).toLocaleString()}
                      </td>

                      {/* Status */}
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

                      {/* Actions */}
                      <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                        {tx.status === "PENDING_ESCROW" && (
                          <button
                            type="button"
                            onClick={() => handleSettlePayout(tx.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[11px] font-bold shadow transition"
                            title="Release escrow payouts to all parties"
                          >
                            Settle
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => generateCommissionInvoice(tx, "PLATFORM")}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1 shadow border border-slate-700"
                          title="Download Official VAT Invoice PDF"
                        >
                          <FaDownload className="text-emerald-400" /> PDF
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTx(tx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-[11px] font-semibold inline-flex items-center gap-1 border border-slate-700 transition"
                          title="Inspect financial split details"
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
        )}

        {/* TAB 2: COMMISSIONS BY ROLE BREAKDOWN */}
        {activeTab === "commissions" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Consolidated Earned Commissions Matrix & Allocation Pool
              </h2>
              <p className="text-xs text-slate-400">
                Detailed commission ledger broken down across Platform Super Admin, Real Estate Dealers, and Compliance Officers.
              </p>
            </div>

            {/* Role Commission Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Super Admin Card */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-[#b3975b]/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#b3975b]/20 text-[#b3975b] flex items-center justify-center text-xl font-bold">
                    <FaUserShield />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#b3975b]/20 text-[#b3975b] border border-[#b3975b]/30">
                    2.0% Fixed Platform Share
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Super Admin (Sudhir)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Platform Owner Yield & Technology Infrastructure</p>

                <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Earned Commissions:</span>
                    <span className="font-bold text-white text-sm">AED {roleCommissions.adminTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Settled to Bank Account:</span>
                    <span className="font-bold text-emerald-400">AED {(roleCommissions.adminTotal - roleCommissions.adminPending).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pending Escrow Release:</span>
                    <span className="font-bold text-amber-300">AED {roleCommissions.adminPending.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 2. Property Dealer Card */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-blue-500/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold">
                    <FaBuilding />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    2.0% Brokerage Commission
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Platinum Dealers (Vikram & Co)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Licensed RERA Broker Representation & Sourcing</p>

                <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Earned Brokerage:</span>
                    <span className="font-bold text-white text-sm">AED {roleCommissions.dealerTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Settled Disbursements:</span>
                    <span className="font-bold text-emerald-400">AED {(roleCommissions.dealerTotal - roleCommissions.dealerPending).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pending Escrow Clearance:</span>
                    <span className="font-bold text-amber-300">AED {roleCommissions.dealerPending.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 3. Compliance Checker Card */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-purple-500/30 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-bold">
                    <FaShieldAlt />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    1.0% Compliance & Escrow Audit
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Compliance Checkers (Navjeet)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Title Deed Audit, KYC Verification & Anti-Fraud Scan</p>

                <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Audit Verification Fees:</span>
                    <span className="font-bold text-white text-sm">AED {roleCommissions.checkerTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Settled Audit Fees:</span>
                    <span className="font-bold text-emerald-400">AED {(roleCommissions.checkerTotal - roleCommissions.checkerPending).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Pending Audit Releases:</span>
                    <span className="font-bold text-amber-300">AED {roleCommissions.checkerPending.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Distribution Visual */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(val) => [`AED ${Number(val).toLocaleString()}`, "Commission Allocation"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 space-y-4">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <FaCertificate className="text-[#b3975b]" />
                  Atomic 5.0% Broking Distribution Policy
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every property sale executed on the platform strictly applies the multi-party atomic distribution model verified by smart concurrency database locks. 
                  Sellers receive 95.0% net proceeds, while the 5.0% broking commission is programmatically divided: 40% Admin, 40% Dealer, and 20% Checker Escrow.
                </p>
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between"><span>Super Admin Cut:</span><strong className="text-[#b3975b]">2.0% (AED {roleCommissions.adminTotal.toLocaleString()})</strong></div>
                  <div className="flex justify-between"><span>Dealer Cut:</span><strong className="text-blue-400">2.0% (AED {roleCommissions.dealerTotal.toLocaleString()})</strong></div>
                  <div className="flex justify-between"><span>Compliance Auditor:</span><strong className="text-purple-400">1.0% (AED {roleCommissions.checkerTotal.toLocaleString()})</strong></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BUYER ESCROW DEPOSITS & HOLDING BALANCES */}
        {activeTab === "buyer-escrow" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Buyer Holding Deposits & Tokenized Escrow Balances
                </h2>
                <p className="text-xs text-slate-400">
                  Security deposits, earnest money, and reservation tokens held in secure escrow custody pending title conveyance.
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-2">
                <FaCoins /> Total Active Escrow Held: AED {summary.totalBuyerDeposits.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                    <th className="pb-3 font-semibold">Invoice #</th>
                    <th className="pb-3 font-semibold">Lock ID</th>
                    <th className="pb-3 font-semibold">Buyer Client</th>
                    <th className="pb-3 font-semibold">Reserved Property</th>
                    <th className="pb-3 font-semibold text-purple-400">Holding Deposit Held</th>
                    <th className="pb-3 font-semibold">Full Price</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {buyerDeposits.map((item) => (
                    <tr key={item.id} className="text-slate-200 hover:bg-slate-800/30 transition">
                      <td className="py-4 font-mono text-white font-bold">{item.invoiceNumber}</td>
                      <td className="py-4 font-mono text-purple-300 text-[10px]">{item.txLockId}</td>
                      <td className="py-4">
                        <div className="font-semibold text-white">{item.buyerName}</div>
                        <div className="text-[11px] text-slate-400">{item.buyerEmail}</div>
                      </td>
                      <td className="py-4">
                        <div className="font-semibold text-white">{item.propertyTitle}</div>
                        <div className="text-[11px] text-slate-400">{item.propertyLocation}</div>
                      </td>
                      <td className="py-4 font-bold text-purple-400 text-sm">
                        AED {Number(item.depositAmount).toLocaleString()}
                      </td>
                      <td className="py-4 font-mono text-slate-300">
                        AED {Number(item.salePrice).toLocaleString()}
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          Secured in Escrow
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const tx = store.escrowLedger.find((t) => t.id === item.id);
                            if (tx) generateCommissionInvoice(tx, "BUYER");
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1 border border-slate-700"
                        >
                          <FaReceipt className="text-purple-400" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SELLER NET DISTRIBUTIONS (PENDING VS SETTLED) */}
        {activeTab === "seller-payouts" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Seller Escrow Distributions & Net Proceeds Statements
                </h2>
                <p className="text-xs text-slate-400">
                  Net transaction payouts delivered to property owners, developers, and asset holders after broking fee deduction.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  Pending Payouts: <strong>AED {pendingSellerPayoutsTotal.toLocaleString()}</strong>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  Settled: <strong>AED {settledSellerPayoutsTotal.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                    <th className="pb-3 font-semibold">Invoice & Lock ID</th>
                    <th className="pb-3 font-semibold">Beneficiary (Seller)</th>
                    <th className="pb-3 font-semibold">Property Asset</th>
                    <th className="pb-3 font-semibold">Gross Sale</th>
                    <th className="pb-3 font-semibold text-amber-300">Broking Cut</th>
                    <th className="pb-3 font-semibold text-emerald-400">Net Seller Payout</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sellerPayouts.map((item) => (
                    <tr key={item.id} className="text-slate-200 hover:bg-slate-800/30 transition">
                      <td className="py-4 font-mono">
                        <div className="text-white font-bold">{item.invoiceNumber}</div>
                        <div className="text-[10px] text-slate-500">{item.txLockId}</div>
                      </td>
                      <td className="py-4">
                        <div className="font-semibold text-white">{item.sellerName}</div>
                        <div className="text-[10px] text-slate-400">Verified Developer</div>
                      </td>
                      <td className="py-4 font-semibold text-white max-w-xs truncate">{item.propertyTitle}</td>
                      <td className="py-4 font-bold text-slate-300">
                        AED {Number(item.salePrice).toLocaleString()}
                      </td>
                      <td className="py-4 font-mono text-amber-300">
                        - AED {Number(item.brokingDeduction).toLocaleString()} ({item.brokingPercentage}%)
                      </td>
                      <td className="py-4 font-extrabold text-emerald-400 text-sm">
                        AED {Number(item.netPayout).toLocaleString()}
                      </td>
                      <td className="py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "SETTLED"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                        {item.status === "PENDING_ESCROW" && (
                          <button
                            type="button"
                            onClick={() => handleSettlePayout(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-[11px] font-bold shadow"
                          >
                            Release Funds
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const tx = store.escrowLedger.find((t) => t.id === item.id);
                            if (tx) generateCommissionInvoice(tx, "SELLER");
                          }}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs inline-flex items-center gap-1 border border-slate-700"
                        >
                          <FaDownload className="text-emerald-400" /> Statement
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: FINANCIAL ANALYTICS & TRAJECTORY */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <FaChartLine className="text-emerald-400" />
                  Treasury Growth Velocity & Multi-Tier Revenue Analysis (2026)
                </h2>
                <p className="text-xs text-slate-400">
                  Total Platform GMV vs Gross Platform Fee Yield vs Net Seller Distributions trajectory.
                </p>
              </div>

              <div className="bg-slate-950/90 rounded-2xl p-6 border border-slate-800/80">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#b3975b" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#b3975b" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}M`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#10b981",
                          borderRadius: "1rem",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                        formatter={(val, name) => [
                          `AED ${val}M`,
                          name === "gmvM" ? "Total Platform Volume (GMV)" : name === "sellerNetM" ? "Net to Sellers (95%)" : name,
                        ]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="gmvM"
                        name="Platform GMV (AED M)"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#gmvGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="sellerNetM"
                        name="Seller Net Proceeds (AED M)"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        fillOpacity={0.3}
                        fill="#38bdf8"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DETAIL MODAL: TRANSACTION INSPECTOR */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaReceipt className="text-emerald-400" />
                  Financial Settlement Breakdown
                </h3>
                <p className="text-xs font-mono text-slate-400">{selectedTx.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-semibold">Property:</div>
                <div className="font-bold text-white text-sm">{selectedTx.propertyTitle}</div>
                <div className="text-slate-400">{selectedTx.propertyLocation}</div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Agreed Sale Price:</span>
                  <span className="font-extrabold text-white text-sm">
                    AED {Number(selectedTx.salePrice).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Broking Fee Percentage:</span>
                  <span className="font-mono text-amber-300 font-bold">
                    {selectedTx.brokingPercentage || 5.0}% Total
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400">Gross Broking Commission:</span>
                  <span className="font-bold text-amber-400">
                    AED {Number(selectedTx.totalPlatformFee).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Four-way Atomic Distribution */}
              <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-2">
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                  Atomic Fund Distribution:
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Seller Net Payout (95%+):</span>
                  <span className="font-bold text-emerald-400">
                    AED {Number(selectedTx.sellerNetPayout || (selectedTx.salePrice - selectedTx.totalPlatformFee)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Dealer Cut ({selectedTx.dealerName}):</span>
                  <span className="font-bold text-blue-400">
                    AED {Number(selectedTx.dealerCut).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Admin Platform Yield:</span>
                  <span className="font-bold text-[#b3975b]">
                    AED {Number(selectedTx.adminCut).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Compliance & Checker Escrow:</span>
                  <span className="font-bold text-purple-400">
                    AED {Number(selectedTx.checkerCut).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 font-mono text-[10px] text-slate-400">
                <div>TX Hash: {selectedTx.txHash}</div>
                <div>Lock ID: {selectedTx.txLockId || `LOCK-${selectedTx.id}`}</div>
                <div>Status: <span className="text-emerald-400 font-bold">{selectedTx.status}</span></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => generateCommissionInvoice(selectedTx, "PLATFORM")}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <FaDownload className="text-emerald-400" /> Download PDF Invoice
              </button>
              {selectedTx.status === "PENDING_ESCROW" && (
                <button
                  onClick={() => {
                    handleSettlePayout(selectedTx.id);
                    setSelectedTx(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow"
                >
                  ✓ Settle & Disburse Funds
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
