import { SectionHead } from "@/components/ui";
import { developers } from "@/content";

export function Developers() {
  const { intake } = developers;
  return (
    <section id="developers" className="section band-cream" data-chain="3">
      <div className="wrap">
        <SectionHead label={developers.label} title={developers.title} body={developers.body} />
        <div className="dev-grid">
          <ul className="ticks" data-reveal>
            {developers.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <div className="intake" data-reveal>
            <p className="intake-label">{intake.label}</p>
            <ul>
              {intake.rows.map((row) => (
                <li key={row.name}>
                  <span>{row.name}</span>
                  <span className="intake-status">{row.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
