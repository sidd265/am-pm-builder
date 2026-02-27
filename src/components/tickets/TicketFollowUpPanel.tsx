import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Send, ChevronRight, Clock, AlertTriangle, MessageSquare, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import type { JiraTicket } from '@/data/mockData';

interface Props {
  ticket: JiraTicket;
  open: boolean;
  onClose: () => void;
}

const templates = [
  {
    key: 'urgent',
    icon: AlertTriangle,
    label: 'Urgent Fix Required',
    color: 'text-red-500 bg-red-50 dark:bg-red-950/40',
    badgeColor: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
    badge: 'Urgent',
    message: (ticket: JiraTicket) =>
      `🚨 Urgent follow-up on ${ticket.key}: "${ticket.title}"\n\nThis ticket is marked as ${ticket.priority} priority and requires immediate attention. Could you please provide an update on the current status and estimated resolution time?\n\nCurrent status: ${ticket.status}\n\nPlease respond ASAP. Thank you.`,
  },
  {
    key: 'status',
    icon: RefreshCw,
    label: 'Status Check',
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
    badgeColor: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    badge: 'Status',
    message: (ticket: JiraTicket) =>
      `Hi team 👋\n\nJust checking in on ${ticket.key}: "${ticket.title}"\n\nCurrent status is "${ticket.status}". Could you share any updates or blockers you might be facing? We'd love to keep stakeholders informed.\n\nThanks!`,
  },
  {
    key: 'blocked',
    icon: AlertTriangle,
    label: 'Unblock Request',
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    badge: 'Blocked',
    message: (ticket: JiraTicket) =>
      `Hi 👋\n\nIt looks like ${ticket.key}: "${ticket.title}" may be blocked.\n\nCould you clarify:\n- What is blocking this ticket?\n- What resources or decisions are needed?\n- Estimated unblock timeline?\n\nLet's get this moving forward. Please update the ticket or reply here.`,
  },
  {
    key: 'deadline',
    icon: Clock,
    label: 'Deadline Reminder',
    color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40',
    badgeColor: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
    badge: 'Deadline',
    message: (ticket: JiraTicket) =>
      `⏰ Deadline reminder for ${ticket.key}: "${ticket.title}"\n\nThis ticket is due soon. Please ensure it's on track for completion. If you anticipate any delays, please flag them immediately so we can adjust the timeline accordingly.\n\nStatus: ${ticket.status} | Priority: ${ticket.priority}`,
  },
  {
    key: 'clarification',
    icon: HelpCircle,
    label: 'Request Clarification',
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40',
    badgeColor: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    badge: 'Clarify',
    message: (ticket: JiraTicket) =>
      `Hi team,\n\nI need some clarification on ${ticket.key}: "${ticket.title}"\n\nCould you please provide more details on:\n- Acceptance criteria\n- Expected behavior / outcome\n- Any technical constraints or dependencies\n\nThis will help us move forward without blockers. Thanks!`,
  },
  {
    key: 'review',
    icon: CheckCircle2,
    label: 'Ready for Review',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    badgeColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    badge: 'Review',
    message: (ticket: JiraTicket) =>
      `Hi 👋\n\n${ticket.key}: "${ticket.title}" appears to be ready for review.\n\nCould the relevant team members please review and provide feedback or sign-off? Let's get this across the finish line!\n\nStatus: ${ticket.status}`,
  },
  {
    key: 'custom',
    icon: MessageSquare,
    label: 'Custom Message',
    color: 'text-muted-foreground bg-muted',
    badgeColor: 'bg-muted text-muted-foreground',
    badge: 'Custom',
    message: (ticket: JiraTicket) =>
      `Follow-up on ${ticket.key}: "${ticket.title}"\n\n`,
  },
];

export const TicketFollowUpPanel = ({ ticket, open, onClose }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const pickTemplate = (key: string) => {
    const tpl = templates.find((t) => t.key === key)!;
    setSelected(key);
    setMessage(tpl.message(ticket));
    setSent(false);
  };

  const handleSend = () => {
    setSent(true);
    setTimeout(() => {
      onClose();
      setSent(false);
      setSelected(null);
      setMessage('');
    }, 1800);
  };

  const reset = () => {
    setSelected(null);
    setMessage('');
    setSent(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full max-w-[480px] z-50 bg-card border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Follow Up</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{ticket.key}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ticket title strip */}
            <div className="px-5 py-3 bg-muted/30 border-b border-border">
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ticket.title}</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Template list */}
              {!selected && (
                <div className="p-4 space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground px-1 mb-3">
                    Choose a follow-up template
                  </p>
                  {templates.map((tpl) => (
                    <button
                      key={tpl.key}
                      onClick={() => pickTemplate(tpl.key)}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all group text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tpl.color}`}>
                        <tpl.icon className="w-[18px] h-[18px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {tpl.label}
                          </p>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${tpl.badgeColor}`}>
                            {tpl.badge}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Message editor */}
              {selected && !sent && (
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={reset}
                      className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      ← Back
                    </button>
                    <span className="text-muted-foreground text-xs">/</span>
                    <span className="text-xs text-muted-foreground">
                      {templates.find((t) => t.key === selected)?.label}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      Message Preview
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={14}
                      className="w-full text-[13px] leading-relaxed text-foreground bg-muted/30 border border-border rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Edit the message before sending. It will be posted as a comment on this ticket.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={reset}
                      className="flex-1 h-9 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    >
                      Change template
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!message.trim()}
                      className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Follow-up
                    </button>
                  </div>
                </div>
              )}

              {/* Sent confirmation */}
              {sent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 px-6 text-center"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Follow-up sent!</p>
                  <p className="text-xs text-muted-foreground mt-1.5 max-w-[260px]">
                    Your message has been posted as a comment on {ticket.key}.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border bg-muted/20">
              <p className="text-[10px] text-muted-foreground text-center">
                Follow-ups are posted as Jira comments · Connect Jira for live delivery
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
