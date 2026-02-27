
## Plan: AI Tools for Tickets + Repo Explorer Page

### What's being built

**1. AI Tools Panel on each ticket** — a "sparkle" button on TicketCard (and KanbanCard) that opens a slide-up sheet with AI-powered actions:
- **Understand this ticket** — AI summary of what the ticket involves, acceptance criteria, technical scope
- **Suggest assignee** — matches ticket keywords/type against team member expertise + capacity
- **Find related PRs** — lists PRs from mock data whose title/repo overlaps with the ticket project
- **Estimate complexity** — AI-generated story point estimate with reasoning

**2. New page: `/tickets/repo-explorer`** — "Who worked on this?" feature:
- Repo selector dropdown (from existing `repositories` mock)
- Shows team members who have commits/PRs in that repo (from mock `pullRequests` + `teamMembers`)
- Per-member: contribution count, last active, recent PR titles, expertise tags
- "Find expert for issue" input — user types a component/feature name and it matches against member expertise + PR titles

### Files to create
- `src/components/tickets/TicketAIPanel.tsx` — sheet with 4 AI action cards + results
- `src/pages/RepoExplorer.tsx` — repo explorer page
- `src/services/ticketAI.ts` — mock AI response functions (ready for Gemini backend swap)

### Files to edit
- `src/components/tickets/TicketCard.tsx` — add AI sparkle button, stop propagation on the `<a>` tag, open panel
- `src/components/tickets/KanbanBoard.tsx` — same AI button on KanbanCard
- `src/App.tsx` — add `/tickets/repo-explorer` route
- `src/components/layout/Sidebar.tsx` — add "Repo Explorer" sub-nav link under Tickets or as a standalone nav item

### Key UX decisions
- TicketCard is currently an `<a>` tag — convert to `<div>` with a separate external link icon click to avoid conflicts with the AI button
- AI panel uses Framer Motion sheet sliding up from bottom on mobile, from right on desktop
- Mock AI responses simulate streaming with a typing indicator (setTimeout chunks), ready for real Gemini streaming
- Repo Explorer uses existing mock `repositories`, `pullRequests`, `teamMembers` data — no new mock data needed
