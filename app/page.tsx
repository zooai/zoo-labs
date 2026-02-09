import {
  fetchAllRepos,
  filterAndSortRepos,
  calculateStats,
  categorizeRepos,
  formatCount,
  formatRelativeTime,
  getPagesUrl,
  getLanguageColor,
  type GitHubRepo,
} from '@/lib/github';
import { config } from '@/lib/config';
import {
  Star,
  GitFork,
  ExternalLink,
  Github,
  Code2,
  Package,
  FileText,
  Globe,
  Clock,
  Eye,
  Scale,
  Blocks,
  Cpu,
  Terminal,
} from 'lucide-react';

async function getRepoData() {
  const allRepos = await fetchAllRepos();
  const publicRepos = filterAndSortRepos(allRepos);
  const stats = calculateStats(publicRepos);
  const categories = categorizeRepos(publicRepos);

  return { repos: publicRepos, stats, categories, totalFetched: allRepos.length };
}

function LuxLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fill="currentColor"
        fontSize="32"
        fontWeight="bold"
        fontFamily="system-ui, sans-serif"
      >
        LUX
      </text>
    </svg>
  );
}

function RepoCard({ repo, featured = false }: { repo: GitHubRepo; featured?: boolean }) {
  const pagesUrl = getPagesUrl(repo);
  const langColor = getLanguageColor(repo.language);

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
        featured
          ? 'bg-bg-secondary border-border-light hover:border-brand/50'
          : 'bg-bg-card border-border hover:border-border-light'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Code2 className="w-5 h-5 text-brand shrink-0" />
          <h3 className="font-semibold text-text-primary truncate group-hover:text-brand transition-colors">
            {repo.name}
          </h3>
          {featured && (
            <span className="px-2 py-0.5 text-xs bg-brand/20 text-brand rounded-full shrink-0">
              Featured
            </span>
          )}
        </div>
        <ExternalLink className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>

      <p className="text-sm text-text-secondary mb-3 line-clamp-2 min-h-[2.5rem]">
        {repo.description || 'No description available'}
      </p>

      {repo.topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {repo.topics.slice(0, 4).map((topic) => (
            <span
              key={topic}
              className="px-2 py-0.5 text-xs bg-bg-secondary text-text-muted rounded-md border border-border"
            >
              {topic}
            </span>
          ))}
          {repo.topics.length > 4 && (
            <span className="px-2 py-0.5 text-xs text-text-muted">+{repo.topics.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColor }} />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" />
          {formatCount(repo.stargazers_count)}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5" />
          {formatCount(repo.forks_count)}
        </span>
        {repo.license && (
          <span className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            {repo.license.spdx_id}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {formatRelativeTime(repo.pushed_at)}
        </span>
      </div>

      {pagesUrl && (
        <div className="mt-3 pt-3 border-t border-border">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-md">
            <Globe className="w-3 h-3" />
            Pages
          </span>
        </div>
      )}
    </a>
  );
}

function CategorySection({
  title,
  repos,
  icon: Icon,
  featuredNames,
}: {
  title: string;
  repos: GitHubRepo[];
  icon: React.ElementType;
  featuredNames: string[];
}) {
  if (repos.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-6 h-6 text-brand" />
        <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
        <span className="px-2 py-0.5 text-sm bg-bg-secondary text-text-muted rounded-full">
          {repos.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {repos.map((repo) => (
          <RepoCard key={repo.id} repo={repo} featured={featuredNames.includes(repo.name)} />
        ))}
      </div>
    </section>
  );
}

const categoryIcons: Record<string, React.ElementType> = {
  'Blockchain Core': Blocks,
  'SDKs & Libraries': Package,
  'Web & Frontend': Globe,
  Infrastructure: Cpu,
  Documentation: FileText,
  Other: Terminal,
};

export default async function Home() {
  const { repos, stats, categories } = await getRepoData();

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="hero-glow" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LuxLogo className="w-8 h-8 text-brand" />
            <span className="font-bold text-xl text-text-primary">{config.org.name}</span>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href={config.links.docs}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Docs
            </a>
            <a
              href={config.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-secondary border border-border mb-6">
            <span className="text-brand font-medium">{config.org.tagline}</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6">
            {config.org.name}
          </h1>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            {config.org.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-brand" />
              <span className="text-2xl font-bold text-text-primary">{stats.totalRepos}</span>
              <span className="text-text-muted">repos</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-brand" />
              <span className="text-2xl font-bold text-text-primary">
                {formatCount(stats.totalStars)}
              </span>
              <span className="text-text-muted">stars</span>
            </div>
            <div className="flex items-center gap-2">
              <GitFork className="w-5 h-5 text-brand" />
              <span className="text-2xl font-bold text-text-primary">
                {formatCount(stats.totalForks)}
              </span>
              <span className="text-text-muted">forks</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-brand" />
              <span className="text-2xl font-bold text-text-primary">{stats.languages}</span>
              <span className="text-text-muted">languages</span>
            </div>
          </div>
        </div>
      </section>

      {/* Repositories */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        {Object.entries(categories).map(([category, categoryRepos]) => (
          <CategorySection
            key={category}
            title={category}
            repos={categoryRepos}
            icon={categoryIcons[category] || Terminal}
            featuredNames={config.featuredRepos}
          />
        ))}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {config.footer.sections.map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold text-text-primary mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-text-muted hover:text-text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <p className="text-sm text-text-muted">
              &copy; {new Date().getFullYear()} {config.footer.copyright.text}
            </p>
            <span className="px-3 py-1 text-xs bg-bg-primary text-text-muted rounded-full border border-border">
              {config.footer.copyright.badge}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
