import workbench from "@/assets/assessor-workbench.png";
import { Screen, SectionHead } from "@/components/ui";
import { assessors } from "@/content";

export function Assessors() {
  return (
    <section id="assessors" className="section" data-chain="4">
      <div className="wrap">
        <SectionHead label={assessors.label} title={assessors.title} body={assessors.body} />
        <Screen src={workbench} alt={assessors.imageAlt} caption={assessors.caption} />
        <ul className="points" data-boxed>
          {assessors.points.map((point) => (
            <li key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
