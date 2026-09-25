import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { LEADERSHIP_TEAM, INTERNSHIP_PROGRAM_TEAM } from "../data/agents";
import { Helmet } from "react-helmet-async";

export default function Agents() {
  return (
    <>
      <Helmet>
        <title>Our Leadership Team & Internship Program | NCR Properties</title>
        <meta
          name="description"
          content="Meet our leadership and senior management team, along with our emerging talent in the NCR Properties Internship Program."
        />
      </Helmet>

      <Header />

      <section className="pt-32 pb-24 section bg-slate-50 min-h-screen">
        <div className="container">
          {/* SECTION 1: LEADERSHIP & SENIOR MANAGEMENT TEAM */}
          <div className="flex items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="heading-lg">Our Leadership and Senior Management Team</h1>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Meet our advisory team — specialists across residential,
                commercial, and investment opportunities.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {LEADERSHIP_TEAM.map((agent) => (
              <div
                key={agent.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Avatar wrapper */}
                  <div className="mx-auto w-36 h-36 rounded-full overflow-hidden ring-1 ring-slate-200 bg-slate-100 shadow-inner">
                    <img
                      src={agent.photo}
                      alt={agent.name}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="font-semibold text-lg text-slate-900 mt-5">
                    {agent.name}
                  </h3>

                  <p className="text-sm font-medium text-[#b3975b] mt-1">
                    {agent.role}
                  </p>

                  {agent.subRole && (
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      {agent.subRole}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 2: INTERNSHIP PROGRAM */}
          <div className="flex items-end justify-between gap-6 mt-20 mb-10 pt-16 border-t border-slate-200/80">
            <div>
              <h2 className="heading-lg">Internship Program</h2>
              <p className="text-slate-600 mt-2 max-w-2xl">
                Fostering the next generation of real estate advisory specialists and strategic partnership leaders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
            {INTERNSHIP_PROGRAM_TEAM.map((intern) => (
              <div
                key={intern.id}
                className="relative bg-[#fcfbfa] border border-[#e8e2d8] rounded-[2rem] p-7 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Top-Right Decorative Warm Architectural Arc */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#ede4d4]/60 rounded-bl-[5rem] pointer-events-none transition-transform group-hover:scale-105" />

                <div className="relative z-10">
                  {/* Top Row: Photo + Identity */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5">
                    {/* Square Rounded Photo */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-200 border border-[#e4dcce] shadow-sm">
                      <img
                        src={intern.photo}
                        alt={intern.name}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                    </div>

                    {/* Badge, Name, Subtitle */}
                    <div className="min-w-0 flex-1">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#ede5d6] text-[#7d683a] text-[10px] sm:text-[11px] font-bold uppercase tracking-widest border border-[#e0d5c2] mb-2 shadow-xs">
                        INTERNSHIP PROGRAM
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                        {intern.name}
                      </h3>
                      <p className="text-sm font-semibold text-slate-700 mt-1 leading-snug">
                        {intern.role}
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Divider */}
                  <div className="w-full h-px bg-[#e8e2d8] my-6" />

                  {/* Department & Focus */}
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1.5">
                      DEPARTMENT &amp; FOCUS
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
                      {intern.department}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {intern.bio}
                    </p>
                  </div>
                </div>

                {/* Bottom Bar: Cohort + Connect */}
                <div className="relative z-10 mt-6 pt-4 border-t border-[#ede7dd] flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
                    <span>Active Cohort 2026</span>
                  </div>

                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#b3975b] hover:text-[#91763a] transition-colors group-hover:translate-x-0.5"
                  >
                    <span>Connect</span>
                    <span className="text-base leading-none">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
