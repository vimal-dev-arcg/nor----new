import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { HiOutlineShieldCheck, HiOutlineLightBulb, HiOutlineUserGroup } from "react-icons/hi2";

export default function Career() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "1-3 years",
    notes: "",
  });

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <Header />

      <main className="pt-28 md:pt-32 bg-slate-50 min-h-screen">
        {/* HERO */}
        <section className="section bg-white border-b border-slate-100">
          <div className="container max-w-5xl mx-auto text-center">
            <span className="uppercase tracking-[0.35em] text-xs font-semibold text-[#b3975b]">
              Careers at NCR Properties
            </span>

            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mt-5 mb-6 tracking-tight">
              Trust. Innovation. Collaboration.
            </h1>

            <div className="w-24 h-[2px] bg-[#b3975b] mx-auto mb-8" />

            <div className="text-slate-600 text-base md:text-lg leading-relaxed max-w-3xl mx-auto space-y-5">
              <p>
                At NCR Properties, we believe our agents' success is our success.
                That's why we've built an environment grounded in trust, driven by
                innovation, and strengthened through genuine collaboration.
              </p>
              <p>
                From day one, you're not just joining a brokerage firm—you're
                joining a team invested in your growth, your pipeline, and your
                long-term career in Dubai real estate.
              </p>
            </div>
          </div>
        </section>

        {/* THREE PILLARS */}
        <section className="section bg-slate-50">
          <div className="container max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#b3975b]/10 text-[#b3975b] flex items-center justify-center text-2xl mb-6">
                  <HiOutlineShieldCheck />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Trust & Transparency
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Clear commissions, institutional integrity, and direct access to top-tier UAE developer launch allocations that preserve client relationships.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#b3975b]/10 text-[#b3975b] flex items-center justify-center text-2xl mb-6">
                  <HiOutlineLightBulb />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Driven by Innovation
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Leverage market intelligence tools, institutional underwriting frameworks, and digital lead pipelines designed to accelerate transaction speed.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-[#b3975b]/10 text-[#b3975b] flex items-center justify-center text-2xl mb-6">
                  <HiOutlineUserGroup />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Genuine Collaboration
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Direct mentorship from seasoned Dubai market veterans, synergy across residential and commercial desks, and global NRI network backing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* JOIN THE TEAM FORM */}
        <section className="section bg-white border-t border-slate-100">
          <div className="container max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="uppercase tracking-[0.3em] text-xs font-semibold text-[#b3975b]">
                Apply Now
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
                Join Our Advisory Team
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Submit your details or email your CV directly to{" "}
                <a
                  href="mailto:admin@ncrproperties.ae"
                  className="text-[#b3975b] font-medium hover:underline"
                >
                  admin@ncrproperties.ae
                </a>
              </p>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Thank You for Your Application
                </h3>
                <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
                  Our talent advisory team has received your details and will review your profile within 48 business hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#b3975b] text-sm"
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#b3975b] text-sm"
                      placeholder="e.g. rahul@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Phone / WhatsApp *
                    </label>
                    <input
                      required
                      type="tel"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#b3975b] text-sm"
                      placeholder="+971 50 123 4567"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Dubai Real Estate Experience
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#b3975b] text-sm"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    >
                      <option value="New to Dubai RE">New to Dubai Real Estate</option>
                      <option value="1-3 years">1 - 3 Years</option>
                      <option value="3-5 years">3 - 5 Years</option>
                      <option value="5+ years">5+ Years (Senior Advisor)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Tell Us About Your Experience & Background
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#b3975b] text-sm"
                    placeholder="Briefly describe your transaction background, target communities, or why you want to partner with NCR Properties..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#b3975b] hover:bg-[#9e824c] text-white font-semibold rounded-xl transition shadow-md text-sm uppercase tracking-wider"
                >
                  Submit Application
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
