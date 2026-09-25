import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";
import { blogPosts } from "../../data/blogPosts";

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80";

export default function BlogIndex() {
  return (
    <>
      <Header />

      {/* HERO */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container max-w-6xl">
          <span className="uppercase tracking-[0.3em] text-[11px] text-slate-400 font-semibold">
            NCR Properties — Blog
          </span>

          <h1 className="text-3xl md:text-4xl font-semibold mt-4 tracking-tight">
            Market Guides & Investment Insights
          </h1>

          <p className="text-slate-600 text-sm md:text-base mt-4 max-w-2xl">
            Website-ready articles with SEO structure, buyer guidance, and
            practical checklists for Dubai real estate.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="section bg-slate-50">
        <div className="container max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 items-stretch">
            {blogPosts.slice(0, 6).map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group block h-full"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm h-full flex flex-col">
                  <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_COVER;
                      }}
                    />
                    <span className="absolute top-4 left-4 bg-white/95 text-[10px] px-3 py-1 rounded-full uppercase tracking-widest font-semibold text-slate-700 border border-slate-100">
                      Guide
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold leading-snug text-slate-900 group-hover:text-[#b3975b] transition line-clamp-2 min-h-[3rem]">
                      {post.title}
                    </h3>

                    <p className="text-sm text-slate-600 mt-3 leading-relaxed line-clamp-3 min-h-[4.25rem]">
                      {post.excerpt}
                    </p>

                    <p className="text-xs text-slate-500 mt-auto pt-4 uppercase tracking-wide">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}