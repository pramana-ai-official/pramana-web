import { SectionHead } from "@/components/ui";
import { problem } from "@/content";

export function Problem() {
  const { deadline, interviews } = problem;
  return (
    <section className="section" data-chain="0">
      <div className="wrap">
        <SectionHead label={problem.label} title={problem.title} body={problem.body} />
        <ul className="gaps" data-reveal>
          {problem.gaps.map((gap) => (
            <li key={gap.title}>
              <h3>{gap.title}</h3>
              <p>{gap.body}</p>
            </li>
          ))}
        </ul>
        <div className="problem-blocks">
          <div className="deadline" data-reveal>
            <div className="graph" aria-hidden="true" />
            <p className="figure" data-count="2026">
              {deadline.figure}
            </p>
            <p className="deadline-text">{deadline.body}</p>
          </div>
          <div className="interviews">
            <p className="interviews-source">{interviews.source}</p>
            <dl className="figures" data-reveal>
              {interviews.figures.map((item) => (
                <div key={item.label}>
                  <dt className="figure">{item.figure}</dt>
                  <dd>{item.label}</dd>
                </div>
              ))}
            </dl>
            <p className="interviews-quote">
              {interviews.quoteLead} <strong>{interviews.quote}</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
