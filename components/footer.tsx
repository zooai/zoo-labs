import { config } from '@/lib/config';

const links = [
  { label: 'zoo.ngo', href: config.links.foundation },
  { label: 'zips.zoo.ngo', href: config.links.zips },
  { label: 'github.com/zooai', href: config.links.github },
];

/** The site's one footer. */
export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} {config.copyright}
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
