import { config } from './config';

const ORG = process.env.GITHUB_ORG || config.org.github;

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  topics: string[];
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  default_branch: string;
  has_pages: boolean;
  has_wiki: boolean;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  license: { key: string; name: string; spdx_id: string } | null;
  size: number;
  updated_at: string;
  created_at: string;
  pushed_at: string;
}

export async function fetchAllRepos(): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  console.log(`Fetching all repos from ${ORG}...`);

  while (true) {
    const url = `https://api.github.com/orgs/${ORG}/repos?per_page=${perPage}&page=${page}&sort=updated&direction=desc`;

    const headers: HeadersInit = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': `${ORG}-landing`,
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(url, { headers, next: { revalidate: 3600 } });

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('GitHub API rate limit reached. Using cached data if available.');
        break;
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const repos: GitHubRepo[] = await response.json();
    console.log(`Page ${page}: fetched ${repos.length} repos`);

    if (repos.length === 0) break;

    allRepos.push(...repos);
    page++;
  }

  console.log(`Total repos fetched: ${allRepos.length}`);
  return allRepos;
}

export function filterAndSortRepos(repos: GitHubRepo[]): GitHubRepo[] {
  return repos
    .filter((repo) => !repo.archived && !repo.disabled && repo.visibility === 'public')
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
}

export function calculateStats(repos: GitHubRepo[]) {
  return {
    totalRepos: repos.length,
    totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
    languages: [...new Set(repos.map((r) => r.language).filter(Boolean))].length,
  };
}

export function categorizeRepos(repos: GitHubRepo[]) {
  const categories: Record<string, GitHubRepo[]> = {
    'Blockchain Core': [],
    'SDKs & Libraries': [],
    'Web & Frontend': [],
    'Infrastructure': [],
    'Documentation': [],
    'Other': [],
  };

  for (const repo of repos) {
    const name = repo.name.toLowerCase();
    const topics = repo.topics.map((t) => t.toLowerCase());
    const lang = repo.language?.toLowerCase() || '';

    if (
      name.includes('node') ||
      name.includes('chain') ||
      name.includes('consensus') ||
      name.includes('vm') ||
      topics.includes('blockchain')
    ) {
      categories['Blockchain Core'].push(repo);
    } else if (
      name.includes('sdk') ||
      name.includes('lib') ||
      name.includes('client') ||
      topics.includes('sdk') ||
      topics.includes('library')
    ) {
      categories['SDKs & Libraries'].push(repo);
    } else if (
      lang === 'typescript' ||
      lang === 'javascript' ||
      name.includes('web') ||
      name.includes('ui') ||
      name.includes('app') ||
      name.includes('frontend') ||
      topics.includes('react') ||
      topics.includes('nextjs')
    ) {
      categories['Web & Frontend'].push(repo);
    } else if (
      name.includes('infra') ||
      name.includes('deploy') ||
      name.includes('docker') ||
      name.includes('ops') ||
      name.includes('ci') ||
      name.includes('runner') ||
      topics.includes('devops') ||
      topics.includes('infrastructure')
    ) {
      categories['Infrastructure'].push(repo);
    } else if (
      name.includes('doc') ||
      name.includes('guide') ||
      name.includes('tutorial') ||
      name.includes('example') ||
      topics.includes('documentation')
    ) {
      categories['Documentation'].push(repo);
    } else {
      categories['Other'].push(repo);
    }
  }

  return Object.fromEntries(Object.entries(categories).filter(([, repos]) => repos.length > 0));
}

export function formatCount(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function getPagesUrl(repo: GitHubRepo): string | null {
  if (!repo.has_pages) return null;
  const [org, name] = repo.full_name.split('/');
  if (name === `${org}.github.io`) {
    return `https://${org}.github.io`;
  }
  return `https://${org}.github.io/${name}`;
}

export function getLanguageColor(language: string | null): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Go: '#00ADD8',
    Rust: '#dea584',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    Ruby: '#701516',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Scala: '#c22d40',
    Shell: '#89e051',
    Dockerfile: '#384d54',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Vue: '#41b883',
    Svelte: '#ff3e00',
    Solidity: '#AA6746',
    Move: '#4a137f',
    Cairo: '#ff4f00',
  };
  return colors[language || ''] || '#8b8b8b';
}
