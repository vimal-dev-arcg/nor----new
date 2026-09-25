import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { isIndiaProperty } from "../lib/propertyUtils";

export default function Commercial() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/properties");
        const data = await res.json();
        if (!canceled) setProperties(Array.isArray(data) ? data : []);
      } catch {
        if (!canceled) setProperties([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    }

    load();
    return () => {
      canceled = true;
    };
  }, []);

  const commercial = useMemo(() => {
    const list = Array.isArray(properties) ? properties : [];

    // ✅ Only show properties approved through two-stage workflow and marked Commercial (excluding India properties)
    return list.filter(
      (p) =>
        p?.featuredCategory === "Commercial" &&
        (p.moderationStatus === "approved" || (!p.moderationStatus && p.adminApproved)) &&
        p.checkerApproved !== false &&
        p.adminApproved !== false &&
        p.moderationStatus !== "pending_checker" &&
        p.moderationStatus !== "pending_admin" &&
        p.moderationStatus !== "rejected" &&
        !isIndiaProperty(p)
    );
  }, [properties]);

  return (
    <>
      <Header />

      <main className="pt-24 bg-slate-50 min-h-screen">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Commercial
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold mt-3 tracking-tight">
                Commercial Properties
              </h1>
              <p className="text-slate-600 mt-3">
                Only listings tagged as <span className="font-medium">Commercial</span> in Admin → Property Listings.
              </p>
            </div>

            
          </div>

          {loading ? (
            <div className="py-16 text-slate-600">
              Loading commercial listings…
            </div>
          ) : commercial.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
              {commercial.map((p) => (
                <PropertyCard key={p.id ?? p._id} property={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-slate-600 mb-16">
              No commercial properties found. Set{" "}
              <code>Featured Category = Commercial</code> for a listing in the
              admin panel.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}