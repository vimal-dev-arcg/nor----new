import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { appStore, PERSONAS } from "../lib/appStore";
import { switchRole, isLoggedIn, clearToken } from "../lib/auth";
import {
  FaCrown,
  FaShieldAlt,
  FaBuilding,
  FaUser,
  FaWallet,
  FaExchangeAlt,
  FaCheckCircle,
  FaSignOutAlt,
} from "react-icons/fa";

export default function RolePersonaBar() {
  const [currentRole, setCurrentRole] = useState(appStore.getState().currentUserRole || "super_admin");
  const [currentUser, setCurrentUser] = useState(appStore.getCurrentUser());
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const syncUser = () => {
      const state = appStore.getState();
      setCurrentRole(state.currentUserRole || "super_admin");
      setCurrentUser(appStore.getCurrentUser());
      setLoggedIn(isLoggedIn());
    };

    const unsub = appStore.subscribe(syncUser);
    syncUser();
    window.addEventListener("storage", syncUser);
    return () => {
      unsub();
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleRoleChange = (role) => {
    switchRole(role);
    setIsOpen(false);
    if (role === "super_admin") {
      navigate("/admin");
    } else if (role === "checker") {
      navigate("/dashboard/checker");
    } else if (role === "dealer") {
      navigate("/dashboard/dealer");
    } else if (role === "finance") {
      navigate("/dashboard/finance");
    } else if (role === "buyer") {
      navigate("/dashboard/buyer");
    }
  };

  const handleLogout = () => {
    clearToken();
    setLoggedIn(false);
    setIsOpen(false);
    navigate("/login");
  };

  const currentPersona = PERSONAS[currentRole] || PERSONAS.super_admin;
  const displayName = currentUser?.name?.split(" ")[0] || currentPersona.name?.split(" ")[0] || "User";
  const displayRoleLabel =
    currentRole === "super_admin"
      ? "Admin"
      : currentRole === "dealer"
      ? "Agent"
      : currentRole === "finance"
      ? "Finance"
      : currentRole === "buyer"
      ? "Buyer"
      : "Checker";

  const roleIcons = {
    super_admin: <FaCrown className="text-amber-400" />,
    checker: <FaShieldAlt className="text-cyan-400" />,
    finance: <FaWallet className="text-emerald-400" />,
    dealer: <FaBuilding className="text-teal-400" />,
    buyer: <FaUser className="text-blue-400" />,
  };

  return (
    <aside aria-label="Active user and role switcher" className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {/* Dropdown / Switcher Modal */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700 shadow-2xl p-4 text-white animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#b3975b]">
                Active Persona & Hub
              </p>
              <p className="text-[11px] text-slate-400">
                Switch real-time permissions & view dashboard
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Sync
            </span>
          </div>

          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
            {Object.entries(PERSONAS).map(([roleKey, persona]) => {
              const isActive = currentRole === roleKey;
              return (
                <button
                  key={roleKey}
                  onClick={() => handleRoleChange(roleKey)}
                  className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 ${
                    isActive
                      ? "bg-slate-800/90 border-[#b3975b] ring-1 ring-[#b3975b]"
                      : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 border border-slate-600">
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="text-xs">{roleIcons[roleKey]}</div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white truncate">
                        {persona.name}
                      </span>
                      {isActive && (
                        <FaCheckCircle className="text-[#b3975b] text-xs shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {persona.roleTitle}
                    </p>
                  </div>

                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/80 text-amber-300 font-mono">
                    {persona.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Dashboard Links */}
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[11px]">
            <NavLink
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 flex items-center gap-1.5 justify-center transition"
            >
              <FaCrown className="text-[10px]" /> Super Admin
            </NavLink>
            <NavLink
              to="/dashboard/checker"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 flex items-center gap-1.5 justify-center transition"
            >
              <FaShieldAlt className="text-[10px]" /> Checker
            </NavLink>
            <NavLink
              to="/dashboard/dealer"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 flex items-center gap-1.5 justify-center transition"
            >
              <FaBuilding className="text-[10px]" /> Agent / Dealer
            </NavLink>
            <NavLink
              to="/dashboard/buyer"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1.5 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 flex items-center gap-1.5 justify-center transition"
            >
              <FaUser className="text-[10px]" /> Buyer Hub
            </NavLink>
          </div>

          {loggedIn && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition py-1 px-2 rounded-lg hover:bg-rose-950/40"
              >
                <FaSignOutAlt className="text-[11px]" />
                Sign Out ({displayName})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Bottom-Right Active User Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-900 border border-slate-700 shadow-2xl backdrop-blur-xl text-white transition transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Click to switch active role or open dashboard"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-emerald-400">Active:</span>
              <span className="text-xs font-bold text-white flex items-center gap-1">
                {displayName}
                <span className="text-[10px] font-semibold text-slate-300 px-1.5 py-0.2 rounded-full bg-slate-800 border border-slate-700">
                  {displayRoleLabel}
                </span>
              </span>
            </div>
            <div className="text-[9px] text-[#b3975b] font-medium">
              {currentPersona.badge || "Verified"} • Switch Role ▾
            </div>
          </div>
        </div>
        <div className="ml-1 pl-2 border-l border-slate-700 text-slate-400 group-hover:text-white transition">
          <FaExchangeAlt className="text-xs" />
        </div>
      </button>
    </aside>
  );
}
