import Image, { type StaticImageData } from "next/image";
import type { CSSProperties } from "react";

/** The arrow on primary buttons. Decoration: hidden from screen readers. */
export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2 8h11M8.5 3.5 13 8l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A section heading. On wide screens the label sits in the left margin with the heading
 * beside it; on small screens it sets after the heading.
 */
export function SectionHead({
  label,
  title,
  body,
  wide,
}: {
  label: string;
  title: string;
  body?: string;
  wide?: boolean;
}) {
  return (
    <div className="head" data-wide={wide || undefined} data-reveal>
      <p className="label">{label}</p>
      <h2>
        {title.split(/(?<=\.) /).map((sentence) => (
          <span key={sentence}>{sentence} </span>
        ))}
      </h2>
      {body && <p className="lead">{body}</p>}
    </div>
  );
}

/** A part of a screen to bracket, in percent of the picture: [left, top, width, height]. */
export type Mark = [number, number, number, number];

/**
 * A prototype screen in its pine frame, with the founder's caption. `marks` brackets
 * parts of the picture in the checker's red, like the read marks on the hero drawing.
 */
export function Screen({
  src,
  alt,
  caption,
  marks,
  pulse,
}: {
  src: StaticImageData;
  alt: string;
  caption: string;
  marks?: Mark[];
  /** A point on the picture that pulses, in percent: [left, top]. */
  pulse?: [number, number];
}) {
  return (
    <figure className="screen">
      <div className="screen-frame">
        <div className="screen-plate">
          <Image
            src={src}
            alt={alt}
            sizes="(max-width: 560px) 760px, (max-width: 1240px) 94vw, 1024px"
            placeholder="blur"
          />
          {marks && (
            <div className="marks" aria-hidden="true">
              {marks.map(([x, y, w, h], i) => (
                <i
                  key={i}
                  style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, "--i": i } as CSSProperties}
                />
              ))}
            </div>
          )}
          {pulse && <span className="pulse" style={{ left: `${pulse[0]}%`, top: `${pulse[1]}%` }} aria-hidden="true" />}
        </div>
      </div>
      {/* Phones only: shows that the screen scrolls sideways, and how far along it is. */}
      <span className="screen-track" aria-hidden="true">
        <i />
      </span>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
