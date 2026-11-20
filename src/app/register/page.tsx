import type { Metadata } from "next";
import { SiteFooter } from "@/components/sections/SiteChrome";
import { registration } from "@/content";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: `${registration.title} · Pramana AI`,
  description: registration.lead,
  alternates: { canonical: "/register" },
};

/**
 * The pre-registration page: the hero's main button leads here.
 *
 * The single wrapping block matters. After a click on a link, Next.js scrolls the new page's
 * top-level blocks into view one after another when it judges the top to be out of sight
 * (it is, under our sticky header). With several blocks the last one wins, and the visitor
 * lands on the footer. With one block, the page opens at the top.
 */
export default function RegisterPage() {
  return (
    <div>
      <RegisterForm />
      <SiteFooter />
    </div>
  );
}
