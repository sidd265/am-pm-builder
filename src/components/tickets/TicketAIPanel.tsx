import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, UserCheck, GitPullRequest, Zap, X, Loader2, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { JiraTicket } from '@/data/mockData';
import {
  understandTicket,
  suggestAssignee,
  findRelatedPRs,
  estimateComplexity,
} from '@/services/ticketAI';

interface Props {
  ticket: JiraTicket;
  open: boolean;
  onClose: () => void;
}

type ActionKey = 'understand' | 'assignee' | 'prs' | 'complexity';

const actions: { key: ActionKey; icon: React.ElementType; label: string; description: string; color: string }[] = [
  {
    key: 'understand',
    icon: BookOpen,
    label: 'Understand this ticket',
    description: 'AI summary, acceptance criteria & technical scope',
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
  },
  {
    key: 'assignee',
    icon: UserCheck,
    label: 'Suggest assignee',
    description: 'Matches expertise, capacity & recent activity',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
  },
  {
    key: 'prs',
    icon: GitPullRequest,
    label: 'Find related PRs',
    description: 'PRs linked by keyword & repo overlap',
    color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40',
  },
  {
    key: 'complexity',
    icon: Zap,
    label: 'Estimate complexity',
    description: 'Story-point estimate with reasoning',
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
  },
];

const runners: Record<ActionKey, typeof understandTicket> = {
  understand: understandTicket,
  assignee: suggestAssignee,
  prs: findRelatedPRs,
  complexity: estimateComplexity,
};

export const TicketAIPanel = ({ ticket, open, onClose }: Props) => {
  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runAction = (key: ActionKey) => {
    setActiveAction(key);
    setOutput('');
    setLoading(true);
    runners[key](
      ticket,
      (chunk) => setOutput((prev) => prev + chunk),
      () => setLoading(false)
    );
  };

  const reset = () => {
    setActiveAction(null);
    setOutput('');
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
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
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AI Tools</p>
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
              {/* Action cards */}
              {!activeAction && (
                <div className="p-4 space-y-2">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground px-1 mb-3">Choose an action</p>
                  {actions.map((action) => (
                    <button
                      key={action.key}
                      onClick={() => runAction(action.key)}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all group text-left"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${action.color}`}>
                        <action.icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {action.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{action.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {/* Result view */}
              {activeAction && (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={reset}
                      className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      ← Back
                    </button>
                    <span className="text-muted-foreground text-xs">/</span>
                    <span className="text-xs text-muted-foreground">
                      {actions.find((a) => a.key === activeAction)?.label}
                    </span>
                  </div>

                  {loading && output === '' && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Thinking…
                    </div>
                  )}

                  {output && (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground text-[13px] leading-relaxed">
                      <ReactMarkdown>{output}</ReactMarkdown>
                      {loading && (
                        <span className="inline-block w-1.5 h-4 bg-primary/70 rounded-sm animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border bg-muted/20">
              <p className="text-[10px] text-muted-foreground text-center">
                Powered by AI · Connect Gemini backend for live data
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
