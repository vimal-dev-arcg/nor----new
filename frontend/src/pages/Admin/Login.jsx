import axios from "axios";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { loginAsRole, setToken } from "../../lib/auth";
import { appStore, PERSONAS } from "../../lib/appStore";
import confetti from "canvas-confetti";
import {
  FaLock,
  FaEnvelope,
  FaUser,
  FaBuilding,
  FaArrowRight,
  FaCheckCircle,
  FaTag,
  FaPhoneAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";


export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("sudhir@ncrproperties.ae");
  const [loginPassword, setLoginPassword] = useState("••••••••");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Sign Up Form State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupRole, setSignupRole] = useState("buyer"); // 'buyer' | 'dealer'
  const [signupAgency, setSignupAgency] = useState("");
  const [signupLicense, setSignupLicense] = useState("");
  const [signupReference, setSignupReference] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState("");
  const [signupError, setSignupError] = useState("");

  // Quick Demo Auto-Fill
  const handleQuickDemo = (roleKey) => {
    const persona = PERSONAS[roleKey];
    if (persona) {
      setLoginEmail(persona.email);
      setLoginPassword("password123");
    }
  };

  // Execute Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    setTimeout(() => {
      // Find role matching email or default
      let matchedRole = "super_admin";
      if (loginEmail.toLowerCase().includes("finance") || loginEmail.toLowerCase().includes("ananya")) {
        matchedRole = "finance";
      } else if (loginEmail.toLowerCase().includes("dealer") || loginEmail.toLowerCase().includes("vikram")) {
        matchedRole = "dealer";
      } else if (loginEmail.toLowerCase().includes("checker") || loginEmail.toLowerCase().includes("navjeet")) {
        matchedRole = "checker";
      } else if (loginEmail.toLowerCase().includes("buyer") || loginEmail.toLowerCase().includes("rahul") || loginEmail.toLowerCase().includes("gmail")) {
        matchedRole = "buyer";
      } else if (loginEmail.toLowerCase().includes("sudhir") || loginEmail.toLowerCase().includes("admin")) {
        matchedRole = "super_admin";
      }

      appStore.setCurrentRole(matchedRole);
      loginAsRole(matchedRole);
      setToken(`ncr_auth_${matchedRole}_${Date.now()}`);
      setLoginLoading(false);

      if (matchedRole === "super_admin") {
        navigate("/admin");
      } else if (matchedRole === "finance") {
        navigate("/dashboard/finance");
      } else if (matchedRole === "checker") {
        navigate("/dashboard/checker");
      } else if (matchedRole === "dealer") {
        navigate("/dashboard/dealer");
      } else {
        navigate("/dashboard/buyer");
      }
    }, 400);
  };

  // Execute Sign Up
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      setSignupError("Please fill in all required fields.");
      return;
    }

    setSignupLoading(true);
    setSignupError("");

    setTimeout(() => {
      try {
        const newUser = appStore.registerUser({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          role: signupRole,
          referenceCode: signupReference,
          phone: signupPhone,
          agencyName: signupAgency,
          licenseNumber: signupLicense,
        });

        loginAsRole(signupRole);
        setToken(`ncr_auth_${signupRole}_${Date.now()}`);
        confetti({ particleCount: 70, spread: 80 });
        setSignupSuccess(
          `Account created successfully! ${signupReference ? "Reference code applied." : ""}`
        );

        setTimeout(() => {
          if (signupRole === "finance") {
            navigate("/dashboard/finance");
          } else if (signupRole === "dealer") {
            navigate("/dashboard/dealer");
          } else {
            navigate("/dashboard/buyer");
          }
        }, 1200);
      } catch (err) {
        setSignupError(err.message || "Failed to create account.");
        setSignupLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto w-full flex flex-col items-center justify-center">
        <div className="w-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
          
          {/* Header & Tabs */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              NCR Properties Portal
            </h1>
            <p className="text-xs text-slate-400">
              {activeTab === "login"
                ? "Enter your credentials to access your account"
                : "Create a new verified member or partner account"}
            </p>

            {/* Toggle Switch */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setSignupSuccess("");
                  setSignupError("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                  activeTab === "login"
                    ? "bg-[#b3975b] text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setLoginError("");
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                  activeTab === "signup"
                    ? "bg-[#b3975b] text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account (Sign Up)
              </button>
            </div>
          </div>

          {/* TAB 1: CLEAN SIGN IN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-200">
              {loginError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address / Username
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-[#b3975b]"
                  />
                  <FaEnvelope className="absolute left-3 top-3 text-slate-500 text-xs" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-[#b3975b] hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-[#b3975b]"
                  />
                  <FaLock className="absolute left-3 top-3 text-slate-500 text-xs" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loginLoading ? "Authenticating..." : "Sign In to Portal"}
                <FaArrowRight className="text-[10px]" />
              </button>

              {/* Subtle Quick Fill for Evaluation */}
              <div className="pt-4 border-t border-slate-800 text-center">
                <p className="text-[11px] text-slate-500 mb-2">Quick Sign-In Autofill:</p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("super_admin")}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-amber-300 border border-slate-800"
                  >
                    Sudhir (Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("finance")}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-emerald-400 border border-slate-800"
                  >
                    Ananya (Finance)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("checker")}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-cyan-300 border border-slate-800"
                  >
                    Navjeet (Checker)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("dealer")}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-teal-300 border border-slate-800"
                  >
                    Vikram (Dealer)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("buyer")}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[11px] text-blue-300 border border-slate-800"
                  >
                    Rahul (Buyer)
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: SIGN UP WITH REFERENCE / REFERRAL */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 animate-in fade-in duration-200 text-xs">
              {signupSuccess && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl flex items-center gap-2">
                  <FaCheckCircle /> {signupSuccess}
                </div>
              )}

              {signupError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl">
                  {signupError}
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Tariq Mansoor"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#b3975b]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#b3975b]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#b3975b]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Choose a strong password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-[#b3975b]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole("buyer")}
                    className={`py-2 px-2 rounded-xl border text-center font-semibold transition text-[11px] ${
                      signupRole === "buyer"
                        ? "bg-blue-500/20 border-blue-500 text-blue-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Buyer / Investor
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole("dealer")}
                    className={`py-2 px-2 rounded-xl border text-center font-semibold transition text-[11px] ${
                      signupRole === "dealer"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Property Dealer
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole("finance")}
                    className={`py-2 px-2 rounded-xl border text-center font-semibold transition text-[11px] ${
                      signupRole === "finance"
                        ? "bg-purple-500/20 border-purple-500 text-purple-300"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    Finance Officer
                  </button>
                </div>
              </div>

              {signupRole === "dealer" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      value={signupAgency}
                      onChange={(e) => setSignupAgency(e.target.value)}
                      placeholder="e.g. Apex Realty LLC"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      RERA License Number
                    </label>
                    <input
                      type="text"
                      value={signupLicense}
                      onChange={(e) => setSignupLicense(e.target.value)}
                      placeholder="e.g. RERA-DLR-9082"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Reference / Referral Code Field */}
              <div className="p-3 bg-gradient-to-r from-amber-500/10 to-slate-950 rounded-xl border border-amber-500/30 space-y-1">
                <label className="block font-semibold text-[#b3975b] flex items-center gap-1.5">
                  <FaTag className="text-xs" />
                  Have a Reference or Referral Code? (Optional)
                </label>
                <input
                  type="text"
                  value={signupReference}
                  onChange={(e) => setSignupReference(e.target.value)}
                  placeholder="e.g. NCR-RAHUL-789 or REF-VIP-2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white uppercase font-mono tracking-wider text-xs focus:ring-1 focus:ring-[#b3975b]"
                />
                <p className="text-[10px] text-slate-400">
                  Enter an agent or investor reference code to unlock welcome rewards and expedited KYC verification.
                </p>
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full py-3 rounded-xl bg-[#b3975b] hover:bg-[#9a8047] text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg mt-2 disabled:opacity-50"
              >
                {signupLoading ? "Creating Account..." : "Create Account & Access Portal"}
              </button>
            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
