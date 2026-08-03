import { useState } from "react";
import { Headphones, Mail, ShieldCheck, Send } from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function SupportPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill all the fields.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiRequest("/support-tickets/", { method: "POST", body: form });
      setTicket(data);
      setForm((f) => ({ ...f, subject: "", message: "" }));
      toast.success("Support request submitted!");
    } catch (err) {
      toast.error(err.message || "Could not submit your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Support</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">We’re here to help.</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-5">
            <Headphones className="text-orange-500" size={20} />
            <p className="mt-4 text-base font-semibold text-gray-900">Live assistance</p>
            <p className="mt-2 text-sm text-gray-600">Talk to our agents for order, account, or checkout help.</p>
          </div>
          <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-5">
            <Mail className="text-orange-500" size={20} />
            <p className="mt-4 text-base font-semibold text-gray-900">Email support</p>
            <p className="mt-2 text-sm text-gray-600">support@ruchigo.online</p>
          </div>
          <div className="rounded-[24px] border border-orange-100 bg-orange-50 p-5">
            <ShieldCheck className="text-orange-500" size={20} />
            <p className="mt-4 text-base font-semibold text-gray-900">Secure resolution</p>
            <p className="mt-2 text-sm text-gray-600">Account-sensitive issues are routed through protected flows.</p>
          </div>
        </div>

        <div className="mt-10 rounded-[24px] border border-orange-100 bg-orange-50/50 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Raise a support request</h2>
          <p className="mt-1 text-sm text-gray-600">Tell us what went wrong and our team will get back to you.</p>

          {ticket && (
            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              Request #{ticket.id} submitted. Our team will reach out at {ticket.email}.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">Your name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Order issue, refund, account help..."
                className="mt-1 w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                placeholder="Describe your issue in detail..."
                className="mt-1 w-full resize-none rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-orange-600 disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
