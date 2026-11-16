import { Skyline } from "@/components/Skyline";
import { Arrow, SectionHead } from "@/components/ui";
import { how, pilot } from "@/content";

export function Pilot() {
  return (
    <section id="pilot" className="section band-pine pilot" data-chain="5">
      <div className="graph" aria-hidden="true" />
      <Skyline close />
      <div className="wrap">
        <SectionHead label={pilot.label} title={pilot.title} />
        <ol className="asks" data-reveal>
          {pilot.asks.map((ask) => (
            <li key={ask.number}>
              <span className="figure">{ask.number}</span>
              <span className="asks-text">{ask.body}</span>
            </li>
          ))}
        </ol>
        <div className="pilot-foot" data-reveal>
          <div className="pilot-signed">
            <p>{pilot.founders}</p>
            {/* The chain ends here, so the record is stamped. The words are read out
                in the "How it works" section; this copy is decoration. */}
            <span className="stamp stamp-close" aria-hidden="true">
              {how.boundary.seal}
            </span>
          </div>
          <a className="btn btn-cream" href={pilot.contact.href}>
            {pilot.contact.label}
            <Arrow />
          </a>
        </div>
        {/* The closing city stands on this box's bottom edge (see Skyline.tsx). */}
        <div className="pilot-ground" data-plot aria-hidden="true" />
      </div>
    </section>
  );
}
