import { config } from '@/lib/config';

function ZooMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
      <text
        x="50"
        y="59"
        textAnchor="middle"
        fill="currentColor"
        fontSize="34"
        fontWeight="bold"
        fontFamily="var(--font-sans)"
      >
        Z
      </text>
    </svg>
  );
}

/** The site's one header: fixed, translucent, and the same on every page. */
export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-white/10 bg-bg-primary/70 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5 text-text-primary transition-opacity hover:opacity-80">
          <ZooMark className="h-6 w-6 text-brand" />
          <span className="text-base font-semibold tracking-tight">{config.org.name}</span>
        </a>

        <nav className="flex items-center gap-5 sm:gap-7">
          {config.nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="hidden text-sm text-text-secondary transition-colors hover:text-text-primary sm:block"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/#chat"
            className="rounded-full bg-brand px-3.5 py-1.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Chat with Blue
          </a>
        </nav>
      </div>
    </header>
  );
}
