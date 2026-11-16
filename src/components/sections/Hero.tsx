import { Skyline } from "@/components/Skyline";
import { Arrow } from "@/components/ui";
import { hero, how, record } from "@/content";

export function Hero() {
  return (
    <section id="top" className="hero-sheet" data-chain="0">
      <div className="graph" aria-hidden="true" />
      <Skyline />
      {/* `data-clear` marks what the skyline keeps clear of: text line by line, or a whole box (see Skyline.tsx). */}
      <div className="wrap hero-inner">
        <p className="label hero-title-block" data-clear="box" data-air="26">
          {hero.label}
        </p>
        <div className="hero-copy">
          <h1 data-clear>{hero.title}</h1>
          <p className="lead" data-clear>
            {hero.body}
          </p>
          <div className="actions">
            {/* The main call to action: it opens an email to us. */}
            <a className="register" href={hero.register.href} data-clear="box">
              <span className="register-label">{hero.register.label}</span>
              <span className="register-go" aria-hidden="true">
                <Arrow />
              </span>
            </a>
            <a className="btn btn-line" href={hero.secondary.href} data-clear="box">
              {hero.secondary.label}
            </a>
          </div>
        </div>
        {/* The canvas stands the city on this box's bottom edge. The stamp and the chain
            repeat words that are read out further down the page, so they are hidden here. */}
        <div className="hero-skyline" data-plot aria-hidden="true">
          <span className="stamp">{how.boundary.seal}</span>
        </div>
        <ol className="chain chain-hero" aria-hidden="true">
          {record.chain.map((link) => (
            <li key={link}>{link}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
