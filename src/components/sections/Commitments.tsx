import { SectionHead } from "@/components/ui";
import { commitments } from "@/content";

/** Design commitments, not certifications: keep the wording as the founder wrote it. */
export function Commitments() {
  return (
    <section className="section" data-chain="4">
      <div className="wrap">
        <SectionHead label={commitments.label} title={commitments.title} wide />
        <ul className="points" data-cols="3" data-reveal>
          {commitments.items.map((item) => (
            <li key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
