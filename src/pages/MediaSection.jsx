import Header from "../components/Header";
import Footer from "../components/Footer";
import mediaItems from "../data/media";
import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

export default function Media() {
  const reports = mediaItems.filter((i) => i.type === "Report");
  const blogs = blogPosts;

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="pt-32 pb-20 bg-white">
        <div className="container max-w-6xl">
          <span className="uppercase tracking-[0.3em] text-[11px] text-slate-400 font-semibold">
            Media
          </span>

          <h1 className="text-3xl md:text-4xl font-semibold mt-4 tracking-tight">
            Market Reports & Insights
          </h1>

          <p className="text-slate-600 text-sm md:text-base mt-4 max-w-2xl">
            Research-driven market reports and expert commentary covering Dubai’s
            residential and investment landscape.
          </p>
        </div>
      </section>

      {/* ================= REPORTS ================= */}
      <section className="section bg-slate-50">
        <div className="container max-w-6xl">

          {/* Section Header */}
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-2xl font-semibold tracking-tight">
              Market Reports
            </h2>

            <Link
              to="/media/reports"
              className="text-xs uppercase tracking-widest text-[#b3975b]"
            >
              View All Reports
            </Link>
          </div>

          {/* Reports Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {reports.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= BLOG ================= */}
      <section className="section bg-white">
        <div className="container max-w-6xl">

          {/* Section Header */}
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-2xl font-semibold tracking-tight">
              Latest Articles
            </h2>

            <Link
              to="/blog"
              className="text-xs uppercase tracking-widest text-[#b3975b]"
            >
              View Blog
            </Link>
          </div>

          {/* Blog Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {blogs.slice(0, 4).map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* ================= MEDIA CARD ================= */

function MediaCard({ item, compact }) {
  return (
    <Link to={item.link} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-slate-100">
        <img
          src={item.image}
          alt={item.title}
          className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            compact ? "h-48" : "h-56"
          }`}
        />

        {/* Type Badge */}
        <span className="absolute top-4 left-4 bg-white/90 text-[10px] px-3 py-1 uppercase tracking-widest font-semibold text-slate-700">
          {item.type}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="text-base md:text-lg font-semibold leading-snug group-hover:text-[#b3975b] transition">
          {item.title}
        </h3>

        <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide">
          {new Date(item.date).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}

/* ================= BLOG CARD (from blogPosts) ================= */

function BlogCard({ post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-slate-100">
        <img
          src={post.cover}
          alt={post.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        <span className="absolute top-4 left-4 bg-white/90 text-[10px] px-3 py-1 uppercase tracking-widest font-semibold text-slate-700">
          Blog
        </span>
      </div>

      <div className="mt-5">
        <h3 className="text-base md:text-lg font-semibold leading-snug group-hover:text-[#b3975b] transition">
          {post.title}
        </h3>

        <p className="text-xs text-slate-500 mt-2 uppercase tracking-wide">
          {new Date(post.date).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}