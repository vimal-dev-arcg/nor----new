import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import footerLogo from "../img/logos/logo4.png";

export default function Footer() {
  const year = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // FIX: robust hash navigation to home sections (prevents wrong offset/section)
  const goToHomeSection = (id) => (e) => {
    e.preventDefault();

    const targetUrl = `/#${id}`;

    // 1) Navigate to home with hash (this ensures correct URL)
    if (location.pathname !== "/") {
      navigate(targetUrl);
    } else if (location.hash !== `#${id}`) {
      window.history.replaceState(null, "", targetUrl);
    }

    // 2) After navigation/mount, scroll precisely to the element
    const headerOffset = 96; // adjust if your fixed header height differs
    let tries = 0;
    const maxTries = 180; // ~3s at 60fps (safe for slower loads)

    const tick = () => {
      const el = document.getElementById(id);
      if (el) {
        const y =
          el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
        return;
      }

      tries += 1;
      if (tries < maxTries) requestAnimationFrame(tick);
    };

    requestAnimationFrame(() =>
      requestAnimationFrame(() => requestAnimationFrame(tick))
    );
  };

  // For normal page links: navigate then scroll to top (supports query strings too)
  const goToPageTop = (to) => (e) => {
    e.preventDefault();

    const targetPath = typeof to === "string" ? to : to?.pathname;
    const targetSearch = typeof to === "string" ? "" : to?.search || "";
    const fullTarget = `${targetPath || ""}${targetSearch || ""}`.trim();
    if (!fullTarget) return;

    const fullCurrent = `${location.pathname}${location.search}`;

    if (fullCurrent !== fullTarget) {
      navigate(fullTarget);
      requestAnimationFrame(() => requestAnimationFrame(scrollTop));
      return;
    }

    scrollTop();
    if (location.hash) window.history.replaceState(null, "", fullTarget);
  };

  return (
    <footer className="relative bg-[#070707] text-slate-400 border-t border-white/10 overflow-hidden">
      {/* Decorative Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-gradient-to-b from-[#b3975b]/10 to-transparent blur-3xl pointer-events-none" />

      {/* Main Footer Grid */}
      <div className="container py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand Column (Spans 2 on large screens) */}
        {/* Brand Column (Spans 2 on large screens) */}
        <div className="lg:col-span-2 space-y-0">
          <Link
            to="/"
            onClick={goToPageTop("/")}
            className="inline-flex items-center block"
            style={{ 
              marginTop: "-4rem", 
              marginBottom: "-3.5rem",
              lineHeight: 0 
            }}
          >
            <img
              src={footerLogo}
              alt="NCR Properties"
              style={{ height: "12rem", width: "auto" }}
              className="object-contain brightness-110 sm:h-[14rem]"
            />
          </Link>

          <p 
            className="text-sm leading-relaxed text-slate-400 font-normal pr-4 relative z-10"
            style={{ marginTop: "-1.5rem" }}
          >
            NCR Properties LLC is a Dubai-based real estate brokerage providing
            advisory and brokerage services across residential, commercial, and
            industrial properties throughout the UAE, in accordance with
            applicable RERA and DED regulations.
          </p>
          </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b3975b]"></span>
            Quick Links
          </h4>
          <ul className="space-y-3 text-sm">
            {[
              { label: "Home", to: "/", onClick: goToPageTop("/") },
              {
                label: "New Launch Projects",
                to: "/new-launch",
                onClick: goToPageTop("/new-launch"),
                highlight: true,
              },
              {
                label: "Buy / Sell",
                to: "/sell-or-rent-out-property",
                onClick: goToPageTop("/sell-or-rent-out-property"),
              },
              {
                label: "Featured Projects",
                to: "/#categorized-projects",
                onClick: goToHomeSection("categorized-projects"),
              },
              {
                label: "Off-Plan Projects",
                to: "/listings",
                onClick: goToPageTop("/listings"),
              },
              {
                label: "NRI Desk 🇮🇳",
                to: "/india",
                onClick: goToPageTop("/india"),
                highlight: true,
              },
              {
                label: "Photo Gallery",
                to: "/gallery",
                onClick: goToPageTop("/gallery"),
              },
              { label: "Blog", to: "/blog", onClick: goToPageTop("/blog") },
              { label: "FAQs", to: "/about#faq", onClick: goToPageTop("/about") },
            ].map((item, idx) => (
              <li key={idx}>
                <Link
                  className={`transition-colors duration-200 inline-block hover:translate-x-1 ${
                    item.highlight
                      ? "text-[#b3975b] font-medium hover:text-[#c4a96b]"
                      : "hover:text-white text-slate-400"
                  }`}
                  to={item.to}
                  onClick={item.onClick}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b3975b]"></span>
            Company
          </h4>
          <ul className="space-y-3 text-sm">
            {[
              { label: "About NCR Properties", to: "/about" },
              { label: "Our Team", to: "/agents" },
              { label: "Internship Program", to: "/agents" },
              { label: "Careers", to: "/career" },
              { label: "Contact", to: "/contact" },
            ].map((item, idx) => (
              <li key={idx}>
                <Link
                  className="text-slate-400 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1"
                  to={item.to}
                  onClick={goToPageTop(item.to)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b3975b]"></span>
            Contact Us
          </h4>
          <div className="text-sm space-y-4">
            {/* Dubai Office */}
            <div className="flex items-start gap-3 text-slate-300">
              <FaMapMarkerAlt className="text-[#b3975b] mt-1 shrink-0 text-base" />
              <span className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-white font-medium block mb-0.5">
                  Dubai Office:
                </strong>
                Office 111, 1st Floor, Al Zarooni Building, Sheikh Zayed Road,
                Dubai – UAE
              </span>
            </div>

            {/* India Office */}
            <div className="flex items-start gap-3 text-slate-300">
              <FaMapMarkerAlt className="text-[#b3975b] mt-1 shrink-0 text-base" />
              <span className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-white font-medium block mb-0.5">
                  India Office 🇮🇳:
                </strong>
                Office No- 409, Sector 42, Golf Course Road, HUDA Gurugram 122009
                – India
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <FaPhoneAlt className="text-[#b3975b] shrink-0 text-sm" />
              <a
                href="tel:+97143431114"
                className="text-slate-300 hover:text-white transition"
              >
                +971 4 343 1114
              </a>
            </div>

            <div className="flex items-center gap-3">
              <FaEnvelope className="text-[#b3975b] shrink-0 text-sm" />
              <a
                href="mailto:admin@ncrproperties.ae"
                className="text-slate-300 hover:text-white transition truncate"
              >
                admin@ncrproperties.ae
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-white/10 bg-black/40">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>© {year} NCR Properties LLC. All rights reserved.</div>

          <div className="flex items-center gap-6">
            <Link
              to="/contact"
              onClick={goToPageTop("/contact")}
              className="hover:text-slate-300 transition"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              onClick={goToPageTop("/contact")}
              className="hover:text-slate-300 transition"
            >
              Terms of Service
            </Link>
            <span className="text-white/20">|</span>
            <span className="text-[11px] text-slate-400">
              RERA & DED Compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}