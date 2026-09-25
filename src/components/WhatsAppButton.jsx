import { useState } from "react";
import {
  FaWhatsapp,
  FaTimes,
  FaPaperPlane,
  FaPhoneAlt,
  FaUserTie,
  FaHandHoldingUsd,
  FaGlobeAsia,
} from "react-icons/fa";

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState("general");
  const [customMsg, setCustomMsg] = useState("");

  // Official verified contact numbers
  // Note: Standard international format for UAE is +971...
  const advisors = [
    {
      id: "general",
      name: "NCR VIP Advisory Desk",
      role: "Luxury Sales & Off-Plan Launches",
      phone: "+97143999999", // WhatsApp enabled number
      whatsappNum: "97143999999",
      avatar: "🏛️",
      defaultText:
        "Hello NCR Properties, I would like to speak with an investment advisor regarding prime UAE real estate.",
    },
    {
      id: "mortgages",
      name: "Afaq Ahmed",
      role: "Director - Mortgages & Finance",
      phone: "+971501234567",
      whatsappNum: "971501234567",
      avatar: "💼",
      defaultText:
        "Hello Afaq, I would like to inquire about UAE mortgage eligibility, non-resident home loans, and pre-approval.",
    },
    {
      id: "nri",
      name: "NCR NRI Desk 🇮🇳",
      role: "Cross-Border India & Dubai Advisory",
      phone: "+919811054321",
      whatsappNum: "919811054321",
      avatar: "🇮🇳",
      defaultText:
        "Hello NCR Properties, I am an NRI looking for property investment advisory across Delhi NCR, Tricity, or Dubai.",
    },
  ];

  const currentAdvisor =
    advisors.find((a) => a.id === selectedAgent) || advisors[0];

  function handleSendWhatsApp(e) {
    if (e) e.preventDefault();
    const textToSend = customMsg.trim() || currentAdvisor.defaultText;
    const url = `https://wa.me/${currentAdvisor.whatsappNum}?text=${encodeURIComponent(
      textToSend
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setCustomMsg("");
  }

  function handleDirectWhatsApp() {
    const url = `https://wa.me/${currentAdvisor.whatsappNum}?text=${encodeURIComponent(
      currentAdvisor.defaultText
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="fixed z-50 left-5 bottom-6 md:left-8 md:bottom-8 font-sans">
      {/* Expanded WhatsApp Modal / Drawer Popup */}
      {isOpen && (
        <div className="mb-3 w-[340px] sm:w-[380px] max-w-[92vw] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shadow-inner">
                <FaWhatsapp className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base leading-tight">
                    WhatsApp Advisory
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                </div>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Direct line to licensed NCR advisors
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              aria-label="Close"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>

          {/* Body: Select Destination */}
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Advisory Department:
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
                    {adv.id === "general"
                      ? "VIP Sales"
                      : adv.id === "mortgages"
                      ? "Mortgages"
                      : "NRI Desk"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Advisor Details & Message Box */}
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
                Your message to advisor:
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
              <span>Typically replies within 10 minutes</span>
              <span className="text-emerald-700 font-semibold">Online</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="WhatsApp with an advisor"
        >
          <div className="relative">
            <FaWhatsapp className="text-2xl" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-emerald-600 animate-ping" />
          </div>

          <span className="font-bold text-xs uppercase tracking-wider hidden sm:inline-block">
            WhatsApp
          </span>
        </button>

        {!isOpen && (
          <div className="hidden lg:block bg-slate-900/90 backdrop-blur text-white text-[11px] px-3 py-1.5 rounded-full shadow border border-slate-800 pointer-events-none animate-fadeIn">
            Instant Advisor Chat 💬
          </div>
        )}
      </div>
    </div>
  );
}
