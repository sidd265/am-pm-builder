import { useState, useMemo } from 'react';
import { Search, GitBranch, GitPullRequest, Users, Star, Code2, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { repositories, pullRequests, teamMembers } from '@/data/mockData';

// Build a map: repo → contributors with their PRs
function buildContributorMap(repoName: string) {
  const repoPRs = pullRequests.filter((pr) => pr.repo === repoName);

  const memberMap = new Map<
    string,
    {
      member: (typeof teamMembers)[0];
      prs: typeof repoPRs;
      reviews: number;
    }
  >();

  repoPRs.forEach((pr) => {
    const existing = memberMap.get(pr.author.id) ?? {
      member: pr.author,
      prs: [],
      reviews: 0,
    };
    existing.prs.push(pr);
    memberMap.set(pr.author.id, existing);

    pr.reviewers.forEach((r) => {
      const rev = memberMap.get(r.id) ?? { member: r, prs: [], reviews: 0 };
      rev.reviews++;
      memberMap.set(r.id, rev);
    });
  });

  return [...memberMap.values()];
}

function matchExpert(query: string, repoName: string) {
  if (!query.trim()) return null;
  const q = query.toLowerCase();
  const contributors = buildContributorMap(repoName);

  return contributors
    .map(({ member, prs, reviews }) => {
      const expertiseScore = member.expertise.filter((e) => e.toLowerCase().includes(q)).length;
      const prScore = prs.filter((pr) => pr.title.toLowerCase().includes(q)).length;
      return { member, prs, reviews, score: expertiseScore * 3 + prScore * 2 };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);
}

const RepoExplorer = () => {
  const [selectedRepo, setSelectedRepo] = useState(repositories[0].name);
  const [expertQuery, setExpertQuery] = useState('');

  const repo = repositories.find((r) => r.name === selectedRepo)!;
  const contributors = useMemo(() => buildContributorMap(selectedRepo), [selectedRepo]);
  const expertMatches = useMemo(() => matchExpert(expertQuery, selectedRepo), [expertQuery, selectedRepo]);

  return (
    <div className="px-4 py-4 md:px-8 md:py-6 space-y-6 max-w-[1100px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Repo Explorer</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Find who worked on what across your repositories</p>
        </div>
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View on GitHub
        </a>
      </div>

      {/* Repo selector + meta */}
      <div className="airbnb-card-static p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Select Repository</label>
            <Select value={selectedRepo} onValueChange={setSelectedRepo}>
              <SelectTrigger className="h-10 border-border/50 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {repositories.map((r) => (
                  <SelectItem key={r.id} value={r.name}>
                    <span className="flex items-center gap-2">
                      <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
                      {r.fullName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Find expert for issue</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <Input
                placeholder="e.g. authentication, payment, dashboard…"
                value={expertQuery}
                onChange={(e) => setExpertQuery(e.target.value)}
                className="pl-9 h-10 border-border/50 bg-muted/30"
              />
            </div>
          </div>
        </div>

        {/* Repo meta badges */}
        <div className="flex flex-wrap gap-3 pt-1">
          {[
            { icon: Code2, label: repo.language, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
            { icon: Star, label: `${repo.stars} stars`, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
            { icon: Users, label: `${repo.contributors} contributors`, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
            { icon: GitPullRequest, label: `${repo.openPRs} open PRs`, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
            { icon: Clock, label: `Updated ${repo.lastUpdated}`, color: 'text-muted-foreground bg-muted' },
          ].map(({ icon: Icon, label, color }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${color}`}>
              <Icon className="w-3 h-3" />
              {label}
            </span>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">{repo.description}</p>
      </div>

      {/* Expert search results */}
      {expertQuery && expertMatches !== null && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {expertMatches.length === 0 ? 'No matches found' : `${expertMatches.length} expert${expertMatches.length > 1 ? 's' : ''} matched`}
              <span className="text-muted-foreground font-normal ml-1">for "{expertQuery}"</span>
            </h2>
          </div>

          {expertMatches.length === 0 ? (
            <div className="airbnb-card-static p-8 text-center text-muted-foreground text-sm">
              No team members matched that query in this repository.
            </div>
          ) : (
            expertMatches.map(({ member, prs, reviews, score }) => (
              <ExpertCard key={member.id} member={member} prs={prs} reviews={reviews} score={score} highlight={expertQuery} />
            ))
          )}
        </div>
      )}

      {/* All contributors */}
      {!expertQuery && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Contributors to <code className="text-primary font-mono">{selectedRepo}</code>
          </h2>

          {contributors.length === 0 ? (
            <div className="airbnb-card-static p-8 text-center text-muted-foreground text-sm">
              <div className="text-3xl mb-2">🔭</div>
              No PR activity found for this repo in the current dataset.
            </div>
          ) : (
            contributors.map(({ member, prs, reviews }) => (
              <ExpertCard key={member.id} member={member} prs={prs} reviews={reviews} score={0} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface ExpertCardProps {
  member: (typeof teamMembers)[0];
  prs: ReturnType<typeof buildContributorMap>[0]['prs'];
  reviews: number;
  score: number;
  highlight?: string;
}

const ExpertCard = ({ member, prs, reviews, score, highlight }: ExpertCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const lastPR = prs[prs.length - 1];

  return (
    <div className="airbnb-card-static p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full text-sm text-white flex items-center justify-center font-semibold flex-shrink-0"
          style={{ backgroundColor: member.avatarColor }}
        >
          {member.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground">{member.name}</p>
            {score > 0 && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                {Math.min(score * 15, 98)}% match
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{member.role}</p>
        </div>

        <div className="flex items-center gap-4 text-center flex-shrink-0">
          <div>
            <p className="text-sm font-bold text-foreground">{prs.length}</p>
            <p className="text-[10px] text-muted-foreground">PRs</p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{reviews}</p>
            <p className="text-[10px] text-muted-foreground">Reviews</p>
          </div>
          {lastPR && (
            <div className="hidden sm:block">
              <p className="text-[10px] text-muted-foreground">Last active</p>
              <p className="text-xs font-medium text-foreground">
                {new Date(lastPR.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Expertise tags */}
      <div className="flex flex-wrap gap-1.5">
        {member.expertise.map((tag) => (
          <span
            key={tag}
            className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
              highlight && tag.toLowerCase().includes(highlight.toLowerCase())
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Recent PRs */}
      {prs.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            {expanded ? 'Hide' : 'Show'} {prs.length} PR{prs.length > 1 ? 's' : ''} in this repo
          </button>

          {expanded && (
            <div className="mt-2 space-y-1.5 pl-4 border-l-2 border-border">
              {prs.map((pr) => (
                <a
                  key={pr.id}
                  href={`https://github.com/company/${pr.repo}/pull/${pr.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 group"
                >
                  <GitPullRequest className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">
                    #{pr.number} {pr.title}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                    pr.status === 'Open' ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'
                    : pr.status === 'Merged' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400'
                    : 'bg-muted text-muted-foreground'
                  }`}>
                    {pr.status}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepoExplorer;
