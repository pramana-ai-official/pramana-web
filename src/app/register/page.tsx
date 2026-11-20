import type { Metadata } from "next";
import { PageHeader, SiteFooter } from "@/components/sections/SiteChrome";
import { registration } from "@/content";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: `${registration.title} · Pramana AI`,
  description: registration.lead,
  alternates: { canonical: "/register" },
};

/** The pre-registration page: the hero's main button leads here. */
export default function RegisterPage() {
  return (
    <>
      <PageHeader />
      <main className="section reg-sheet">
        <div className="graph" aria-hidden="true" />
        <div className="wrap">
          <div className="head">
            <p className="label">{registration.label}</p>
            <h1>{registration.title}</h1>
            <p className="lead">{registration.lead}</p>
          </div>
          <RegisterForm />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
