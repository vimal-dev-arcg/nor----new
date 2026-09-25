import { useState, useMemo, useRef, useEffect } from "react";
import { chat } from "../lib/chatClient";
import {
  DUBAI_COMMUNITY_DATA,
  UAE_TRANSACTION_RULES,
  calculateRentalYield,
} from "../data/dubaiMarketData";
import {
  HiOutlineSparkles,
  HiOutlineCalculator,
  HiOutlineChartBar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineXMark,
  HiOutlinePaperAirplane,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineBuildingOffice2,
  HiOutlineShieldCheck,
  HiOutlineCurrencyDollar,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import { FormattedMessage } from "./FormattedMessage";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'calculator' | 'insights'

  // Chat State
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome to **NCR Properties Advisory AI**. I can analyze real-time Dubai Land Department (DLD) transactions, calculate net rental yields & ROI, or assist with off-plan developer allocations and Golden Visa eligibility. How can I assist your investment portfolio today?",
    },
  ]);
  const boxRef = useRef(null);

  // Rental Calculator State
  const [calcCommunity, setCalcCommunity] = useState("Downtown Dubai");
  const [calcPrice, setCalcPrice] = useState(2500000);
  const [calcSqft, setCalcSqft] = useState(1200);
  const [calcRentalMode, setCalcRentalMode] = useState("long_term"); // 'long_term' | 'short_term'
  const [customAnnualRent, setCustomAnnualRent] = useState("");

  // Market Insights State
  const [selectedInsightArea, setSelectedInsightArea] = useState("Downtown Dubai");

  // Scroll chat to bottom on new messages
  useEffect(() => {
    if (activeTab === "chat" && boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages, busy, activeTab]);

  // Run Yield Calculations
  const yieldResults = useMemo(() => {
    return calculateRentalYield({
      purchasePrice: Number(calcPrice) || 2000000,
      community: calcCommunity,
      sqft: Number(calcSqft) || 1000,
      rentalType: calcRentalMode,
      customAnnualRent: customAnnualRent ? Number(customAnnualRent) : null,
    });
  }, [calcPrice, calcCommunity, calcSqft, calcRentalMode, customAnnualRent]);

  // Quick Action Buttons in Chat
  const quickActions = [
    {
      label: "ROI in JVC vs Downtown?",
      text: "Compare the gross and net rental yields between JVC and Downtown Dubai. Which offers better cashflow vs capital growth?",
    },
    {
      label: "Recent Palm Jumeirah Sales",
      text: "What are the latest verified DLD transaction prices per square foot and sales volumes on Palm Jumeirah?",
    },
    {
      label: "Golden Visa Rules (AED 2M)",
      text: "Can I qualify for the 10-year UAE Golden Visa with an off-plan purchase of AED 2M? What are the documentation requirements?",
    },
    {
      label: "NRI Investment in India",
      text: "How can an NRI invest in Gurgaon Golf Course Road or Tricity through NCR Properties? What are the FEMA and repatriation guidelines?",
    },
  ];

  async function handleSend(customText) {
    const textToSend = (customText || input).trim();
    if (!textToSend || busy) return;

    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);

    try {
      const res = await chat({
        message: textToSend,
        history: messages.slice(-6),
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: res.reply || res.message },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            err?.message ||
            "Our advisory network is momentarily busy. Please try again or tap below to speak directly with an advisor via WhatsApp.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  // Load calculation summary into AI Chat
  function handleAnalyzeCalculationInChat() {
    const prompt = `I modeled an investment of AED ${calcPrice.toLocaleString()} in ${calcCommunity} (${calcRentalMode === "short_term" ? "Holiday Home Short-Term" : "Long-Term Lease"}). The projected gross yield is ${yieldResults.grossYield}% and net yield is ${yieldResults.netYield}%. Can you give me your professional advisory analysis of this scenario and compare it with current market opportunities?`;
    setActiveTab("chat");
    setTimeout(() => {
      handleSend(prompt);
    }, 150);
  }

  // Format currency helpers
  const fmtAED = (n) => `AED ${Number(n).toLocaleString()}`;

  return (
    <div className="fixed z-50 right-5 bottom-6 md:right-8 md:bottom-8 font-sans">
      {/* ================= CHATBOT / TOOL WINDOW ================= */}
      {open && (
        <div className="mb-3 w-[360px] sm:w-[440px] max-w-[94vw] h-[580px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fadeIn">
          {/* Top Banner / Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#b3975b] to-[#d4bc82] flex items-center justify-center text-white text-lg shadow-md">
                <HiOutlineSparkles />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white tracking-wide">
                    NCR Advisory AI
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    DLD Live
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Rental Calculator & Dubai Transaction Insights
                </p>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
              aria-label="Close"
            >
              <HiOutlineXMark className="text-lg" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-slate-100/90 p-1.5 grid grid-cols-3 gap-1 shrink-0 border-b border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === "chat"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HiOutlineChatBubbleLeftRight className="text-sm text-[#b3975b]" />
              <span>AI Advisor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("calculator")}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === "calculator"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HiOutlineCalculator className="text-sm text-[#b3975b]" />
              <span>Yield Calc</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("insights")}
              className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === "insights"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <HiOutlineChartBar className="text-sm text-[#b3975b]" />
              <span>DLD Insights</span>
            </button>
          </div>

          {/* ================= TAB 1: AI CHAT ================= */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              {/* Quick Prompts Bar */}
              <div className="p-2.5 bg-white border-b border-slate-200/80 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0">
                {quickActions.map((qa, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(qa.text)}
                    disabled={busy}
                    className="text-[11px] px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-[#b3975b]/10 hover:border-[#b3975b] hover:text-[#b3975b] text-slate-700 transition shrink-0 font-medium"
                  >
                    {qa.label}
                  </button>
                ))}
              </div>

              {/* Chat Message Scroll Box */}
              <div
                ref={boxRef}
                className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50"
              >
                {messages.map((m, idx) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={idx}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isUser
                            ? "bg-slate-900 text-white rounded-br-xs shadow-xs"
                            : "bg-white text-slate-800 border border-slate-200/90 shadow-xs rounded-bl-xs"
                        }`}
                      >
                        <FormattedMessage text={m.text} isUser={isUser} />
                      </div>
                    </div>
                  );
                })}

                {busy && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 rounded-bl-xs shadow-xs text-xs text-slate-500 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#b3975b] animate-ping" />
                      <span>Consulting DLD transaction intelligence & Gemini...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Footer */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about rental yields, DLD sales, Golden Visa..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#b3975b] text-xs text-slate-900"
                    disabled={busy}
                  />

                  <button
                    type="submit"
                    disabled={!input.trim() || busy}
                    className="w-10 h-10 rounded-xl bg-[#b3975b] hover:bg-[#9e824c] disabled:opacity-40 text-white flex items-center justify-center transition shrink-0"
                    aria-label="Send"
                  >
                    <HiOutlinePaperAirplane className="text-base" />
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Powered by Gemini 3.8 & Real-Time DLD Data</span>
                  <a
                    href="https://wa.me/97143999999"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#b3975b] hover:underline font-semibold flex items-center gap-1"
                  >
                    <FaWhatsapp className="text-xs" />
                    <span>WhatsApp Advisor</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: AI RENTAL YIELD CALCULATOR ================= */}
          {activeTab === "calculator" && (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Property Configuration
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-[#b3975b] border border-amber-200 font-semibold">
                    Dubai Benchmark Model
                  </span>
                </div>

                {/* Community Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dubai Community
                  </label>
                  <select
                    value={calcCommunity}
                    onChange={(e) => setCalcCommunity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b3975b]"
                  >
                    {Object.keys(DUBAI_COMMUNITY_DATA).map((comm) => (
                      <option key={comm} value={comm}>
                        {comm}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Property Price & Area */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Purchase Price (AED)
                    </label>
                    <input
                      type="number"
                      step={50000}
                      value={calcPrice}
                      onChange={(e) => setCalcPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b3975b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Built-up Area (Sq.Ft.)
                    </label>
                    <input
                      type="number"
                      step={50}
                      value={calcSqft}
                      onChange={(e) => setCalcSqft(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b3975b]"
                    />
                  </div>
                </div>

                {/* Rental Strategy */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Rental Strategy
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCalcRentalMode("long_term")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                        calcRentalMode === "long_term"
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Long-Term Tenancy
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalcRentalMode("short_term")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                        calcRentalMode === "short_term"
                          ? "bg-[#b3975b] text-white border-[#b3975b]"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      Holiday Home (Short-Term)
                    </button>
                  </div>
                </div>
              </div>

              {/* Yield Cards Result */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Gross Rental Yield
                    </div>
                    <div className="text-2xl font-extrabold text-[#b3975b] mt-0.5">
                      {yieldResults.grossYield}%
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Estimated Net Yield
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                      {yieldResults.netYield}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <span className="text-slate-400 block text-[10px]">
                      Expected Annual Rent
                    </span>
                    <span className="font-bold text-white text-sm">
                      {fmtAED(yieldResults.annualRent)}
                    </span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                    <span className="text-slate-400 block text-[10px]">
                      Net Annual Cashflow
                    </span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {fmtAED(yieldResults.netAnnualIncome)}
                    </span>
                  </div>
                </div>

                {/* Acquisition Breakdown */}
                <div className="space-y-1.5 text-[11px] border-t border-white/10 pt-3 text-slate-300">
                  <div className="flex justify-between">
                    <span>4% DLD Transfer Fee:</span>
                    <span className="font-medium text-white">
                      {fmtAED(yieldResults.dldFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Annual Service Charges:</span>
                    <span className="font-medium text-white">
                      {fmtAED(yieldResults.annualServiceCharge)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Acquisition Cost:</span>
                    <span className="font-bold text-[#b3975b]">
                      {fmtAED(yieldResults.totalAcquisitionCost)}
                    </span>
                  </div>
                </div>

                {/* Golden Visa Status */}
                {yieldResults.qualifiesGoldenVisa ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs">
                    <HiOutlineShieldCheck className="text-lg shrink-0 text-emerald-400" />
                    <span>
                      Qualifies for <strong>10-Year UAE Golden Visa</strong> (Purchase ≥ AED 2M)
                    </span>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400">
                    Add {fmtAED(2000000 - calcPrice)} to meet the AED 2,000,000 Golden Visa threshold.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAnalyzeCalculationInChat}
                  className="w-full py-2.5 bg-[#b3975b] hover:bg-[#9e824c] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                >
                  <HiOutlineSparkles className="text-sm" />
                  <span>Ask AI to Deep-Analyze This Yield</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 3: REAL-TIME DUBAI TRANSACTION INSIGHTS ================= */}
          {activeTab === "insights" && (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
              {/* Area Selector */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    DLD Community Intelligence
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Official Registry Sync
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(DUBAI_COMMUNITY_DATA).map((comm) => (
                    <button
                      key={comm}
                      type="button"
                      onClick={() => setSelectedInsightArea(comm)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                        selectedInsightArea === comm
                          ? "bg-[#b3975b] text-white border-[#b3975b]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {comm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area Stats Grid */}
              {(() => {
                const data =
                  DUBAI_COMMUNITY_DATA[selectedInsightArea] ||
                  DUBAI_COMMUNITY_DATA["Downtown Dubai"];
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Avg Sq.Ft.
                        </span>
                        <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                          AED {data.avgPriceSqft}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Gross Yield
                        </span>
                        <span className="text-sm font-bold text-emerald-600 mt-0.5 block">
                          {data.grossRentalYield}%
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          YoY Growth
                        </span>
                        <span className="text-sm font-bold text-[#b3975b] mt-0.5 block">
                          +{data.capitalGrowthYoY}%
                        </span>
                      </div>
                    </div>

                    {/* Recent Verified DLD Transactions List */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Latest DLD Transactions in {selectedInsightArea}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Verified Sales
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {data.latestTransactions.map((tx, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900">
                                {tx.project}
                              </span>
                              <span className="text-[11px] font-bold text-[#b3975b]">
                                {fmtAED(tx.priceAED)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>
                                {tx.unit} ({tx.sqft} sqft)
                              </span>
                              <span className="font-medium text-slate-700">
                                AED {tx.priceSqft}/sqft
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                              <span className="inline-block px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600 font-medium">
                                {tx.type}
                              </span>
                              <span>Status: Recorded DLD</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("chat");
                          setTimeout(() => {
                            handleSend(
                              `Can you share more recent off-plan and secondary market transaction trends for ${selectedInsightArea} and advise if it's currently a buyer's or seller's market?`
                            );
                          }, 150);
                        }}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <HiOutlineSparkles className="text-sm text-[#b3975b]" />
                        <span>Query More Data on {selectedInsightArea}</span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ================= FLOATING LAUNCH TRIGGER ================= */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-[#b3975b] hover:to-[#9e824c] text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
          aria-label="Open AI Real Estate Assistant"
        >
          <div className="w-5 h-5 rounded-full bg-[#b3975b] group-hover:bg-white group-hover:text-slate-900 text-white flex items-center justify-center text-xs shadow-xs transition-colors">
            <HiOutlineSparkles />
          </div>

          <span className="font-bold text-xs uppercase tracking-wider hidden sm:inline-block">
            AI Advisory
          </span>

          <span className="px-1.5 py-0.5 rounded-full bg-[#b3975b]/30 text-[10px] text-[#f4d99c] font-bold border border-[#b3975b]/40">
            Yield & DLD
          </span>
        </button>
      </div>
    </div>
  );
}
