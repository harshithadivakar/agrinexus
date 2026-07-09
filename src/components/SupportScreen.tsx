import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Mail, Phone, Terminal, Send, CheckCircle2 } from 'lucide-react';

export default function SupportScreen() {
  const [subject, setSubject] = useState('pairing');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [telemetryPulled, setTelemetryPulled] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setMessage('');
    }, 4000);
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

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#58605b] tracking-wider mb-1 ml-1">Issue Category</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
              disabled={!message}
              className={`w-full h-11 rounded-full font-heading font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                message
                  ? 'bg-[#ba1a1a] text-white hover:bg-red-800 shadow-md active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" /> Submit Support Ticket
            </button>
          </form>
        </section>

        {/* Quick Contacts */}
        <section className="space-y-2">
          <h3 className="font-heading font-bold text-xs text-[#58605b] uppercase tracking-widest ml-1">Emergency Lines</h3>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <a
              href="mailto:support@agrinexus.in"
              className="p-3 bg-white border border-[#D8E4DA]/40 rounded-xl hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-1 group"
            >
              <Mail className="w-5 h-5 text-sky-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-[#181c1a]">Email Support</span>
              <span className="text-[9px] text-[#58605b]">support@agrinexus.in</span>
            </a>
            <div
              onClick={() => alert('Direct Call Center open: 9am - 6pm (IST) on +91-80-45920')}
              className="p-3 bg-white border border-[#D8E4DA]/40 rounded-xl hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer"
            >
              <Phone className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold text-[#181c1a]">Direct Hot-line</span>
              <span className="text-[9px] text-[#58605b]">+91-80-45920</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
