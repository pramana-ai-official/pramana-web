import { footer, nav, wordmark } from "@/content";

/**
 * The logo: the P that curls round the star, beside the name. The mark is decoration here,
 * since the name next to it already says who this is.
 */
function Wordmark({ href }: { href?: string }) {
  const text = (
    <>
      {/* A plain img: a small local SVG needs no image optimisation. */}
      <img src="/brand/mark.svg" alt="" width={24} height={38} />
      <span>
        {wordmark.name} <b>{wordmark.suffix}</b>
      </span>
    </>
  );
  return href ? (
    <a href={href} className="wordmark">
      {text}
    </a>
  ) : (
    <span className="wordmark">{text}</span>
  );
}

export function SiteHeader() {
  const links = nav.links.map((link) => (
    <a key={link.href} href={link.href}>
      {link.label}
    </a>
  ));
  return (
    <>
      <header className="site-header">
        <nav aria-label="Main" className="wrap site-nav">
          <Wordmark href="#top" />
          <div className="site-links">{links}</div>
          <a href={nav.cta.href} className="btn btn-maroon btn-small">
            {nav.cta.label}
          </a>
        </nav>
      </header>
      {/* On phones the four links move to a row under the header that scrolls away. */}
      <nav aria-label="Sections" className="mobile-links">
        {links}
      </nav>
    </>
  );
}

export function SiteFooter() {
  const { sources } = footer;
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-brand">
          <Wordmark />
          <p>{footer.tagline}</p>
        </div>
        <div className="footer-notes">
          <p>{footer.principle}</p>
          <p>
            {sources.before}
            <em>{sources.report}</em>
            {sources.after}
          </p>
          <p>{footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
