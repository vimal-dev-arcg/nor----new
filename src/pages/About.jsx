import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

export default function About() {
  const faqs = [
    {
      q: "What makes Dubai an attractive real estate investment market?",
      a: "Dubai offers high rental yields, zero property or capital gains tax, a stable currency pegged to the US dollar, world-class infrastructure, and long-term residency visas (such as the Golden Visa) for property investors.",
    },
    {
      q: "What is the difference between off-plan and secondary market properties?",
      a: "Off-plan properties are purchased directly from developers before or during construction, often featuring flexible payment plans. Secondary market properties are completed, ready to move in, and offer immediate rental returns or personal occupancy.",
    },
    {
      q: "Can foreign nationals buy property in Dubai?",
      a: "Yes, foreign nationals and non-resident investors can purchase freehold properties in designated investment zones across Dubai, with full ownership rights.",
    },
    {
      q: "What are the additional costs associated with buying property in Dubai?",
      a: "Buyers should typically budget for a 4% Dubai Land Department (DLD) transfer fee, property registration fees, mortgage arrangement fees (if applicable), and agency brokerage fees.",
    },
    {
      q: "Does NCR Properties assist with property management after purchase?",
      a: "Yes, NCR Properties provides end-to-end advisory including leasing support, tenant screening, and property management coordination to protect and maximize your investment returns.",
    },
  ];

  return (
    <>
      <Header />

      <main className="pt-28 md:pt-32 bg-slate-50 min-h-screen">
        {/* ================= 1. A TRUSTED PARTNER IN REAL ESTATE ================= */}
        <section className="section bg-white border-b border-slate-100">
          <div className="container max-w-5xl mx-auto text-center">
            <span className="uppercase tracking-[0.35em] text-xs font-semibold text-[#b3975b]">
              About NCR Properties
            </span>

            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mt-5 mb-8 tracking-tight">
              A Trusted Partner in Real Estate
            </h1>

            <div className="w-24 h-[2px] bg-[#b3975b] mx-auto mb-10" />

            <div className="text-slate-600 text-base md:text-lg leading-relaxed max-w-4xl mx-auto space-y-6 text-left sm:text-center">
              <p>
                NCR Properties is a Dubai-based real estate advisory and
                brokerage firm specializing in premium residential, commercial,
                and off-plan investment opportunities across the UAE.
              </p>
              <p>
                We work with end users, investors, and international buyers to
                identify high-quality assets, evaluate market opportunities, and
                execute real estate strategies that protect capital and deliver
                long-term value.
              </p>
              <p>
                With deep knowledge of Dubai’s evolving property landscape and
                strong developer relationships, NCR Properties provides clients
                with curated opportunities, market intelligence, and end-to-end
                transaction support — from selection to acquisition and beyond.
              </p>
              <p>
                Our approach is advisory-led, data-driven, and
                relationship-focused, ensuring every decision aligns with our
                clients’ financial goals and lifestyle aspirations.
              </p>
            </div>
          </div>
        </section>

        {/* ================= 2. OUR MISSION & 3. OUR VISION ================= */}
        <section className="section bg-slate-50">
          <div className="container max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
              {/* Mission */}
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b3975b]/10 text-[#b3975b] text-xs font-bold uppercase tracking-widest mb-6">
                    Our Mission
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-5 leading-snug">
                    Trusted advisory. High-quality access. Long-term value.
                  </h2>
                  <div className="w-16 h-[2px] bg-[#b3975b] mb-6" />
                  <p className="text-slate-600 leading-relaxed text-base">
                    To deliver trusted real estate advisory and access to
                    high-quality residential investments by connecting clients
                    with strategically selected properties that offer long-term
                    value, lifestyle quality, and financial growth.
                  </p>
                </div>
              </div>

              {/* Vision */}
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b3975b]/10 text-[#b3975b] text-xs font-bold uppercase tracking-widest mb-6">
                    Our Vision
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-5 leading-snug">
                    A recognised Dubai real estate brand built on integrity.
                  </h2>
                  <div className="w-16 h-[2px] bg-[#b3975b] mb-6" />
                  <p className="text-slate-600 leading-relaxed text-base">
                    To become a recognised real estate brand contributing to
                    Dubai’s built environment through advisory, investment, and
                    future development, while maintaining the highest standards of
                    integrity, expertise, and client service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FREQUENTLY ASKED QUESTIONS ================= */}
        <section id="faq" className="section bg-white border-t border-slate-100">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="uppercase tracking-[0.3em] text-xs font-semibold text-[#b3975b]">
                Got Questions?
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-3 mb-5">
                Frequently Asked Questions
              </h2>
              <div className="w-20 h-[2px] bg-[#b3975b] mx-auto" />
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((item, idx) => (
                <details
                  key={`${item.q}-${idx}`}
                  className="group rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#b3975b]/40 shadow-sm transition-all overflow-hidden"
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-6 px-6 sm:px-8 py-5 bg-transparent">
                    <span className="text-slate-900 font-semibold text-base sm:text-lg leading-snug">
                      {item.q}
                    </span>
                    <span
                      className="shrink-0 w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center group-open:rotate-45 transition-transform text-lg font-light"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>

                  <div className="px-6 sm:px-8 pb-6 pt-2 text-slate-600 leading-relaxed text-sm sm:text-base border-t border-slate-100/80 bg-white">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-slate-500 text-sm">
                Have more specific questions regarding property acquisition or UAE Golden Visa?
              </p>
              <Link
                to="/contact"
                className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-[#b3975b] hover:bg-[#9e824c] text-white font-medium text-sm transition shadow-sm"
              >
                Speak With an Advisor
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
