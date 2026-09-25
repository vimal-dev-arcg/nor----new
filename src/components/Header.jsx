import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { appStore } from "../lib/appStore";
import { getToken, clearToken, isLoggedIn } from "../lib/auth";
import headerlogo from "../img/logos/logo5.png";

const baseLink =
  "text-slate-700 hover:text-[#b3975b] transition pb-1 border-b-2 border-transparent leading-none inline-flex items-center whitespace-nowrap";
const activeLink =
  "text-[#b3975b] border-[#b3975b] pb-1 border-b-2 leading-none inline-flex items-center whitespace-nowrap";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [indiaOpen, setIndiaOpen] = useState(false);

  const [buyRentOpen, setBuyRentOpen] = useState(false);
  const buyRentCloseTimer = useRef(null);

  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const mode = new URLSearchParams(search).get("mode");

  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [currentUser, setCurrentUser] = useState(appStore.getCurrentUser());

  useEffect(() => {
    const handleAuthCheck = () => {
      setLoggedIn(isLoggedIn());
      setCurrentUser(appStore.getCurrentUser());
    };

    const unsub = appStore.subscribe(() => {
      handleAuthCheck();
    });

    handleAuthCheck();
    window.addEventListener("storage", handleAuthCheck);
    return () => {
      unsub();
      window.removeEventListener("storage", handleAuthCheck);
    };
  }, [pathname]);

  const handleLogout = () => {
    clearToken();
    setLoggedIn(false);
    setOpen(false);
    navigate("/login");
  };

  const isSellActive = pathname === "/listings" && mode === "Sell";
  const isIndiaActive = pathname.startsWith("/india");

  const isBuyRentActive =
    pathname === "/sell-or-rent-out-property" ||
    pathname === "/commercial" ||
    (pathname === "/listings" && (mode === "Buy" || mode === "Rent" || !mode));

  const linkClass = (active) => (active ? activeLink : baseLink);
  const navClass = ({ isActive }) => (isActive ? activeLink : baseLink);

  const openBuyRent = () => {
    if (buyRentCloseTimer.current) clearTimeout(buyRentCloseTimer.current);
    setBuyRentOpen(true);
  };

  const closeBuyRent = () => {
    if (buyRentCloseTimer.current) clearTimeout(buyRentCloseTimer.current);
    buyRentCloseTimer.current = setTimeout(() => setBuyRentOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="mx-auto max-w-7xl 2xl:max-w-[1320px] px-4 sm:px-6 lg:px-8 h-[5.5rem] flex items-center justify-between gap-3">
          {/* Logo */}
          <NavLink 
            to="/" 
            className="inline-flex items-center group block"
            style={{ lineHeight: 0 }}
          >
            <img
              src={headerlogo}
              alt="NCR Properties"
              style={{ height: "5rem", width: "auto" }}
              className="object-contain transition-transform duration-300 group-hover:scale-[1.02] sm:h-[8.5rem]"
            />
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5 ml-auto">
            <nav className="flex items-center gap-4 xl:gap-6 text-[12px] xl:text-[13px] uppercase tracking-[0.2em] xl:tracking-widest leading-none">
              {/* 1) New Launch */}
              <NavLink
      to="/new-launch" // Updated to use the new route
      className={baseLink}
    >
      New Launch
    </NavLink>

              {/* 2) BUY/SELL dropdown */}
              <div
                className="relative inline-flex items-center"
                onMouseEnter={openBuyRent}
                onMouseLeave={closeBuyRent}
              >
                <NavLink
                  to="/sell-or-rent-out-property"
                  className={() => linkClass(isBuyRentActive || isSellActive)}
                  aria-haspopup="menu"
                  aria-expanded={buyRentOpen}
                >
                  BUY/SELL
                </NavLink>

                {/* {buyRentOpen && (
                  <div className="absolute left-0 top-full z-50 pt-3">
                    <div className="w-60 rounded-2xl border border-slate-100 bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden p-1.5 space-y-1">
                      <NavLink
                        to="/listings?mode=Buy"
                        className={({ isActive }) =>
                          `block px-4 py-2.5 rounded-xl text-xs font-semibold tracking-normal transition-all ${
                            isActive
                              ? "bg-[#b3975b]/15 text-[#b3975b]"
                              : "text-slate-700 hover:bg-[#b3975b]/10 hover:text-[#b3975b]"
                          }`
                        }
                      >
                        Buy Properties
                      </NavLink>
                      <NavLink
                        to="/listings?mode=Sell"
                        className={({ isActive }) =>
                          `block px-4 py-2.5 rounded-xl text-xs font-semibold tracking-normal transition-all ${
                            isActive
                              ? "bg-[#b3975b]/15 text-[#b3975b]"
                              : "text-slate-700 hover:bg-[#b3975b]/10 hover:text-[#b3975b]"
                          }`
                        }
                      >
                        Sell Property
                      </NavLink>
                      <NavLink
                        to="/listings?mode=Rent"
                        className={({ isActive }) =>
                          `block px-4 py-2.5 rounded-xl text-xs font-semibold tracking-normal transition-all ${
                            isActive
                              ? "bg-[#b3975b]/15 text-[#b3975b]"
                              : "text-slate-700 hover:bg-[#b3975b]/10 hover:text-[#b3975b]"
                          }`
                        }
                      >
                        Rent Properties
                      </NavLink>
                    </div>
                  </div>
                )} */}
              </div>

              {/* 3) BLOGS */}
              <NavLink to="/blog" className={navClass}>
                BLOGS
              </NavLink>

              {/* 4) OUR TEAM */}
              <NavLink to="/agents" className={navClass}>
                OUR TEAM
              </NavLink>

              {/* 5) CAREER */}
              <NavLink to="/career" className={navClass}>
                CAREER
              </NavLink>

              {/* 6) ABOUT US */}
              <NavLink to="/about" className={navClass}>
                ABOUT US
              </NavLink>

              {/* 7) Contact US */}
              <NavLink to="/contact" className={navClass}>
                Contact US
              </NavLink>

              {/* 8) NRI Desk 🇮🇳 */}
              <div
                className="relative inline-flex items-center"
                onMouseEnter={() => setIndiaOpen(true)}
                onMouseLeave={() => setIndiaOpen(false)}
              >
                <NavLink
                  to="/india"
                  className={`px-3 py-1.5 rounded-full border transition-all duration-200 inline-flex items-center gap-1.5 whitespace-nowrap text-xs ${
                    isIndiaActive
                      ? "bg-[#b3975b] text-white border-[#b3975b] shadow-md shadow-[#b3975b]/20 font-bold"
                      : "bg-[#b3975b]/10 text-[#b3975b] border-[#b3975b]/30 hover:bg-[#b3975b] hover:text-white hover:border-[#b3975b] font-semibold"
                  }`}
                  aria-haspopup="menu"
                  aria-expanded={indiaOpen}
                >
                  <span>NRI Desk</span> 🇮🇳
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${
                      indiaOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </NavLink>

                {indiaOpen && (
                  <div className="absolute right-0 lg:left-0 top-full z-50 pt-2.5">
                    <div className="w-72 rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-xl shadow-xl overflow-hidden p-1.5 space-y-1">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        India Prime Corridors
                      </div>
                      <NavLink
                        to="/india?city=Delhi%20NCR"
                        className={({ isActive }) =>
                          `block px-3.5 py-2 rounded-lg text-xs font-medium tracking-normal transition-all ${
                            isActive
                              ? "bg-[#b3975b]/15 text-[#b3975b] font-semibold"
                              : "text-slate-700 hover:bg-[#b3975b]/10 hover:text-[#b3975b]"
                          }`
                        }
                      >
                        Delhi NCR (Gurgaon / Golf Course)
                      </NavLink>
                      <NavLink
                        to="/india?city=Tricity"
                        className={({ isActive }) =>
                          `block px-3.5 py-2 rounded-lg text-xs font-medium tracking-normal transition-all ${
                            isActive
                              ? "bg-[#b3975b]/15 text-[#b3975b] font-semibold"
                              : "text-slate-700 hover:bg-[#b3975b]/10 hover:text-[#b3975b]"
                          }`
                        }
                      >
                        Tricity (Chandigarh • Panchkula • Mohali)
                      </NavLink>
                      <NavLink
                        to="/india?city=Bangalore"
                        className={({ isActive }) =>
                          `block px-3.5 py-2 rounded-lg text-xs font-medium tracking-normal transition-all ${
                            isActive
                              ? "bg-[#b3975b]/15 text-[#b3975b] font-semibold"
                              : "text-slate-700 hover:bg-[#b3975b]/10 hover:text-[#b3975b]"
                          }`
                        }
                      >
                        Bangalore Tech Corridor
                      </NavLink>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {loggedIn && currentUser ? (
              <div className="flex items-center gap-2.5">
                <NavLink
                  to={
                    currentUser.role === "super_admin"
                      ? "/admin"
                      : currentUser.role === "dealer"
                      ? "/dashboard/dealer"
                      : currentUser.role === "finance"
                      ? "/dashboard/finance"
                      : currentUser.role === "buyer"
                      ? "/dashboard/buyer"
                      : "/dashboard/checker"
                  }
                  className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white hover:bg-[#b3975b] text-[11px] font-bold tracking-wider transition whitespace-nowrap inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>Dashboard</span>
                  <span className="text-xs">→</span>
                </NavLink>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-[11px] font-bold tracking-wider transition whitespace-nowrap inline-flex items-center gap-1"
                  title="Sign out of current account"
                >
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? "btn-primary whitespace-nowrap"
                      : "btn-outline whitespace-nowrap"
                  }
                >
                  Login
                </NavLink>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 hover:bg-slate-50 transition shadow-sm"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            type="button"
          >
            <span className="sr-only">Open menu</span>
            <div className="flex flex-col gap-1.5 w-5">
              <span className="w-full h-0.5 bg-slate-800 rounded-full block" />
              <span className="w-full h-0.5 bg-slate-800 rounded-full block" />
              <span className="w-full h-0.5 bg-slate-800 rounded-full block" />
            </div>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-[90%] max-w-sm sm:max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col">
            {/* Top Header inside Drawer */}
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-[0.25em] text-slate-400 font-medium">
                  Welcome
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Navigation Menu
                </h3>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-100 transition"
                type="button"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Links */}
            <div className="p-6 sm:p-8 overflow-auto flex-1">
              <nav className="flex flex-col gap-4 text-base font-medium">
                {/* 1) New Launch */}
                <a
                  href="/#latest-launches"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    if (pathname === "/") {
                      const el =
                        document.getElementById("latest-launches") ||
                        document.getElementById("new-launches");
                      if (el) {
                        const y =
                          el.getBoundingClientRect().top +
                          window.pageYOffset -
                          96;
                        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
                      }
                    } else {
                      navigate("/#latest-launches");
                    }
                  }}
                  className="py-1 text-slate-800 hover:text-[#b3975b] font-semibold text-sm uppercase tracking-wider"
                >
                  New Launch
                </a>

                {/* 2) BUY/SELL */}
                <div>
                  <NavLink
                    to="/sell-or-rent-out-property"
                    className="block py-1 text-slate-800 hover:text-[#b3975b] font-semibold text-sm uppercase tracking-wider"
                    onClick={() => setOpen(false)}
                  >
                    BUY/SELL
                  </NavLink>

                  <div className="pl-3 mt-1 space-y-1.5 border-l-2 border-slate-100 text-xs">
                    <NavLink
                      to="/listings?mode=Buy"
                      className="block text-slate-600 hover:text-[#b3975b] py-1 font-medium"
                      onClick={() => setOpen(false)}
                    >
                      • Buy Properties
                    </NavLink>
                    <NavLink
                      to="/listings?mode=Sell"
                      className="block text-slate-600 hover:text-[#b3975b] py-1 font-medium"
                      onClick={() => setOpen(false)}
                    >
                      • Sell Property
                    </NavLink>
                    <NavLink
                      to="/listings?mode=Rent"
                      className="block text-slate-600 hover:text-[#b3975b] py-1 font-medium"
                      onClick={() => setOpen(false)}
                    >
                      • Rent Properties
                    </NavLink>
                  </div>
                </div>

                {/* 3) BLOGS */}
                <NavLink
                  to="/blog"
                  className={navClass}
                  onClick={() => setOpen(false)}
                >
                  BLOGS
                </NavLink>

                {/* 4) OUR TEAM */}
                <NavLink
                  to="/agents"
                  className={navClass}
                  onClick={() => setOpen(false)}
                >
                  OUR TEAM
                </NavLink>

                {/* 5) CAREER */}
                <NavLink
                  to="/career"
                  className={navClass}
                  onClick={() => setOpen(false)}
                >
                  CAREER
                </NavLink>

                {/* 6) ABOUT US */}
                <NavLink
                  to="/about"
                  className={navClass}
                  onClick={() => setOpen(false)}
                >
                  ABOUT US
                </NavLink>

                {/* 7) Contact US */}
                <NavLink
                  to="/contact"
                  className={navClass}
                  onClick={() => setOpen(false)}
                >
                  Contact US
                </NavLink>

                <div className="h-px bg-slate-100 my-1" />

                {/* 8) NRI Desk 🇮🇳 */}
                <NavLink
                  to="/india"
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isIndiaActive
                      ? "bg-[#b3975b] text-white border-[#b3975b] shadow-md"
                      : "bg-[#b3975b]/10 text-[#b3975b] border-[#b3975b]/30"
                  }`}
                >
                  <span className="font-semibold uppercase tracking-wider text-sm">
                    NRI Desk
                  </span>
                  <span className="text-lg">🇮🇳</span>
                </NavLink>

                <div className="pl-3 -mt-2 mb-1 space-y-1.5 border-l-2 border-[#b3975b]/30 text-xs">
                  <NavLink
                    to="/india?city=Delhi%20NCR"
                    className="block text-slate-600 hover:text-[#b3975b] py-1 font-medium"
                    onClick={() => setOpen(false)}
                  >
                    • Delhi NCR (Gurgaon / Golf Course)
                  </NavLink>
                  <NavLink
                    to="/india?city=Tricity"
                    className="block text-slate-600 hover:text-[#b3975b] py-1 font-medium"
                    onClick={() => setOpen(false)}
                  >
                    • Tricity (Chandigarh • Panchkula • Mohali)
                  </NavLink>
                  <NavLink
                    to="/india?city=Bangalore"
                    className="block text-slate-600 hover:text-[#b3975b] py-1 font-medium"
                    onClick={() => setOpen(false)}
                  >
                    • Bangalore Tech Corridor
                  </NavLink>
                </div>

                <div className="h-px bg-slate-100 my-1" />

                {loggedIn && currentUser ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#b3975b]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-900 truncate text-sm">
                          {currentUser.name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {currentUser.roleTitle || currentUser.role}
                        </div>
                      </div>
                    </div>

                    <NavLink
                      to={
                        currentUser.role === "super_admin"
                          ? "/admin"
                          : currentUser.role === "dealer"
                          ? "/dashboard/dealer"
                          : currentUser.role === "finance"
                          ? "/dashboard/finance"
                          : currentUser.role === "buyer"
                          ? "/dashboard/buyer"
                          : "/dashboard/checker"
                      }
                      onClick={() => setOpen(false)}
                      className="btn-primary w-full text-center block py-2.5 rounded-xl shadow font-bold text-sm"
                    >
                      Open Dashboard
                    </NavLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 text-sm transition flex items-center justify-center gap-2"
                    >
                      <span>Sign Out (Logout)</span>
                      <span>🚪</span>
                    </button>
                  </div>
                ) : (
                  <NavLink
                    to="/login"
                    className={navClass}
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </NavLink>
                )}
              </nav>
            </div>

            {/* Sticky Bottom CTA */}
            <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50">
              <NavLink
                to="/contact"
                onClick={() => setOpen(false)}
                className="btn-primary w-full text-center block py-3 rounded-xl shadow-md"
              >
                Speak to an Advisor
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
