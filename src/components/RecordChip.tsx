"use client";

import { useEffect, useState } from "react";
import { record } from "@/content";

/**
 * The small badge pinned to the bottom of the screen. It shows the chain of custody
 * filling in as the visitor reads: each section carries `data-chain="0..5"`, and the
 * section crossing the middle of the screen sets the step.
 *
 * Decoration (aria-hidden): the same six links are read out in the Project record section.
 */
export function RecordChip() {
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const middle = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setStep(Number((entry.target as HTMLElement).dataset.chain));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    document.querySelectorAll("[data-chain]").forEach((section) => middle.observe(section));

    // Hidden while the hero is on screen (it shows the full chain itself), and once the
    // footer has scrolled up to where the badge sits, so it never covers the footer's text.
    const hero = document.querySelector(".hero-sheet");
    const footer = document.querySelector("footer");
    let heroInView = true;
    let footerInView = false;
    const update = () => setShown(!heroInView && !footerInView);
    // The top margin is the sticky header and the scroll padding under it: a hero that is
    // only showing behind the header counts as gone.
    const pastHero = new IntersectionObserver(
      ([entry]) => {
        heroInView = entry.isIntersecting;
        update();
      },
      { rootMargin: "-84px 0px 0px 0px" },
    );
    const atFooter = new IntersectionObserver(
      ([entry]) => {
        footerInView = entry.isIntersecting;
        update();
      },
      { rootMargin: "0px 0px -48px 0px" },
    );
    if (hero) pastHero.observe(hero);
    if (footer) atFooter.observe(footer);

    return () => {
      middle.disconnect();
      pastHero.disconnect();
      atFooter.disconnect();
    };
  }, []);

  return (
    <div className="record-chip" data-shown={shown || undefined} aria-hidden="true">
      <span className="record-chip-dots">
        {record.chain.map((link, i) => (
          <i key={link} data-on={i <= step || undefined} />
        ))}
      </span>
      <span key={step} className="record-chip-label">
        {record.chain[step]}
      </span>
    </div>
  );
}
