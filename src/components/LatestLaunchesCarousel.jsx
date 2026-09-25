import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LATEST_LAUNCHES } from "../data/newLaunchesData";

export default function LatestLaunchesCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  // Clean Single Search State
  const [searchQuery, setSearchQuery] = useState("");

  const total = LATEST_LAUNCHES.length;
  const current = LATEST_LAUNCHES[currentIndex] || LATEST_LAUNCHES[0];

  // Auto slide every 3.5 seconds if not paused
  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, [isPaused, total]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % total);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + total) % total);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (diffX > 45) {
      nextSlide();
    } else if (diffX < -45) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <section
      id="latest-launches"
      className="relative w-full min-h-screen min-h-[100dvh] bg-slate-950 text-white overflow-hidden scroll-mt-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Latest Off-Plan Launches"
    >
      {/* Anchor identifier for duplicate new-launches hash */}
      <span id="new-launches" className="sr-only">
        New Launches
      </span>

      {/* Main Hero Slider Container covering full screen */}
      <div className="relative min-h-screen min-h-[100dvh] w-full flex items-center">
        {/* 1. Image Background with smooth cross-fade */}
        {LATEST_LAUNCHES.map((launch, idx) => (
          <div
            key={launch.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-out ${
              idx === currentIndex
                ? "opacity-100 z-10 scale-100"
                : "opacity-0 z-0 pointer-events-none scale-102"
            } transition-transform duration-500`}
          >
            <img
              src={launch.images?.[0] || "/projects/mercedes_1.jpg"}
              alt={launch.title}
              className="w-full h-full object-cover object-center"
              loading={idx === 0 ? "eager" : "lazy"}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/projects/mercedes_1.jpg";
              }}
            />
            {/* Soft non-black gradient overlay to preserve vibrant architectural lighting */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-slate-900/15 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
          </div>
        ))}

        {/* Hero Content Overlay */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:pt-[24.5rem] sm:pb-14 flex flex-col justify-center">
          <div className="max-w-3xl">
            {/* 2. New launch badge + Starting Price */}
            <div className="flex items-center gap-2.5 mb-4 sm:mb-5 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b3975b] text-slate-950 font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#b3975b]/30">
                <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />
                NEW LAUNCH
              </span>
              {/* <span className="text-xs font-bold text-[#e6ca85] bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#b3975b]/40 shadow-sm">
                Starting {current.displayPrice}
              </span> */}
            </div>

            {/* 3. Name of the project (Direct Hyperlink) */}
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-5 sm:mb-6 break-words drop-shadow-lg">
              <Link
                to={`/projects/${current.slug}`}
                className="hover:text-[#e6ca85] transition-colors focus:outline-none focus:ring-2 focus:ring-[#b3975b] inline-block"
                title={`Explore ${current.title}`}
              >
                {current.title}
              </Link>
            </h1>

            {/* 4. View more CTA Flow */}
            <div className="flex items-center gap-3.5 mb-6 sm:mb-8 flex-wrap">
              <Link
                to={`/projects/${current.slug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-[#b3975b] hover:bg-[#c4a96e] text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-[#b3975b]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>View More</span>
              </Link>
            </div>

            {/* 5. Master search button (Fully Mobile, Tablet & Desktop Responsive) */}
            <form
              onSubmit={handleSearch}
              className="w-full max-w-2xl bg-slate-900/70  p-2 sm:p-2.5 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
            >
              <div className="relative flex-1 flex items-center min-w-0">
                <span className="pl-3.5 pr-2 text-slate-400 pointer-events-none flex items-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search project, community, or developer..."
                  className="w-full py-2.5 sm:py-3 pr-3 bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none min-w-0"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 sm:py-3.5 rounded-xl bg-[#b3975b] hover:bg-[#c4a96e] text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-[#b3975b]/30 transition shrink-0 active:scale-95 cursor-pointer"
              >
                Master Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
