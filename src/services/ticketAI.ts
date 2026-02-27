/**
 * Ticket AI service — mock implementations ready for Gemini backend swap.
 * Replace each function body with a real fetch to your edge function.
 */

import type { JiraTicket, TeamMember } from '@/data/mockData';
import { teamMembers, pullRequests } from '@/data/mockData';

export interface AIResult {
  content: string;
  loading: boolean;
}

// ── Understand ticket ────────────────────────────────────────────────
export async function understandTicket(
  ticket: JiraTicket,
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const lines = [
    `## 📋 ${ticket.key} — Ticket Summary\n\n`,
    `**Type:** ${ticket.type}  |  **Priority:** ${ticket.priority}  |  **Project:** ${ticket.project}\n\n`,
    `### What this ticket involves\n`,
    `This ${ticket.type.toLowerCase()} focuses on *${ticket.title}*. `,
    `Based on the ticket type and project context, this work likely touches the ${ticket.project} domain.\n\n`,
    `### Acceptance Criteria (inferred)\n`,
    `- The feature / fix is implemented and unit-tested\n`,
    `- Edge cases for ${ticket.type === 'Bug' ? 'the reported bug scenario' : 'the new functionality'} are covered\n`,
    `- Code is reviewed by at least one senior team member\n`,
    `- Documentation is updated if public-facing APIs change\n\n`,
    `### Technical Scope\n`,
    ticket.type === 'Bug'
      ? `Likely requires root-cause analysis, regression test, and targeted fix. Low blast-radius if isolated correctly.`
      : `Medium-to-high scope depending on integration points. Coordinate with team before modifying shared services.`,
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < lines.length) {
      onChunk(lines[i]);
      i++;
    } else {
      clearInterval(interval);
      onDone();
    }
  }, 80);
}

// ── Suggest assignee ──────────────────────────────────────────────────
export async function suggestAssignee(
  ticket: JiraTicket,
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  // Simple keyword matching
  const keywords = ticket.title.toLowerCase().split(' ');
  const scored: { member: TeamMember; score: number }[] = teamMembers.map((m) => {
    const score = m.expertise.filter((e) =>
      keywords.some((k) => e.toLowerCase().includes(k) || k.includes(e.toLowerCase()))
    ).length + (1 - m.capacity) * 2; // prefer lower utilisation
    return { member: m, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3);

  const lines = [
    `## 👤 Assignee Suggestions\n\n`,
    `Based on expertise matching and current capacity:\n\n`,
    ...top3.map(
      ({ member, score }, i) =>
        `**${i + 1}. ${member.name}** — ${member.role}\n` +
        `   Expertise: ${member.expertise.slice(0, 3).join(', ')}\n` +
        `   Capacity available: ${Math.round((1 - member.capacity) * 100)}%\n` +
        `   Match score: ${Math.min(Math.round(score * 25), 98)}%\n\n`
    ),
    `> Connect your backend to use real workload data and AI-powered matching.`,
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < lines.length) {
      onChunk(lines[i]);
      i++;
    } else {
      clearInterval(interval);
      onDone();
    }
  }, 90);
}

// ── Find related PRs ──────────────────────────────────────────────────
export async function findRelatedPRs(
  ticket: JiraTicket,
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const keywords = ticket.title.toLowerCase().split(' ').filter((w) => w.length > 3);
  const matched = pullRequests.filter(
    (pr) =>
      keywords.some((k) => pr.title.toLowerCase().includes(k)) ||
      pr.repo.toLowerCase().includes(ticket.project.toLowerCase().split(' ')[0])
  );

  const lines: string[] = [
    `## 🔗 Related Pull Requests\n\n`,
    matched.length === 0
      ? `No directly related PRs found in the current dataset.\n\n> When connected to GitHub, this will search commit messages, branch names, and PR descriptions.\n`
      : `Found **${matched.length}** related PR${matched.length > 1 ? 's' : ''}:\n\n`,
    ...matched.map(
      (pr) =>
        `**#${pr.number}** — ${pr.title}\n` +
        `   Repo: \`${pr.repo}\`  |  Status: ${pr.status}  |  Author: ${pr.author.name}\n\n`
    ),
    `> Real-time PR linking requires GitHub integration.`,
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < lines.length) {
      onChunk(lines[i]);
      i++;
    } else {
      clearInterval(interval);
      onDone();
    }
  }, 90);
}

// ── Estimate complexity ───────────────────────────────────────────────
const complexityMap: Record<JiraTicket['type'], { points: number; reasoning: string }> = {
  Bug: { points: 3, reasoning: 'Bugs typically require investigation + targeted fix. Estimated at 3 story points.' },
  Task: { points: 2, reasoning: 'Tasks are usually well-defined. Estimated at 2 story points.' },
  Story: { points: 5, reasoning: 'Stories involve design, implementation, and testing. Estimated at 5 story points.' },
  Epic: { points: 13, reasoning: 'Epics span multiple sprints with many sub-tasks. Estimated at 13 story points.' },
};

export async function estimateComplexity(
  ticket: JiraTicket,
  onChunk: (chunk: string) => void,
  onDone: () => void
) {
  const { points, reasoning } = complexityMap[ticket.type];
  const priorityBonus = ticket.priority === 'Critical' ? 2 : ticket.priority === 'High' ? 1 : 0;
  const finalPoints = points + priorityBonus;

  const lines = [
    `## ⚡ Complexity Estimate\n\n`,
    `### Story Points: **${finalPoints}**\n\n`,
    `${reasoning}\n\n`,
    ticket.priority === 'Critical' || ticket.priority === 'High'
      ? `Priority adjustment (+${priorityBonus} pts): High/Critical tickets often have hidden complexity and require extra care.\n\n`
      : ``,
    `### Breakdown\n`,
    `- **Analysis & design:** ${Math.ceil(finalPoints * 0.2)} pts\n`,
    `- **Implementation:** ${Math.ceil(finalPoints * 0.5)} pts\n`,
    `- **Testing & review:** ${Math.floor(finalPoints * 0.3)} pts\n\n`,
    `> Estimates improve with historical velocity data. Connect your backend to calibrate.`,
  ].filter(Boolean);

  let i = 0;
  const interval = setInterval(() => {
    if (i < lines.length) {
      onChunk(lines[i]);
      i++;
    } else {
      clearInterval(interval);
      onDone();
    }
  }, 85);
}
