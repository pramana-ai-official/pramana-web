import dashboard from "@/assets/state-dashboard.png";
import { type Mark, Screen, SectionHead } from "@/components/ui";
import { states } from "@/content";

// The part of the dashboard each point describes, in the order of `states.points`:
// the map, the submissions chart, the corporations and failing checks, the review queue.
const PARTS: Mark[] = [
  [16.9, 10.6, 58.5, 40.4],
  [55.4, 51.4, 20, 44.8],
  [75.65, 10.6, 21.95, 85.6],
  [36.15, 51.4, 18.95, 22.2],
];

// The selected project's pin on the map, in percent of the picture. It pulses.
const PIN: [number, number] = [32.95, 31.2];

export function States() {
  return (
    <section id="states" className="section band-pine" data-chain="0">
      <div className="graph" aria-hidden="true" />
      <div className="wrap">
        <SectionHead label={states.label} title={states.title} body={states.body} />
        {/* Pointing at a point lights its part of the screen, and the other way round. */}
        <div className="showcase" data-reveal>
          <Screen src={dashboard} alt={states.imageAlt} caption={states.caption} marks={PARTS} pulse={PIN} />
          <ul className="points" data-reveal>
            {states.points.map((point) => (
              <li key={point.title}>
                <h3>{point.title}</h3>
                <p>{point.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
