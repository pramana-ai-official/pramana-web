import type { Metadata } from "next";
import { SiteFooter } from "@/components/sections/SiteChrome";
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
      <RegisterForm />
      <SiteFooter />
    </>
  );
}
