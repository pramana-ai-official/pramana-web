import type { CSSProperties } from "react";
import projectRecord from "@/assets/project-record.png";
import { Screen, SectionHead } from "@/components/ui";
import { record } from "@/content";

export function ProjectRecord() {
  return (
    <section className="section" data-chain="3">
      <div className="wrap">
        <SectionHead label={record.label} title={record.title} body={record.body} />
        <div data-reveal>
          <ol className="chain chain-record">
            {record.chain.map((link, i) => (
              <li key={link} style={{ "--i": i } as CSSProperties}>
                {link}
              </li>
            ))}
          </ol>
        </div>
        <Screen src={projectRecord} alt={record.imageAlt} caption={record.caption} />
      </div>
    </section>
  );
}
