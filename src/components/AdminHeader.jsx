// Admin-only header (separate from site Header). Includes Dashboard, Listings, All Properties, Inquiries, Logout.

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "../lib/auth";
import adminLogo from "../img/logos/ncr-logo-nav.svg";
import { FaBars, FaTimes, FaExternalLinkAlt, FaSignOutAlt } from "react-icons/fa";

const baseLink =
  "text-xs uppercase tracking-widest font-medium hover:text-[#b3975b] transition py-2 px-3 rounded-xl";

export default function AdminHeader() {
  const nav = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navClass = ({ isActive }) =>
    isActive
      ? "text-[#b3975b] bg-[#b3975b]/10 font-bold " + baseLink
      : "text-slate-600 hover:bg-slate-100 " + baseLink;

  return (
    <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between min-h-20 py-2">
        {/* Logo & Admin Badge */}
        <div className="flex items-center gap-4">
          <NavLink to="/admin" className="inline-flex items-center gap-3">
            <img
              src={adminLogo}
              alt="NCR Properties Admin"
              className="h-[4.5rem] sm:h-[4rem] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 leading-none">
                NCR Super Admin
              </span>
              <span className="text-[10px] text-[#b3975b] font-mono font-semibold mt-0.5">
                Master Node Control
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1 ml-6 pl-6 border-l border-slate-200">
            <NavLink to="/admin" className={navClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/admin/properties" className={navClass}>
              Property Listings
            </NavLink>
            <NavLink to="/admin/all-properties" className={navClass}>
              All Properties
            </NavLink>
            
            <NavLink to="/admin/inquiries" className={navClass}>
              Inquiries
            </NavLink>
          </nav>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
            onClick={() => nav("/")}
          >
            <FaExternalLinkAlt className="text-xs text-[#b3975b]" /> View Website
          </button>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
            onClick={() => {
              clearToken();
              nav("/login");
            }}
          >
            <FaSignOutAlt className="text-xs text-rose-400" /> Logout
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                isActive ? "bg-[#b3975b]/15 text-[#b3975b]" : "text-slate-700 hover:bg-slate-100"
              }`
            }
            end
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/properties"
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                isActive ? "bg-[#b3975b]/15 text-[#b3975b]" : "text-slate-700 hover:bg-slate-100"
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Property Listings
          </NavLink>
          <NavLink
            to="/admin/all-properties"
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                isActive ? "bg-[#b3975b]/15 text-[#b3975b]" : "text-slate-700 hover:bg-slate-100"
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            All Properties
          </NavLink>
          <NavLink
            to="/financial-dashboard"
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                isActive ? "bg-[#b3975b]/15 text-[#b3975b]" : "text-slate-700 hover:bg-slate-100"
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Financial Ledger & Escrow
          </NavLink>
          <NavLink
            to="/admin/inquiries"
            className={({ isActive }) =>
              `block px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider ${
                isActive ? "bg-[#b3975b]/15 text-[#b3975b]" : "text-slate-700 hover:bg-slate-100"
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Inquiries
          </NavLink>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              type="button"
              className="w-full py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              onClick={() => {
                setMobileMenuOpen(false);
                nav("/");
              }}
            >
              <FaExternalLinkAlt className="text-xs text-[#b3975b]" /> View Website
            </button>

            <button
              type="button"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
              onClick={() => {
                setMobileMenuOpen(false);
                clearToken();
                nav("/login");
              }}
            >
              <FaSignOutAlt className="text-xs text-rose-400" /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
