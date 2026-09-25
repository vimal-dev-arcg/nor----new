import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link, useParams } from "react-router-dom";
import { blogPosts } from "../../data/blogPosts";
import { useEffect } from "react";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80";

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    if (!post?.seo) return;

    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    const canonicalUrl = origin ? `${origin}/blog/${post.slug}/` : "";

    document.title = post.seo.metaTitle;

    const setMeta = (nameOrProp, value, isProp = false) => {
      const selector = isProp
        ? `meta[property="${nameOrProp}"]`
        : `meta[name="${nameOrProp}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        if (isProp) el.setAttribute("property", nameOrProp);
        else el.setAttribute("name", nameOrProp);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    setMeta("description", post.seo.metaDescription);

    // Open Graph
    setMeta("og:type", "article", true);
    setMeta("og:title", post.seo.metaTitle, true);
    setMeta("og:description", post.seo.metaDescription, true);
    setMeta("og:image", post.cover || FALLBACK_COVER, true);
    if (canonicalUrl) setMeta("og:url", canonicalUrl, true);

    // Twitter
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", post.seo.metaTitle);
    setMeta("twitter:description", post.seo.metaDescription);
    setMeta("twitter:image", post.cover || FALLBACK_COVER);

    // Canonical
    if (canonicalUrl) setLink("canonical", canonicalUrl);
  }, [post]);

  if (!post) {
    return (
      <>
        <Header />
        <section className="pt-32 pb-20 bg-white">
          <div className="container max-w-3xl">
            <h1 className="text-2xl font-semibold">Article not found</h1>
            <p className="text-slate-600 mt-3">
              The article you’re looking for doesn’t exist.
            </p>
            <Link to="/blog" className="text-[#b3975b] uppercase tracking-widest text-xs mt-6 inline-block">
              Back to Blog
            </Link>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="pt-32 pb-14 bg-white">
        <div className="container max-w-3xl">
          <Link to="/blog" className="text-xs uppercase tracking-widest text-[#b3975b]">
            Back to Blog
          </Link>

          <h1 className="text-3xl md:text-4xl font-semibold mt-4 tracking-tight text-slate-900">
            {post.title}
          </h1>

          <p className="text-slate-600 text-sm md:text-base mt-4">
            {post.excerpt}
          </p>

          <div className="text-xs text-slate-500 mt-6 uppercase tracking-wide">
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="section bg-slate-50">
        <div className="container max-w-6xl grid lg:grid-cols-12 gap-10">
          {/* Article */}
          <article className="lg:col-span-8">
            <div className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm">
              <div className="w-full aspect-[16/9] bg-slate-100">
                <img
                  src={post.cover}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_COVER;
                  }}
                />
              </div>

              <div className="p-8 md:p-10">
                {post.content.map((block, idx) => (
                  <div key={idx} className="mb-10">
                    {block.h2 ? (
                      <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                        {block.h2}
                      </h2>
                    ) : null}

                    {block.p?.map((para, pIdx) => (
                      <p key={pIdx} className="text-slate-700 leading-relaxed mb-4">
                        {para}
                      </p>
                    ))}

                    {block.steps ? (
                      <ol className="space-y-4 mt-5">
                        {block.steps.map((s, sIdx) => (
                          <li
                            key={sIdx}
                            className="bg-slate-50 border border-slate-100 rounded-2xl p-5"
                          >
                            <div className="text-slate-900 font-semibold">
                              {sIdx + 1}) {s.title}
                            </div>
                            <div className="text-slate-700 mt-2 leading-relaxed">
                              {s.text}
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA blocks */}
            <div className="mt-10 grid gap-6">
              {post.ctas?.map((cta, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl bg-primary text-white p-8 border border-white/10"
                >
                  <div className="uppercase tracking-[0.3em] text-[11px] text-slate-300 font-semibold">
                    {cta.title}
                  </div>
                  <p className="text-slate-200 mt-3 leading-relaxed">{cta.text}</p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Link to={cta.primary.to} className="btn-outline">
                      {cta.primary.label}
                    </Link>
                    <Link to={cta.secondary.to} className="btn-outline">
                      {cta.secondary.label}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ */}
            {post.faq?.length ? (
              <div className="mt-12 rounded-2xl bg-white border border-slate-100 shadow-sm p-8">
                <h2 className="text-xl font-semibold text-slate-900">
                  FAQ (on-page)
                </h2>

                <div className="mt-6 grid gap-4">
                  {post.faq.map((f, idx) => (
                    <details key={idx} className="group rounded-2xl border border-slate-100 overflow-hidden">
                      <summary className="cursor-pointer list-none flex items-start justify-between gap-6 px-6 py-5 bg-slate-50">
                        <span className="text-slate-900 font-semibold">{f.q}</span>
                        <span
                          className="shrink-0 w-9 h-9 rounded-full border border-slate-200 bg-white text-slate-700 flex items-center justify-center
                                     group-open:rotate-45 transition-transform"
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </summary>
                      <div className="px-6 py-5 text-slate-700 leading-relaxed bg-white">
                        {f.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ) : null}
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              {/* Internal links */}
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-7">
                <div className="text-slate-900 font-semibold mb-4">
                  Recommended Links
                </div>
                <div className="grid gap-3">
                  {post.internalLinks?.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="text-sm text-slate-700 hover:text-[#b3975b] transition"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* REMOVED: SEO Focus block (keywords should not be visible in content) */}
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </>
  );
}