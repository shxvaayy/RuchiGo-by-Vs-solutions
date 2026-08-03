import { useCallback, useEffect, useState } from "react";
import { Headphones, Inbox, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_STYLES = {
  open: "bg-orange-100 text-orange-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export default function AdminSupport() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/support-tickets/", { token });
      setTickets(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      toast.error(err.message || "Could not load support tickets.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const updated = await apiRequest(`/support-tickets/${id}/`, { token, method: "PATCH", body: { status } });
      setTickets((list) => list.map((t) => (t.id === id ? updated : t)));
      toast.success(`Ticket #${id} marked ${STATUS_LABELS[status].toLowerCase()}.`);
    } catch (err) {
      toast.error(err.message || "Could not update ticket.");
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Admin</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-black sm:text-4xl">
              <Headphones className="text-orange-500" size={32} />
              Customer Support
            </h1>
            <p className="mt-1 text-sm text-gray-600">Requests submitted by customers from the Support page.</p>
          </div>
          <button
            onClick={loadTickets}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total requests</p>
            <p className="mt-1 text-3xl font-black">{counts.total}</p>
          </div>
          <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Open</p>
            <p className="mt-1 text-3xl font-black text-orange-500">{counts.open}</p>
          </div>
          <div className="rounded-[24px] border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="mt-1 text-3xl font-black text-green-600">{counts.resolved}</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-orange-100 bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-12 text-gray-500">
              <Loader2 className="animate-spin" size={20} />
              Loading tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-gray-500">
              <Inbox size={32} />
              <p className="font-semibold">No support requests yet</p>
              <p className="text-sm">New requests from the Support page will show up here.</p>
            </div>
          ) : (
            <div className="divide-y divide-orange-50">
              {tickets.map((t) => (
                <div key={t.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">#{t.id}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[t.status] || ""}`}>
                        {STATUS_LABELS[t.status] || t.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                      </span>
                    </div>
                    <p className="mt-2 text-base font-bold">{t.subject}</p>
                    <p className="mt-1 text-sm text-gray-600">{t.message}</p>
                    <p className="mt-2 text-xs font-semibold text-gray-500">
                      {t.name} · {t.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={t.status}
                      disabled={updatingId === t.id}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                      className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-orange-400 disabled:opacity-60"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
