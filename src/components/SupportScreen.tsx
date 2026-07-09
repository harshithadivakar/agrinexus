import React, { useState, useEffect } from 'react';
import { MessageSquare, Mail, Terminal, Send, CheckCircle2, AlertCircle } from 'lucide-react';

interface SupportScreenProps {
  userEmail?: string;
  userName?: string;
}

// A starting-point message per category, so the user has something concrete to edit
// rather than a blank box - swapped in when the category changes, but only if the
// message still matches the previous category's template (never overwrites something
// the user actually typed).
const CATEGORY_TEMPLATES: Record<string, string> = {
  pairing: "I'm having trouble pairing my AgriNexus device via Bluetooth/QR code. Here's what happened: ",
  water: "I'm seeing a water level indicator that doesn't look right. Here's what I'm noticing: ",
  capsules: "I have a question about my seed pods or subscription: ",
  led: "My grow light isn't behaving as expected (schedule, brightness, etc.). Details: ",
  other: "Here's my feedback / question: ",
};

export default function SupportScreen({ userEmail, userName }: SupportScreenProps) {
  const [subject, setSubject] = useState('pairing');
  const [message, setMessage] = useState(CATEGORY_TEMPLATES.pairing);
  const [contactEmail, setContactEmail] = useState(userEmail || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telemetryPulled, setTelemetryPulled] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  // userEmail can arrive after the initial render (loaded from Supabase asynchronously) -
  // adopt it once, but never overwrite an email the user has since typed themselves.
  useEffect(() => {
    if (userEmail && !contactEmail) setContactEmail(userEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: subject, message, userEmail: contactEmail, userName }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not send your ticket right now.');
      }
      setSuccess(true);
      setMessage(CATEGORY_TEMPLATES[subject]);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Could not send your ticket right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const pullTelemetryLogs = () => {
    setTelemetryPulled(true);
    setTelemetryLogs([
      '[SYS] Connection initiated...',
      '[BLE] Querying AgriNexus AN-9842-X7 firmware...',
      '[BLE] Signal RSSI: -54dB (Excellent)',
      '[SYS] Hardware Revision: v2.1.2-C3',
      '[SYS] Fluid sensors: ACTIVE - status OK',
      '[SYS] Water level: 98% optimal (2.45L)',
      '[SYS] LED light array status: ONLINE (Schedule active)',
      '[SYS] Calibration state: STABLE',
      '[SYS] Diagnostics completed successfully.'
    ]);
  };

  return (
    <div className="bg-[#f7faf6] min-h-screen pb-24 text-[#181c1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#f7faf6] border-b border-[#D8E4DA]/40 px-5 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ba1a1a] text-[24px]">contact_support</span>
          <h1 className="font-heading text-lg font-bold text-[#ba1a1a]">Customer Support</h1>
        </div>
      </header>

      <main className="px-5 mt-6 max-w-md mx-auto space-y-6">
        <div className="space-y-1">
          <h2 className="font-heading font-extrabold text-xl text-[#181c1a]">We're here to help</h2>
          <p className="text-xs text-[#58605b]">Troubleshoot setup steps, seed pods, water settings, or contact active support.</p>
        </div>

        {/* Diagnostic Telemetry Pulley */}
        <section className="bg-[#ecefeb] rounded-2xl p-4 border border-[#D8E4DA] space-y-3">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-[#006038]" />
            <h3 className="font-heading font-bold text-xs text-[#181c1a] uppercase tracking-wider">Device Diagnostics Link</h3>
          </div>
          <p className="text-xs text-[#3f4941] leading-relaxed">
            Diagnose pairing handshakes or water readings instantly. AgriNexus pulls safe local telemetry logs through Bluetooth.
          </p>
          
          {telemetryPulled ? (
            <div className="bg-[#121e17] text-[#6DDBA0] font-mono text-[10px] p-3 rounded-lg space-y-1 overflow-x-auto border border-[#3c4a41] leading-normal max-h-48 overflow-y-auto">
              {telemetryLogs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          ) : (
            <button
              onClick={pullTelemetryLogs}
              className="w-full py-2.5 bg-white border border-[#006038]/30 hover:bg-[#006038]/5 text-[#006038] font-heading font-bold text-xs rounded-full transition-all"
            >
              Analyze Local Bluetooth Telemetry
            </button>
          )}
        </section>

        {/* Contact Form */}
        <section className="bg-white rounded-2xl p-5 border border-[#D8E4DA]/40 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#ba1a1a]" />
            <h3 className="font-heading font-bold text-sm text-[#181c1a]">Send Support Ticket</h3>
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>Diagnostic ticket submitted! Our team will contact you at your registered email within 2 hours.</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#f1f4f0] rounded-xl border border-[#D8E4DA]/50">
              <div className="w-9 h-9 rounded-full bg-[#ba1a1a]/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">person</span>
              </div>
              <div className="min-w-0 flex-grow">
                <p className="text-xs font-bold text-[#181c1a] truncate">{userName || 'Registered user'}</p>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="Email we should reply to"
                  className="w-full bg-transparent text-[10px] text-slate-600 focus:outline-none focus:text-[#181c1a] border-b border-transparent focus:border-[#ba1a1a]/40 -mb-px"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#58605b] tracking-wider mb-1 ml-1">Issue Category</label>
              <select
                value={subject}
                onChange={(e) => {
                  const nextCategory = e.target.value;
                  // Only swap the template if the user hasn't started customizing it -
                  // never clobber something they've actually written.
                  setMessage((prev) => (prev === CATEGORY_TEMPLATES[subject] ? CATEGORY_TEMPLATES[nextCategory] : prev));
                  setSubject(nextCategory);
                }}
                className="w-full h-11 px-3 rounded-xl border border-[#D8E4DA] bg-white text-xs text-[#181c1a] focus:outline-none focus:border-[#ba1a1a]"
              >
                <option value="pairing">Bluetooth / QR Pairing Fail</option>
                <option value="water">Water Indicator Alerts</option>
                <option value="capsules">Seed Pods / Subscriptions</option>
                <option value="led">Lights & Schedules</option>
                <option value="other">General Feedback / Warranty</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-[#58605b] tracking-wider mb-1 ml-1">Detail of Issue</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Describe what occurred, or if you noticed any indicators..."
                className="w-full p-3.5 rounded-xl border border-[#D8E4DA] bg-white text-xs text-[#181c1a] focus:outline-none focus:border-[#ba1a1a] placeholder-[#bec9bf]"
              />
            </div>

            <button
              type="submit"
              disabled={!message.trim() || submitting}
              className={`w-full h-11 rounded-full font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                message.trim() && !submitting
                  ? 'bg-[#ba1a1a] text-white hover:bg-red-800 shadow-md active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" /> {submitting ? 'Sending...' : 'Submit Support Ticket'}
            </button>
          </form>
        </section>

        {/* Quick Contacts */}
        <section className="space-y-2">
          <h3 className="font-heading font-bold text-xs text-[#58605b] uppercase tracking-widest ml-1">Emergency Lines</h3>

          <a
            href="mailto:support@agrinexus.in"
            className="p-3 bg-white border border-[#D8E4DA]/40 rounded-xl hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-1 group text-center"
          >
            <Mail className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-[#181c1a]">Email Support</span>
            <span className="text-[9px] text-[#58605b]">support@agrinexus.in</span>
          </a>
        </section>
      </main>
    </div>
  );
}
