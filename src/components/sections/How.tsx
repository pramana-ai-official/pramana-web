import type { CSSProperties } from "react";
import { SectionHead } from "@/components/ui";
import { how } from "@/content";

export function How() {
  const { boundary } = how;
  return (
    <section id="how" className="section band-cream" data-chain="1">
      <div className="wrap">
        <SectionHead label={how.label} title={how.title} body={how.body} />
        <div className="steps" data-reveal>
          <ol>
            {how.steps.map((step, i) => (
              <li key={step.title} style={{ "--i": i } as CSSProperties}>
                <span className="step-num">{step.number}</span>
                {/* The dashed rail to the next step. */}
                {i < how.steps.length - 1 && <span className="step-rail" aria-hidden="true" />}
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="boundary" data-reveal>
          <p className="label">{boundary.label}</p>
          <p className="boundary-text">{boundary.body}</p>
          <span className="stamp stamp-outline">{boundary.seal}</span>
        </div>
        <div className="stages">
          {how.stages.map((stage) => (
            <div key={stage.title} className="stage">
              <p className="stage-label">{stage.label}</p>
              <p className="stage-title">{stage.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
