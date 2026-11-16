import type { CSSProperties } from "react";
import { ruleSet } from "@/content";

export function RuleSet() {
  return (
    <section className="section" data-chain="2">
      <div className="wrap">
        <div className="head" data-reveal>
          <p className="label">{ruleSet.label}</p>
          <h2>{ruleSet.title}</h2>
          <p className="lead">{ruleSet.body}</p>
          <p className="rules-note">{ruleSet.note}</p>
        </div>
        <div className="rules-block" data-reveal>
          <div className="graph" aria-hidden="true" />
          <div>
            <p className="rules-total">
              <span className="figure" data-count="0">
                {ruleSet.total}
              </span>
              <span>{ruleSet.totalLabel}</span>
            </p>
            <p className="rules-defects">{ruleSet.defects}</p>
          </div>
          <ul className="bars">
            {ruleSet.systems.map((system, i) => (
              <li key={system.name} style={{ "--i": i } as CSSProperties}>
                <span>{system.name}</span>
                <span className="bar-count" data-count="0">
                  {system.count}
                </span>
                <span className="bar-track">
                  {/* "Whole building performance" keeps the lighter bar the founder gave it. */}
                  <span
                    className="bar-fill"
                    style={{ width: `${system.share}%` }}
                    data-alt={system.name === "Whole building performance" || undefined}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
