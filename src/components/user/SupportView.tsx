import React, { useState } from 'react';
import {
  HelpCircle,
  MessageSquare,
  Send,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';

export const SupportView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const faqs = [
    {
      q: 'How does the 10-Second Ad Gate work?',
      a: 'Before any task can begin, the sponsor advertisement must remain active on screen for 10 seconds. Leaving the tab, minimizing, or refreshing pauses the countdown to protect sponsors and ensure fair rewards.',
    },
    {
      q: 'How long do withdrawals take via bKash / Nagad / USDT?',
      a: 'Withdrawal requests are processed by the administration team within 1 to 24 hours. Once approved, the funds are sent directly to your specified mobile wallet or crypto address.',
    },
    {
      q: 'How does the referral program calculate commission?',
      a: 'When someone signs up using your unique referral code or link, you automatically earn a configured lifetime commission (e.g. 10%) on every task reward they complete. Self-referrals are disqualified.',
    },
    {
      q: 'Can I use a VPN or multiple accounts?',
      a: 'No. Using proxies, VPNs, or automated bots violates platform terms and will lead to an immediate account suspension.',
    },
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setSubmitted(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="p-4 space-y-4 pb-20 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-950/60 via-slate-900 to-slate-900 border border-teal-500/20 p-4 shadow-lg">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Support & Helpdesk</span>
        </div>
        <h2 className="text-xl font-black text-white">How Can We Help You?</h2>
        <p className="text-xs text-slate-300 mt-1">
          Find instant answers to common questions or reach out to our dedicated support agents.
        </p>
      </div>

      {/* Official Community Channels */}
      <div className="grid grid-cols-2 gap-3">
        <a
          href="https://t.me/"
          target="_blank"
          rel="noreferrer"
          className="p-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 rounded-2xl flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              ✈
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300">
                Telegram Channel
              </h4>
              <p className="text-[10px] text-slate-300">Payment proofs & alerts</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
        </a>

        <a
          href="https://wa.me/"
          target="_blank"
          rel="noreferrer"
          className="p-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">
                WhatsApp Support
              </h4>
              <p className="text-[10px] text-slate-300">Direct agent assistance</p>
            </div>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400" />
        </a>
      </div>

      {/* FAQs */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Frequently Asked Questions
        </h3>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-white hover:bg-slate-800/40 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="p-3.5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/40">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Inquiry Ticket */}
      <form
        onSubmit={handleSubmitTicket}
        className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <MessageSquare className="w-4 h-4 text-teal-400" />
          <span>Submit Support Inquiry</span>
        </div>

        {submitted && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Inquiry submitted! Our support team will reply within 2-4 hours.</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">Subject</label>
          <input
            type="text"
            required
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
            placeholder="e.g., Question about my bKash payout"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-400">Message / Details</label>
          <textarea
            required
            rows={3}
            value={ticketMessage}
            onChange={(e) => setTicketMessage(e.target.value)}
            placeholder="Describe your issue or query clearly..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-500/20"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Ticket</span>
        </button>
      </form>
    </div>
  );
};
