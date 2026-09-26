import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminHeader from "../../components/AdminHeader";
import Footer from "../../components/Footer";
import { getToken } from "../../lib/auth";

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center text-[11px] uppercase tracking-widest px-2 py-1 rounded-full border ${
        tones[tone] || tones.slate
      }`}
    >
      {children}
    </span>
  );
}

function formatDateTime(v) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function clamp(s, n = 120) {
  const t = String(s || "");
  if (t.length <= n) return t;
  return t.slice(0, n - 1) + "…";
}

export default function AdminInquiries() {
  const token = useMemo(() => getToken(), []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  // ✅ ADDED: pagination (5 per page)
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/inquiries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(
          j.message || `Failed to load inquiries (${res.status})`
        );
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load inquiries");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    if (!id) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.message || "Update failed");

      setItems((prev) => prev.map((x) => (x._id === id ? j : x)));
    } catch (e) {
      alert(e?.message || "Update failed");
    } finally {
      setUpdatingId("");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { total: items.length, new: 0, read: 0, archived: 0 };
    for (const i of items) c[i.status] = (c[i.status] || 0) + 1;
    return c;
  }, [items]);

  // ✅ ADDED: keep page valid when items change (refresh/status update)
  useEffect(() => {
    const total = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    setPage((p) => Math.min(Math.max(1, p), total));
  }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  return (
    <>
      <AdminHeader />

      <section className="pt-32 section">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <h1 className="heading-lg">Messages (Inquiries)</h1>
              <p className="text-slate-600 mt-2">
                Client requests submitted from property pages.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="blue">Total: {counts.total}</Badge>
                <Badge tone="amber">New: {counts.new}</Badge>
                <Badge tone="slate">Read: {counts.read}</Badge>
                <Badge tone="green">Archived: {counts.archived}</Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Link className="btn-outline" to="/admin">
                Back
              </Link>
              <button className="btn-outline" onClick={load} type="button">
                Refresh
              </button>
            </div>
          </div>

          {err ? (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {err}
            </div>
          ) : null}

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Client</th>
                    <th className="px-5 py-4 font-semibold">Property</th>
                    <th className="px-5 py-4 font-semibold">Message</th>
                    <th className="px-5 py-4 font-semibold">Received</th>
                    <th className="px-5 py-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td className="px-5 py-6 text-slate-600" colSpan={6}>
                        Loading…
                      </td>
                    </tr>
                  ) : pageItems.length ? (
                    pageItems.map((i) => {
                      const p = i.propertySnapshot || {};
                      const statusTone =
                        i.status === "new"
                          ? "amber"
                          : i.status === "read"
                          ? "slate"
                          : "green";

                      return (
                        <tr key={i._id} className="text-slate-700 align-top">
                          <td className="px-5 py-4">
                            <Badge tone={statusTone}>{i.status || "—"}</Badge>
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">
                              {i.name || "—"}
                            </div>
                            <div className="text-slate-500">
                              {i.email || "—"}
                            </div>
                            {i.phone ? (
                              <div className="text-slate-500">{i.phone}</div>
                            ) : null}
                          </td>

                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-900">
                              {p.title || "—"}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {p.mode ? `${p.mode} · ` : ""}
                              {p.type ? `${p.type} · ` : ""}
                              {p.displayPrice ||
                                (p.price ? `AED ${p.price}` : "")}
                            </div>

                            <div className="text-xs text-slate-500 mt-1">
                              {p.community || p.location || "—"}
                              {p.city ? `, ${p.city}` : ""}
                            </div>

                            {p.slug || p.numericId || p._id ? (
                              <Link
                                className="text-xs underline text-gold inline-block mt-2"
                                to={`/property/${p.numericId ?? p._id}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open listing
                              </Link>
                            ) : null}
                          </td>

                          <td className="px-5 py-4 whitespace-pre-wrap">
                            {clamp(i.message, 260)}
                          </td>

                          <td className="px-5 py-4 text-slate-500">
                            {formatDateTime(i.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                className="btn-outline"
                                type="button"
                                disabled={updatingId === i._id}
                                onClick={() => updateStatus(i._id, "read")}
                              >
                                Mark Read
                              </button>
                              <button
                                className="btn-outline"
                                type="button"
                                disabled={updatingId === i._id}
                                onClick={() => updateStatus(i._id, "archived")}
                              >
                                Archive
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="px-5 py-10 text-slate-600" colSpan={6}>
                        No inquiries yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ✅ ADDED: pagination footer (same style as other pages) */}
            {!loading && items.length > PAGE_SIZE && (
              <div className="px-4 sm:px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {(page - 1) * PAGE_SIZE + 1}
                  </span>
                  –
                  <span className="font-medium text-slate-700">
                    {Math.min(page * PAGE_SIZE, items.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-700">
                    {items.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={page <= 1}
                    onClick={() => setPage(1)}
                    title="First page"
                  >
                    «
                  </button>
                  {/* <button
                    type="button"
                    className="btn-outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    title="Previous page"
                  >
                    Prev
                  </button> */}

                  <div className="text-sm text-slate-600 px-2">
                    Page{" "}
                    <span className="font-semibold text-slate-900">{page}</span>{" "}
                    /{" "}
                    <span className="font-semibold text-slate-900">
                      {totalPages}
                    </span>
                  </div>

                  {/* <button
                    type="button"
                    className="btn-outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    title="Next page"
                  >
                    Next
                  </button> */}
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage(totalPages)}
                    title="Last page"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Tip: “Reply-To” is set to the client email in the notification
            email, so you can reply directly.
          </p>
        </div>
      </section>

      <Footer />
    </>
  );
}
