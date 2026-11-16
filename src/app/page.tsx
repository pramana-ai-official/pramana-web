import { RecordChip } from "@/components/RecordChip";
import { RevealObserver } from "@/components/Reveal";
import { Assessors } from "@/components/sections/Assessors";
import { Commitments } from "@/components/sections/Commitments";
import { Developers } from "@/components/sections/Developers";
import { Hero } from "@/components/sections/Hero";
import { How } from "@/components/sections/How";
import { Pilot } from "@/components/sections/Pilot";
import { Problem } from "@/components/sections/Problem";
import { ProjectRecord } from "@/components/sections/ProjectRecord";
import { RuleSet } from "@/components/sections/RuleSet";
import { SiteFooter, SiteHeader } from "@/components/sections/SiteChrome";
import { States } from "@/components/sections/States";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <States />
        <Problem />
        <How />
        <RuleSet />
        <ProjectRecord />
        <Developers />
        <Assessors />
        <Commitments />
        <Pilot />
      </main>
      <SiteFooter />
      <RecordChip />
      <RevealObserver />
    </>
  );
}
