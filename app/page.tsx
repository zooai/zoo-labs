import { ArrowUpRight } from 'lucide-react';
import { BelugaChat } from '@/components/beluga-chat';
import { config } from '@/lib/config';
import {
  fetchAllRepos,
  filterAndSortRepos,
  calculateStats,
  formatCount,
  getLanguageColor,
} from '@/lib/github';

function Section({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: string;
  lede: string;
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-border px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">{title}</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">{lede}</p>
        {children}
      </div>
    </section>
  );
}

function Card({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-border bg-bg-card p-5 transition-colors hover:border-brand/50"
    >
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-text-primary transition-colors group-hover:text-brand">{title}</h3>
        <ArrowUpRight className="h-4 w-4 text-text-muted transition-colors group-hover:text-brand" />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{body}</p>
    </a>
  );
}

export default async function Home() {
  const repos = filterAndSortRepos(await fetchAllRepos());
  const stats = calculateStats(repos);
  const counts = [
    { label: 'repositories', value: `${stats.totalRepos}` },
    { label: 'stars', value: formatCount(stats.totalStars) },
    { label: 'forks', value: formatCount(stats.totalForks) },
    { label: 'languages', value: `${stats.languages}` },
  ];

  return (
    <main>
      <BelugaChat />

      <Section
        id="open-source"
        title="Open Source"
        lede="Everything Zoo Labs builds is public — the research network, the contracts and subgraphs behind it, and the site you are reading. Read it, fork it, send a patch."
      >
        <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {counts.map((c) => (
            <div key={c.label}>
              <dd className="text-3xl font-semibold text-text-primary">{c.value}</dd>
              <dt className="mt-1 font-mono text-xs tracking-widest text-text-muted uppercase">{c.label}</dt>
            </div>
          ))}
        </dl>

        <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {repos.slice(0, 6).map((repo) => (
            <li key={repo.id}>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-card px-4 py-3 transition-colors hover:border-brand/50"
              >
                <span className="truncate font-mono text-sm text-text-primary transition-colors group-hover:text-brand">
                  {repo.name}
                </span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-text-muted">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: getLanguageColor(repo.language) }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span>★ {formatCount(repo.stargazers_count)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/open-source/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand transition-opacity hover:opacity-80"
        >
          Browse every repository
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </Section>

      <Section
        id="research"
        title="Research"
        lede="Zoo Labs Foundation runs open research in decentralized AI and decentralized science. Specifications and proposals are published as ZIPs, in the open, before anything ships."
      >
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card
            href={config.links.zips}
            title="ZIPs"
            body="Zoo Improvement Proposals — the specifications the network is governed and built by."
          />
          <Card
            href={config.links.foundation}
            title="Zoo Labs Foundation"
            body="The 501(c)(3) that funds and publishes the research."
          />
        </div>
      </Section>

      <Section
        id="foundation"
        title="Foundation"
        lede="Zoo Labs Foundation is a 501(c)(3) nonprofit. It funds open research for endangered species and for decentralized science, and keeps every result — models, data, and code — public."
      >
        <a
          href={config.links.foundation}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          zoo.ngo
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </Section>
    </main>
  );
}
