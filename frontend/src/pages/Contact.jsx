import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineClock,
  HiOutlineShieldCheck,
  HiOutlineXMark,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";

export default function Contact() {
  // Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // Privacy Policy Modal State
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  function handleContactSubmit(e) {
    e.preventDefault();
    setContactSubmitted(true);
  }

  function handleNewsletterSubmit(e) {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitted(true);
  }

  return (
    <>
      <Header />

      <main className="pt-28 md:pt-32 bg-slate-50 min-h-screen">
        {/* ================= 1. CONTACT HERO & MAIN INFO ================= */}
        <section className="section bg-white border-b border-slate-100">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="uppercase tracking-[0.35em] text-xs font-semibold text-[#b3975b]">
                Contact NCR Properties
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mt-4 mb-6 tracking-tight">
                Get in Touch
              </h1>
              <div className="w-24 h-[2px] bg-[#b3975b] mx-auto mb-6" />
              <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                Speak with our private advisory team for buying, selling, or
                investing in premium residential and commercial assets across Dubai
                and India.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Direct Contact Info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#b3975b]/10 text-[#b3975b] flex items-center justify-center shrink-0 text-xl">
                      <HiOutlineMapPin />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Address
                      </h4>
                      <p className="text-slate-800 font-medium text-sm mt-1 leading-relaxed">
                        Office 111, 1st Floor, Al Zarooni Building, Sheikh Zayed Road<br />
                        Dubai – United Arab Emirates
                      </p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-200/80" />

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#b3975b]/10 text-[#b3975b] flex items-center justify-center shrink-0 text-xl">
                      <HiOutlineEnvelope />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Direct Email
                      </h4>
                      <a
                        href="mailto:admin@ncrproperties.ae"
                        className="text-[#b3975b] hover:underline font-semibold text-sm mt-1 inline-block"
                      >
                        admin@ncrproperties.ae
                      </a>
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-200/80" />

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#b3975b]/10 text-[#b3975b] flex items-center justify-center shrink-0 text-xl">
                      <HiOutlinePhone />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Website & Phone
                      </h4>
                      <a
                        href="https://www.ncrproperties.ae"
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-800 hover:text-[#b3975b] font-medium text-sm mt-1 block"
                      >
                        www.ncrproperties.ae
                      </a>
                      <a
                        href="tel:+97143999999"
                        className="text-slate-600 text-xs mt-1 block hover:text-[#b3975b]"
                      >
                        +971 4 399 9999 (Headquarters)
                      </a>
                      <a
                        href="https://wa.me/97143999999?text=Hello%20NCR%20Properties,%20I%20would%20like%20to%20speak%20with%20an%20investment%20advisor."
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg mt-2.5 hover:bg-emerald-100 transition"
                      >
                        <FaWhatsapp className="text-sm" />
                        <span>Chat via WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-200/80" />

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[#b3975b]/10 text-[#b3975b] flex items-center justify-center shrink-0 text-xl">
                      <HiOutlineClock />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Advisory Hours
                      </h4>
                      <p className="text-slate-700 text-xs mt-1">
                        Monday – Saturday: 9:00 AM – 7:00 PM (GST)
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Sunday: By Appointment Only
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-6">
                  <div className="flex items-center gap-3">
                    <HiOutlineShieldCheck className="text-xl text-[#b3975b] shrink-0" />
                    <span className="text-xs font-semibold text-slate-800">
                      RERA & Dubai Land Department Licensed
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Operating under full regulatory compliance with RERA standards
                    to guarantee complete transparency and secure escrow protocols.
                  </p>
                </div>
              </div>

              {/* Right Column: Send Message Form */}
              <div className="lg:col-span-7">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    Send an Inquiry
                  </h3>
                  <p className="text-slate-500 text-sm mb-8">
                    Fill out the form below and an investment advisor will contact
                    you within 24 hours.
                  </p>

                  {contactSubmitted ? (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center animate-fadeIn">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
                        ✓
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        Inquiry Received
                      </h4>
                      <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
                        Thank you for reaching out. One of our senior property
                        advisors will connect with you promptly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Your Name *
                          </label>
                          <input
                            required
                            type="text"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#b3975b] text-sm"
                            placeholder="e.g. Alexander Vance"
                            value={contactForm.name}
                            onChange={(e) =>
                              setContactForm({
                                ...contactForm,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            required
                            type="email"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#b3975b] text-sm"
                            placeholder="e.g. alexander@example.com"
                            value={contactForm.email}
                            onChange={(e) =>
                              setContactForm({
                                ...contactForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Phone / WhatsApp Number
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#b3975b] text-sm"
                          placeholder="+971 50 123 4567"
                          value={contactForm.phone}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Your Message / Property Requirements *
                        </label>
                        <textarea
                          required
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#b3975b] text-sm"
                          placeholder="Tell us about the property type, community, budget, or advice you are seeking..."
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm({
                              ...contactForm,
                              message: e.target.value,
                            })
                          }
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 bg-[#b3975b] hover:bg-[#9e824c] text-white font-semibold rounded-xl transition shadow-md text-sm uppercase tracking-wider"
                      >
                        Send Message
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 2. STAY AHEAD OF THE MARKET (NEWSLETTER) ================= */}
        <section className="section bg-slate-900 text-white py-20">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="uppercase tracking-[0.35em] text-xs font-semibold text-[#b3975b]">
                Exclusive Advisory Intelligence
              </span>

              <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4 tracking-tight">
                Stay ahead of the market
              </h2>

              <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Get the latest property launches, market reports, and investment
                insights delivered to your inbox.
              </p>
            </div>

            {newsletterSubmitted ? (
              <div className="bg-white/10 backdrop-blur border border-emerald-400/40 rounded-3xl p-8 text-center max-w-xl mx-auto animate-fadeIn">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-3">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white">
                  You're Subscribed!
                </h3>
                <p className="text-slate-300 text-sm mt-2">
                  Thank you. You will receive our latest Dubai property launch
                  notifications and curated market reports.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="max-w-2xl mx-auto"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      required
                      type="email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Client’s email here"
                      className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#b3975b] focus:border-transparent text-sm transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-8 py-4 rounded-2xl bg-[#b3975b] hover:bg-[#9e824c] text-white font-semibold text-sm transition shadow-lg shrink-0 tracking-wide uppercase"
                  >
                    Subscribe
                  </button>
                </div>

                <div className="mt-5 text-center text-xs text-slate-400">
                  No spam. Unsubscribe anytime.{" "}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-[#b3975b] hover:underline font-medium ml-1 inline-flex items-center"
                  >
                    View our Privacy Policy.
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ================= PRIVACY POLICY MODAL ================= */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              aria-label="Close"
            >
              <HiOutlineXMark className="text-xl" />
            </button>

            <div className="pr-8">
              <span className="text-xs uppercase tracking-widest font-bold text-[#b3975b]">
                NCR Properties
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-4">
                Privacy & Data Policy
              </h3>
            </div>

            <div className="space-y-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
              <p>
                NCR Properties LLC is committed to safeguarding your personal
                information and maintaining the highest standard of confidentiality
                in compliance with the United Arab Emirates Personal Data
                Protection Law (Federal Decree-Law No. 45 of 2021).
              </p>

              <h4 className="font-bold text-slate-900 text-sm">
                1. Information Collection
              </h4>
              <p>
                When you subscribe to our advisory newsletter or submit an
                inquiry, we collect your email address and any relevant contact
                details provided voluntarily. We only collect details necessary
                to deliver relevant market research, off-plan releases, and
                property updates.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">
                2. No Spam & No Third-Party Sales
              </h4>
              <p>
                We do not sell, rent, or trade your contact information with
                unaffiliated third-party marketing companies. You will only
                receive direct communications from NCR Properties regarding
                verified real estate opportunities and market intelligence.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">
                3. Unsubscribe at Any Time
              </h4>
              <p>
                Every email newsletter sent by NCR Properties includes a direct,
                one-click unsubscribe link. You may also contact our compliance
                desk at{" "}
                <a
                  href="mailto:admin@ncrproperties.ae"
                  className="text-[#b3975b] underline"
                >
                  admin@ncrproperties.ae
                </a>{" "}
                to request the immediate deletion of your details from our
                database.
              </p>

              <h4 className="font-bold text-slate-900 text-sm">
                4. Data Protection & Security
              </h4>
              <p>
                All stored contact data is protected via industry-standard
                encryption protocols and restricted exclusively to licensed NCR
                Properties advisors and authorized compliance officers.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs uppercase tracking-wider transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
