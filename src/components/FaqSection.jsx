import { useMemo, useState } from "react";

/**
 * @typedef {{ q: string, a: string }} FaqItem
 */

/**
 * @param {{
 *  title?: string,
 *  subtitle?: string,
 *  items?: FaqItem[]
 * }} props
 */
export default function FaqSection(props) {
  const title =
    props.title ??
    "Frequently Asked Questions About NCR Properties & Dubai Real Estate";
  const subtitle =
    props.subtitle ??
    "Answers to common questions about NCR Properties and how we support buyers, sellers and investors across Dubai.";

  /** @type {FaqItem[]} */
  const items = useMemo(
    () =>
      props.items ?? [
        {
          q: "What services does NCR Properties provide?",
          a: "NCR Properties is a Dubai-based real estate brokerage offering buying, selling, leasing and investment advisory services across residential, waterfront and off-plan property in Dubai.",
        },
        {
          q: "Can NCR Properties help me find property in Dubai?",
          a: "Yes. NCR Properties curates properties across leading developers and communities based on your goals, lifestyle and investment criteria.",
        },
        {
          q: "Do you assist with property investment in Dubai?",
          a: "NCR Properties provides strategic investment advisory including area selection, developer analysis, yield potential and long-term capital growth considerations.",
        },
        {
          q: "Can international buyers purchase property through NCR Properties?",
          a: "Yes. NCR Properties supports overseas buyers with remote purchasing guidance, developer access, documentation and financing coordination.",
        },
        {
          q: "How do I start buying property in Dubai?",
          a: "Begin with an NCR consultation to define your budget, preferred communities and ownership goals. We then shortlist properties and guide you through the purchase process.",
        },
        {
          q: "Does NCR Properties assist with financing?",
          a: "Yes. NCR works with UAE banks and mortgage partners to support eligible residents and international buyers with property financing.",
        },
        {
          q: "Can buying property in Dubai qualify me for a UAE Golden Visa?",
          a: "Yes. Property investors in Dubai may qualify for the UAE Golden Visa when purchasing real estate that meets the minimum investment threshold set by UAE authorities. Eligible property ownership can allow investors and their families to obtain long-term residency in the UAE. NCR Properties guides clients on qualifying property types, ownership structures and developer eligibility to support Golden Visa applications.",
        },
        {
          q: "What is the minimum property value required for a Dubai Golden Visa?",
          a: "The UAE Golden Visa for property investors is typically available for real estate investments starting from AED 2 million or more, subject to current government regulations. Both completed and certain off-plan properties may qualify depending on payment status and developer approval. NCR Properties advises investors on projects and ownership structures that align with Golden Visa eligibility requirements.",
        },
        {
          q: "If a project is not available on the website, can you still help?",
          a: "Yes. Some off-market opportunities, upcoming launches and developer allocations may not be listed publicly. Share your requirements and we’ll advise on availability, pricing guidance and suitable alternatives across comparable communities and developers.",
        },
      ],
    [props.items]
  );

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section bg-white">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="uppercase tracking-[0.35em] text-xs text-slate-400">
            FAQ
          </span>
          <h2 className="heading-xl mt-5 mb-4">{title}</h2>
          <p className="text-slate-600 text-base leading-relaxed">{subtitle}</p>
          <div className="w-24 h-[2px] bg-gold mx-auto mt-8" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {items.map((it, idx) => {
            const open = openIndex === idx;
            return (
              <div
                key={it.q}
                className={[
                  "rounded-2xl border border-slate-200 bg-slate-50",
                  "transition-shadow h-fit",
                  open ? "shadow-sm" : "hover:shadow-sm",
                ].join(" ")}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-6 text-left p-6"
                  onClick={() => setOpenIndex((cur) => (cur === idx ? -1 : idx))}
                  aria-expanded={open}
                >
                  <div className="font-semibold text-slate-900">{it.q}</div>

                  <span
                    className={[
                      "shrink-0 inline-flex items-center justify-center",
                      "h-9 w-9 rounded-full border",
                      open
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-700 border-slate-200",
                    ].join(" ")}
                    aria-hidden="true"
                    title={open ? "Collapse" : "Expand"}
                  >
                    {open ? "−" : "+"}
                  </span>
                </button>

                {open && (
                  <div className="px-6 pb-6">
                    <div className="h-px bg-slate-200 mb-4" />
                    <p className="text-slate-600 leading-relaxed">{it.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            Still have questions? Contact our team and we’ll reply promptly.
          </p>
        </div>
      </div>
    </section>
  );
}