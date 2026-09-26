import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import Footer from "../../components/Footer";
import { getToken } from "../../lib/auth";
import { fetchProperties, deleteProperty } from "../../data/properties";
import axios from "axios";

function formatNumber(n) {
  if (n === null || n === undefined || n === "") return "—";
  const num = Number(n);
  return Number.isFinite(num) ? num.toLocaleString() : String(n);
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

function resolveImgSrc(img) {
  if (!img) return "";
  if (typeof img === "string") {
    return img;
  }
  if (typeof img === "object" && typeof img.default === "string") {
    return img.default;
  }
  return "";
}

function firstImage(p) {
  if (!p || !Array.isArray(p.images) || p.images.length === 0) {
    return "/src/img/img1.jpg"; // Placeholder image if no images are available
  }
  return p.images[0];
}

export default function AdminAllProperties() {
  const token = useMemo(() => getToken(), []);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [showOtherFilter, setShowOtherFilter] = useState(false);
  const [agentFilterMode, setAgentFilterMode] = useState("all"); // all | agent
  const [agentId, setAgentId] = useState("");

  // ✅ ADDED: pagination (5 per page) for Published + Draft sections
  const PAGE_SIZE = 5;
  const [publishedPage, setPublishedPage] = useState(1);
  const [draftPage, setDraftPage] = useState(1);

  async function loadAll() {
    setLoading(true);
    setErr(""); // Clear previous errors
    try {
      const props = await axios.get(`${API_BASE}/api/properties`);
      console.log("All Properties:", props.data); // Debugging
      setProperties(props.data); // Set properties from backend response
    } catch (error) {
      console.error("Failed to load properties:", error.message);
      setErr("Failed to load properties. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    if (agentFilterMode === "all") return properties;
    const n = Number(agentId);
    if (!Number.isFinite(n)) return [];
    return properties.filter((p) => Number(p.agentId) === n);
  }, [properties, agentFilterMode, agentId]);

  const publishedProps = useMemo(
    () => filtered.filter((p) => !Boolean(p.isDraft)),
    [filtered]
  );
  const draftProps = useMemo(
    () => filtered.filter((p) => Boolean(p.isDraft)),
    [filtered]
  );

  // ✅ ADDED: keep pages valid when filters/data change
  useEffect(() => {
    const total = Math.max(1, Math.ceil(publishedProps.length / PAGE_SIZE));
    setPublishedPage((p) => Math.min(Math.max(1, p), total));
  }, [publishedProps.length]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(draftProps.length / PAGE_SIZE));
    setDraftPage((p) => Math.min(Math.max(1, p), total));
  }, [draftProps.length]);

  const publishedTotalPages = Math.max(
    1,
    Math.ceil(publishedProps.length / PAGE_SIZE)
  );
  const draftTotalPages = Math.max(1, Math.ceil(draftProps.length / PAGE_SIZE));

  const publishedPageItems = useMemo(() => {
    const start = (publishedPage - 1) * PAGE_SIZE;
    return publishedProps.slice(start, start + PAGE_SIZE);
  }, [publishedProps, publishedPage]);

  const draftPageItems = useMemo(() => {
    const start = (draftPage - 1) * PAGE_SIZE;
    return draftProps.slice(start, start + PAGE_SIZE);
  }, [draftProps, draftPage]);

  async function toggleDraft(p) {
    const nextDraft = !Boolean(p.isDraft);
    const res = await fetch(`/api/properties/${p._id}/draft`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isDraft: nextDraft }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.message || "Failed to update draft status");
      return;
    }

    const updated = await res.json();
    setProperties((prev) =>
      prev.map((x) => (x._id === updated._id ? updated : x))
    );
  }

  async function onDelete(p) {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;

    try {
      await deleteProperty(p._id);
      setProperties((prev) => prev.filter((x) => x._id !== p._id));
    } catch (error) {
      console.error("Failed to delete property:", error);
    }
  }

  return (
    <>
      <AdminHeader />
      <section className="pt-32 section">
        <div className="container">
          {/* CHANGED: responsive header layout (stack on mobile) */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-8">
            <div className="min-w-0">
              <h1 className="heading-lg">All Properties (Admin)</h1>
              <p className="text-slate-600 mt-2">
                Draft properties are hidden from Home/Listings.
              </p>
            </div>

            {/* CHANGED: buttons wrap + full width on mobile */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 lg:justify-end">
              <Link
                to="/admin"
                className="btn-outline w-full sm:w-auto text-center"
              >
                Back to Dashboard
              </Link>

              <button
                className="btn-outline w-full sm:w-auto"
                onClick={loadAll}
                type="button"
              >
                Refresh
              </button>

              <button
                className="btn-primary w-full sm:w-auto"
                type="button"
                onClick={() => setShowOtherFilter((s) => !s)}
              >
                {showOtherFilter
                  ? "Hide Filter"
                  : "View Other Agent Properties"}
              </button>
            </div>
          </div>

          {showOtherFilter && (
            // CHANGED: 1 col on mobile, 2 on sm, 3 on md+
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <select
                className="input"
                value={agentFilterMode}
                onChange={(e) => setAgentFilterMode(e.target.value)}
              >
                <option value="all">All properties</option>
                <option value="agent">By Agent ID</option>
              </select>

              <input
                className="input"
                placeholder="Agent ID (e.g. 1)"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              />

              {/* CHANGED: full width on mobile so it doesn't look cramped */}
              <div className="text-sm text-slate-500 flex items-center sm:justify-end md:justify-start">
                Showing:{" "}
                <span className="ml-2 font-semibold text-slate-900">
                  {filtered.length}
                </span>
              </div>
            </div>
          )}

          {err && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {err}
            </div>
          )}

          {/* ✅ Cards: Published */}
          <section className="mb-10">
            {/* CHANGED: stack meta row on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="heading-md">Published</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Visible on Home/Listings.
                </p>
              </div>
              <div className="text-sm text-slate-500">
                Count:{" "}
                <span className="font-semibold text-slate-900">
                  {publishedProps.length}
                </span>
              </div>
            </div>

            {/* CHANGED: 1 col on mobile, 2 on sm, 3 on xl (more smooth scaling) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {loading ? (
                <CardSkeleton />
              ) : publishedPageItems.length ? (
                publishedPageItems.map((p) => {
                  const img = firstImage(p);
                  return (
                    <div
                      key={p._id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
                    >
                      <div className="h-48 sm:h-44 md:h-48 bg-slate-100">
                        {img ? (
                          <img
                            src={img}
                            alt={p.title || "Property"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200" />
                        )}
                      </div>

                      <div className="p-4 sm:p-5">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {p.mode || "—"}
                          </span>
                          <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {p.type || "—"}
                          </span>
                          <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                            Published
                          </span>
                        </div>

                        <div className="font-semibold text-slate-900 break-words">
                          {p.title || "—"}
                        </div>
                        <div className="text-sm text-slate-500 mt-1 break-words">
                          {p.community || p.location || "—"}
                        </div>

                        <div className="text-gold font-semibold mt-3">
                          {p.displayPrice ||
                            (p.price ? `AED ${formatNumber(p.price)}` : "—")}
                        </div>

                        {/* CHANGED: actions stack on mobile, row on sm+ */}
                        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-5">
                          <Link
                            className="btn-outline w-full sm:w-auto text-center bg-[#b3975b]/10 text-[#b3975b] border-[#b3975b]/40 hover:bg-[#b3975b]/20"
                            to={`/admin/properties?id=${p.id ?? p._id}`}
                          >
                            Edit
                          </Link>

                          <Link
                            className="btn-outline w-full sm:w-auto text-center"
                            to={`/property/${p.id ?? p._id}`}
                          >
                            View
                          </Link>

                          <button
                            className="btn-outline w-full sm:w-auto"
                            type="button"
                            onClick={() => toggleDraft(p)}
                          >
                            Draft
                          </button>

                          <button
                            className="btn-outline w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
                            type="button"
                            onClick={() => onDelete(p)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-slate-500">
                  No published properties.
                </div>
              )}
            </div>

            {/* ✅ ADDED: pagination UI (Published) */}
            {!loading && publishedProps.length > PAGE_SIZE && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {(publishedPage - 1) * PAGE_SIZE + 1}
                  </span>
                  –
                  <span className="font-medium text-slate-700">
                    {Math.min(publishedPage * PAGE_SIZE, publishedProps.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-700">
                    {publishedProps.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* First Page Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={publishedPage <= 1}
                    onClick={() => setPublishedPage(1)}
                    title="First page"
                  >
                    «
                  </button>

                  {/* Previous Page Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={publishedPage <= 1}
                    onClick={() => setPublishedPage((p) => Math.max(1, p - 1))}
                    title="Previous page"
                  >
                    ‹
                  </button>

                  {/* Current Page Info */}
                  <div className="text-sm text-slate-600 px-2">
                    Page{" "}
                    <span className="font-semibold text-slate-900">
                      {publishedPage}
                    </span>{" "}
                    /{" "}
                    <span className="font-semibold text-slate-900">
                      {publishedTotalPages}
                    </span>
                  </div>

                  {/* Next Page Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={publishedPage >= publishedTotalPages}
                    onClick={() =>
                      setPublishedPage((p) =>
                        Math.min(publishedTotalPages, p + 1)
                      )
                    }
                    title="Next page"
                  >
                    ›
                  </button>

                  {/* Last Page Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={publishedPage >= publishedTotalPages}
                    onClick={() => setPublishedPage(publishedTotalPages)}
                    title="Last page"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* ✅ Cards: Draft */}
          <section className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="heading-md">Draft</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Hidden from Home/Listings.
                </p>
              </div>
              <div className="text-sm text-slate-500">
                Count:{" "}
                <span className="font-semibold text-slate-900">
                  {draftProps.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {loading ? (
                <CardSkeleton />
              ) : draftPageItems.length ? (
                draftPageItems.map((p) => {
                  const img = firstImage(p);
                  return (
                    <div
                      key={p._id}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
                    >
                      <div className="h-48 sm:h-44 md:h-48 bg-slate-100">
                        {img ? (
                          <img
                            src={img}
                            alt={p.title || "Property"}
                            className="w-full h-full object-cover grayscale-[15%]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200" />
                        )}
                      </div>

                      <div className="p-4 sm:p-5">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {p.mode || "—"}
                          </span>
                          <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {p.type || "—"}
                          </span>
                          <span className="text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Draft (hidden)
                          </span>
                        </div>

                        <div className="font-semibold text-slate-900 break-words">
                          {p.title || "—"}
                        </div>
                        <div className="text-sm text-slate-500 mt-1 break-words">
                          {p.community || p.location || "—"}
                        </div>

                        <div className="text-gold font-semibold mt-3">
                          {p.displayPrice ||
                            (p.price ? `AED ${formatNumber(p.price)}` : "—")}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-5">
                          <Link
                            className="btn-outline w-full sm:w-auto text-center bg-[#b3975b]/10 text-[#b3975b] border-[#b3975b]/40 hover:bg-[#b3975b]/20"
                            to={`/admin/properties?id=${p.id ?? p._id}`}
                          >
                            Edit
                          </Link>

                          <Link
                            className="btn-outline w-full sm:w-auto text-center"
                            to={`/property/${p.id ?? p._id}`}
                          >
                            View
                          </Link>

                          <button
                            className="btn-outline w-full sm:w-auto"
                            type="button"
                            onClick={() => toggleDraft(p)}
                          >
                            Undraft
                          </button>

                          <button
                            className="btn-outline w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700"
                            type="button"
                            onClick={() => onDelete(p)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-slate-500">
                  No draft properties.
                </div>
              )}
            </div>

            {/* ✅ ADDED: pagination UI (Draft) */}
            {!loading && draftProps.length > PAGE_SIZE && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {(draftPage - 1) * PAGE_SIZE + 1}
                  </span>
                  –
                  <span className="font-medium text-slate-700">
                    {Math.min(draftPage * PAGE_SIZE, draftProps.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-700">
                    {draftProps.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* First Page Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={draftPage <= 1}
                    onClick={() => setDraftPage(1)}
                    title="First page"
                  >
                    «
                  </button>

                  {/* Previous Page Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={draftPage <= 1}
                    onClick={() => setDraftPage((p) => Math.max(1, p - 1))}
                    title="Previous page"
                  >
                    ‹
                  </button>

                  {/* Current Page Info */}
                  <div className="text-sm text-slate-600 px-2">
                    Page{" "}
                    <span className="font-semibold text-slate-900">
                      {draftPage}
                    </span>{" "}
                    /{" "}
                    <span className="font-semibold text-slate-900">
                      {draftTotalPages}
                    </span>
                  </div>

                  {/* Next Page Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={draftPage >= draftTotalPages}
                    onClick={() =>
                      setDraftPage((p) => Math.min(draftTotalPages, p + 1))
                    }
                    title="Next page"
                  >
                    ›
                  </button>

                  {/* Last Page Button */}
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={draftPage >= draftTotalPages}
                    onClick={() => setDraftPage(draftTotalPages)}
                    title="Last page"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
      <Footer />
    </>
  );
}

function CardSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
        >
          <div className="h-44 bg-slate-200 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-3/4 bg-slate-200 animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-slate-200 animate-pulse rounded" />
            <div className="h-4 w-1/3 bg-slate-200 animate-pulse rounded" />
            <div className="h-9 w-full bg-slate-200 animate-pulse rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
}
