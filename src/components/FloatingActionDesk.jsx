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
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import { FormattedMessage } from "./FormattedMessage";

export default function FloatingActionDesk() {
  // Global modal state: null | 'ai' | 'whatsapp'
  const [activeModal, setActiveModal] = useState(null);

  // ================= AI Chatbot & Calculator State =================
  const [aiTab, setAiTab] = useState("chat"); // 'chat' | 'calculator' | 'insights'
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome to **NCR Properties Advisory AI**. Grounded directly in verified Dubai Land Department (DLD) transactions, real-time ROI & rental calculators, and UAE Golden Visa thresholds. How can I assist your property portfolio today?",
    },
  ]);
  const boxRef = useRef(null);

  // Rental Calculator state
  const [calcCommunity, setCalcCommunity] = useState("Downtown Dubai");
  const [calcPrice, setCalcPrice] = useState(2500000);
  const [calcSqft, setCalcSqft] = useState(1200);
  const [calcRentalMode, setCalcRentalMode] = useState("long_term");
  const [customAnnualRent, setCustomAnnualRent] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  // Market Insights state
  const [selectedInsightArea, setSelectedInsightArea] = useState("Downtown Dubai");
  const [isFetchingInsights, setIsFetchingInsights] = useState(false);

  // ================= WhatsApp State =================
  const [selectedAgent, setSelectedAgent] = useState("general");
  const [customMsg, setCustomMsg] = useState("");

  const advisors = [
    {
      id: "general",
      name: "NCR VIP Advisory Desk",
      role: "Luxury Sales & Off-Plan Allocations",
      phone: "+971 4 399 9999",
      whatsappNum: "97143999999",
      avatar: "🏛️",
      tag: "Off-Plan & Ready",
      defaultText:
        "Hello NCR Properties, I would like to speak with an investment advisor regarding prime UAE real estate opportunities.",
    },
    {
      id: "mortgages",
      name: "Afaq Ahmed",
      role: "Director - Mortgages & Finance",
      phone: "+971 50 123 4567",
      whatsappNum: "971501234567",
      avatar: "💼",
      tag: "Non-Resident Loans",
      defaultText:
        "Hello Afaq, I would like to inquire about UAE mortgage eligibility, non-resident loan terms, and fast pre-approval.",
    },
    {
      id: "nri",
      name: "NCR NRI Desk 🇮🇳",
      role: "Cross-Border India & Dubai Advisory",
      phone: "+91 98110 54321",
      whatsappNum: "919811054321",
      avatar: "🇮🇳",
      tag: "Delhi • Tricity • BLR",
      defaultText:
        "Hello NCR Properties, I am an NRI looking for trusted property advisory across Delhi NCR, Tricity, Bangalore, or Dubai.",
    },
  ];

  const currentAdvisor =
    advisors.find((a) => a.id === selectedAgent) || advisors[0];

  // Auto scroll chat box
  useEffect(() => {
    if (activeModal === "ai" && aiTab === "chat" && boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages, busy, aiTab, activeModal]);

  // Yield calculations
  const yieldResults = useMemo(() => {
    return calculateRentalYield({
      purchasePrice: Number(calcPrice) || 2000000,
      community: calcCommunity,
      sqft: Number(calcSqft) || 1000,
      rentalType: calcRentalMode,
      customAnnualRent: customAnnualRent ? Number(customAnnualRent) : null,
    });
  }, [calcPrice, calcCommunity, calcSqft, calcRentalMode, customAnnualRent]);

  // Quick Action Prompts
  const quickActions = [
    {
      label: "JVC vs Downtown ROI",
      text: "Compare the gross and net rental yields between JVC and Downtown Dubai. Which offers better cashflow vs capital growth?",
    },
    {
      label: "Palm Jumeirah Sales",
      text: "What are the latest verified DLD transaction prices per square foot and recent high-value sales on Palm Jumeirah?",
    },
    {
      label: "Golden Visa (AED 2M)",
      text: "How do I secure the 10-year UAE Golden Visa with off-plan or ready property? What are the qualifying developer criteria?",
    },
    {
      label: "NRI India Advisory",
      text: "Explain how NRIs can repatriate funds and invest in DLF Gurgaon or Tricity through NCR Properties under FEMA rules.",
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
            "Our advisory network is momentarily busy. Please try again or tap the WhatsApp button to connect directly.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function handleCommunityChange(newComm) {
    setIsCalculating(true);
    setCalcCommunity(newComm);
    setTimeout(() => setIsCalculating(false), 420);
  }

  function handleStrategyChange(mode) {
    setIsCalculating(true);
    setCalcRentalMode(mode);
    setTimeout(() => setIsCalculating(false), 380);
  }

  function handleSelectInsightArea(area) {
    setIsFetchingInsights(true);
    setSelectedInsightArea(area);
    setTimeout(() => setIsFetchingInsights(false), 450);
  }

  function handleAnalyzeCalculationInChat() {
    const prompt = `I modeled an investment of AED ${Number(
      calcPrice
    ).toLocaleString()} in ${calcCommunity} (${
      calcRentalMode === "short_term"
        ? "Holiday Home Short-Term"
        : "Long-Term Tenancy"
    }). The projected gross yield is ${yieldResults.grossYield}% and net yield is ${
      yieldResults.netYield
    }%. Can you give me your professional advisory analysis of this scenario?`;
    setAiTab("chat");
    setTimeout(() => {
      handleSend(prompt);
    }, 150);
  }

  function handleSendWhatsApp(e) {
    if (e) e.preventDefault();
    const textToSend = customMsg.trim() || currentAdvisor.defaultText;
    const url = `https://wa.me/${currentAdvisor.whatsappNum}?text=${encodeURIComponent(
      textToSend
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setActiveModal(null);
    setCustomMsg("");
  }

  const fmtAED = (n) => `AED ${Number(n).toLocaleString()}`;

  return (
    <aside aria-label="Quick contact and AI tools" className="fixed z-50 right-4 bottom-5 sm:right-6 sm:bottom-6 font-sans flex flex-col items-end pointer-events-none select-none">
      {/* ================= MODAL OVERLAYS (AI CHAT / WHATSAPP) ================= */}
      <div className="pointer-events-auto">
        {/* ================= 1. AI ADVISORY MODAL ================= */}
        {activeModal === "ai" && (
          <div className="mb-3 w-[360px] sm:w-[440px] max-w-[94vw] h-[600px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-4 flex items-center justify-between shrink-0 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-br from-[#dfbb73] via-[#b3975b] to-slate-900 shadow-md">
                  <img
                    src="/ai-advisor-3d.svg"
                    alt="NCR 3D AI Advisor"
                    className="w-full h-full object-contain rounded-xl drop-shadow-md"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white tracking-wide">
                      NCR Advisory AI
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                      Live DLD
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Rental Yield Calculator & Market Transactions
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
                aria-label="Close AI Concierge"
              >
                <HiOutlineXMark className="text-lg" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-slate-100/95 p-1.5 grid grid-cols-3 gap-1 shrink-0 border-b border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAiTab("chat")}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  aiTab === "chat"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <HiOutlineChatBubbleLeftRight className="text-sm text-[#b3975b]" />
                <span>AI Concierge</span>
              </button>

              <button
                type="button"
                onClick={() => setAiTab("calculator")}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  aiTab === "calculator"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <HiOutlineCalculator className="text-sm text-[#b3975b]" />
                <span>Rental ROI</span>
              </button>

              <button
                type="button"
                onClick={() => setAiTab("insights")}
                className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  aiTab === "insights"
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <HiOutlineChartBar className="text-sm text-[#b3975b]" />
                <span>DLD Insights</span>
              </button>
            </div>

            {/* TAB 1: AI CHAT */}
            {aiTab === "chat" && (
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
                {/* Quick Prompts */}
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

                {/* Message stream */}
                <div
                  ref={boxRef}
                  className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60"
                >
                  {messages.map((m, idx) => {
                    const isUser = m.role === "user";
                    return (
                      <div
                        key={idx}
                        className={`flex ${
                          isUser ? "justify-end" : "justify-start"
                        }`}
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
                    <div className="flex flex-col items-start gap-2 animate-fadeIn">
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 rounded-bl-xs shadow-xs w-[85%] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b3975b] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#b3975b]"></span>
                            </span>
                            <span className="text-[11px] font-semibold text-slate-700">
                              Analyzing DLD Market Data...
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Gemini 3.8</span>
                        </div>

                        {/* Skeleton lines with subtle shimmer */}
                        <div className="space-y-1.5 animate-pulse">
                          <div className="h-2.5 bg-slate-200/80 rounded-md w-full" />
                          <div className="h-2.5 bg-slate-200/70 rounded-md w-[88%]" />
                          <div className="h-2.5 bg-slate-200/60 rounded-md w-[65%]" />
                        </div>

                        {/* Dynamic Progress indicator track */}
                        <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden mt-1">
                          <div className="bg-gradient-to-r from-[#b3975b] via-[#dfbb73] to-[#b3975b] h-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
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
                      className="w-10 h-10 rounded-xl bg-[#b3975b] hover:bg-[#9e824c] disabled:opacity-40 text-white flex items-center justify-center transition shrink-0 shadow-sm"
                      aria-label="Send"
                    >
                      <HiOutlinePaperAirplane className="text-base" />
                    </button>
                  </form>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Grounded with DLD Open Data • Gemini 3.8</span>
                    <button
                      type="button"
                      onClick={() => setActiveModal("whatsapp")}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                    >
                      <FaWhatsapp className="text-xs" />
                      <span>Switch to WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RENTAL CALCULATOR */}
            {aiTab === "calculator" && (
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Property Configuration
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-[#b3975b] border border-amber-200 font-semibold">
                      DLD Yield Benchmarks
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Dubai Community
                    </label>
                    <select
                      value={calcCommunity}
                      onChange={(e) => handleCommunityChange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#b3975b]"
                    >
                      {Object.keys(DUBAI_COMMUNITY_DATA).map((comm) => (
                        <option key={comm} value={comm}>
                          {comm}
                        </option>
                      ))}
                    </select>
                  </div>

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

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Rental Strategy
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStrategyChange("long_term")}
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
                        onClick={() => handleStrategyChange("short_term")}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition text-center ${
                          calcRentalMode === "short_term"
                            ? "bg-[#b3975b] text-white border-[#b3975b]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        Holiday Home (+25-35%)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Yield Card Summary */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-md space-y-4 relative overflow-hidden">
                  {isCalculating ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="space-y-2">
                          <div className="h-3 w-16 bg-white/20 rounded" />
                          <div className="h-8 w-24 bg-[#b3975b]/30 rounded-lg" />
                        </div>
                        <div className="space-y-2 text-right">
                          <div className="h-3 w-28 bg-white/20 rounded ml-auto" />
                          <div className="h-8 w-24 bg-emerald-500/30 rounded-lg ml-auto" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl p-3 space-y-2">
                          <div className="h-2.5 w-20 bg-white/20 rounded" />
                          <div className="h-5 w-24 bg-white/30 rounded" />
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 space-y-2">
                          <div className="h-2.5 w-20 bg-white/20 rounded" />
                          <div className="h-5 w-24 bg-white/30 rounded" />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <div className="h-3 w-full bg-white/10 rounded" />
                        <div className="h-3 w-4/5 bg-white/10 rounded" />
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs text-[#dfbb73] font-medium py-1">
                        <span className="w-2 h-2 rounded-full bg-[#dfbb73] animate-ping" />
                        <span>Recalculating ROI with official DLD rates...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                            Gross Yield
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

                      <div className="space-y-1.5 text-[11px] border-t border-white/10 pt-3 text-slate-300">
                        <div className="flex justify-between">
                          <span>4% DLD Transfer Fee:</span>
                          <span className="font-medium text-white">
                            {fmtAED(yieldResults.dldFee)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Annual Service Charges:</span>
                          <span className="font-medium text-white">
                            {fmtAED(yieldResults.annualServiceCharge)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Acquisition Outlay:</span>
                          <span className="font-bold text-[#b3975b]">
                            {fmtAED(yieldResults.totalAcquisitionCost)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}

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
                    className="w-full py-2.5 bg-[#b3975b] hover:bg-[#9e824c] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <HiOutlineSparkles className="text-sm" />
                    <span>Deep-Analyze in AI Chat</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: DLD INSIGHTS */}
            {aiTab === "insights" && (
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      DLD Area Records
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Verified
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(DUBAI_COMMUNITY_DATA).map((comm) => (
                      <button
                        key={comm}
                        type="button"
                        onClick={() => handleSelectInsightArea(comm)}
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

                {isFetchingInsights ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-white p-3 rounded-2xl border border-slate-200 text-center space-y-1.5">
                          <div className="h-2.5 w-12 bg-slate-200 rounded mx-auto" />
                          <div className="h-4 w-16 bg-slate-300 rounded mx-auto" />
                        </div>
                      ))}
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="h-3 w-36 bg-slate-200 rounded" />
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                      </div>
                      <div className="space-y-2.5">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                            <div className="flex justify-between">
                              <div className="h-3.5 w-28 bg-slate-200 rounded" />
                              <div className="h-3.5 w-20 bg-amber-200/80 rounded" />
                            </div>
                            <div className="flex justify-between">
                              <div className="h-2.5 w-32 bg-slate-200 rounded" />
                              <div className="h-2.5 w-16 bg-slate-200 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 py-1">
                      <span className="w-2 h-2 rounded-full bg-[#b3975b] animate-ping" />
                      <span>Fetching verified DLD transactions for {selectedInsightArea}...</span>
                    </div>
                  </div>
                ) : (() => {
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

                      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Recent Transactions: {selectedInsightArea}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            Official Registry
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {data.latestTransactions.map((tx, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">
                                  {tx.project}
                                </span>
                                <span className="font-bold text-[#b3975b]">
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

                              <div className="text-[10px] text-slate-400 pt-0.5">
                                Type: {tx.type}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ================= 2. WHATSAPP MODAL ================= */}
        {activeModal === "whatsapp" && (
          <div className="mb-3 w-[340px] sm:w-[380px] max-w-[92vw] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white p-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl p-0.5 bg-white/20 shadow-md">
                  <img
                    src="/whatsapp-3d.svg"
                    alt="3D WhatsApp Advisor"
                    className="w-full h-full object-contain rounded-xl drop-shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base leading-tight">
                      WhatsApp Advisory
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Direct line to licensed NCR specialists
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white flex items-center justify-center transition"
                aria-label="Close WhatsApp Advisor"
              >
                <HiOutlineXMark className="text-lg" />
              </button>
            </div>

            {/* Select Destination */}
            <div className="p-4 bg-slate-50 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Select Department:
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                {advisors.map((adv) => (
                  <button
                    key={adv.id}
                    onClick={() => {
                      setSelectedAgent(adv.id);
                      setCustomMsg("");
                    }}
                    className={`p-2 rounded-xl text-left transition border ${
                      selectedAgent === adv.id
                        ? "bg-white border-emerald-500 shadow-sm text-slate-900"
                        : "bg-white/60 border-slate-200/80 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <div className="text-lg mb-0.5">{adv.avatar}</div>
                    <div className="text-[11px] font-bold truncate leading-tight">
                      {adv.name.split(" ")[0]}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {adv.tag}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Advisor Details & Form */}
            <div className="p-5 bg-white space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  {currentAdvisor.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {currentAdvisor.name}
                  </div>
                  <div className="text-xs text-emerald-800 font-medium truncate">
                    {currentAdvisor.role}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSendWhatsApp} className="space-y-3">
                <label className="block text-xs font-semibold text-slate-600">
                  Your inquiry message:
                </label>
                <textarea
                  rows={3}
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder={currentAdvisor.defaultText}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 text-xs text-slate-800 placeholder:text-slate-400 resize-none leading-relaxed"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <FaWhatsapp className="text-base" />
                  <span>Start WhatsApp Chat</span>
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Direct Dubai phone: {currentAdvisor.phone}</span>
                <span className="text-emerald-700 font-semibold">Online</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= RIGHT-SIDE STACKED FLOATING DOCK (UN-CLUSTERED, PREMIUM) ================= */}
      <div className="pointer-events-auto flex flex-col items-end gap-2.5">
        {/* Top Button: AI Advisory (with custom 3D sphere graphic) */}
        {/* <button
          type="button"
          onClick={() =>
            setActiveModal(activeModal === "ai" ? null : "ai")
          }
          className={`group flex items-center gap-3 pl-2 pr-4 py-2 rounded-full border shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            activeModal === "ai"
              ? "bg-slate-900 border-[#b3975b] text-white ring-2 ring-[#b3975b]/30 shadow-2xl"
              : "bg-slate-900/95 hover:bg-slate-900 border-white/15 text-white backdrop-blur-md"
          }`}
          aria-label="Open AI Advisory"
        >
          <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-br from-[#dfbb73] to-[#b3975b] flex items-center justify-center shadow-md">
            <img
              src="/ai-advisor-3d.svg"
              alt="3D AI Icon"
              className="w-full h-full object-contain rounded-full transition-transform group-hover:rotate-12 duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs uppercase tracking-wider leading-none text-white">
                AI Advisory
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#b3975b] animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-300 leading-none block mt-1">
              Rental ROI & DLD Live
            </span>
          </div>
        </button> */}

        {/* Bottom Button: WhatsApp Desk (with custom 3D emerald sphere graphic) */}
        <button
          type="button"
          onClick={() =>
            setActiveModal(activeModal === "whatsapp" ? null : "whatsapp")
          }
          className={`group flex items-center gap-3 pl-2 pr-4 py-2 rounded-full border shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            activeModal === "whatsapp"
              ? "bg-emerald-700 border-emerald-400 text-white ring-2 ring-emerald-400/40 shadow-2xl"
              : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 border-emerald-400/30 text-white"
          }`}
          aria-label="Open WhatsApp Desk"
        >
          <div className="w-9 h-9 rounded-full p-0.5 bg-emerald-300 flex items-center justify-center shadow-md">
            <img
              src="/whatsapp-3d.svg"
              alt="3D WhatsApp Icon"
              className="w-full h-full object-contain rounded-full transition-transform group-hover:scale-110 duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs uppercase tracking-wider leading-none text-white">
                WhatsApp Desk
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
            <span className="text-[10px] text-emerald-100 leading-none block mt-1">
              Connect in 10 mins
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
