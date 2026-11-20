/**
 * The pre-registration form's rules, shared by the page and the server.
 *
 * Everything a visitor types is untrusted. `readRegistration` is the one place it is read:
 * it trims, strips control characters, checks every answer against an allowed shape, and
 * hands back clean values plus an error for each answer that did not pass.
 */
import { EMAIL, registration as copy } from "@/content";

export const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const FIELDS = ["role", "name", "organisation", "title", "state", "email", "phone", "interest", "message"] as const;
export type Field = (typeof FIELDS)[number];
export type Values = Record<Field, string>;
export type Errors = Partial<Record<Field, string>>;

/** What the form shows next: the answers to put back, and how the last attempt went. */
export type RegisterState =
  | { status: "idle" | "invalid"; values: Values; errors: Errors }
  | { status: "unsent"; values: Values; errors: Errors; mailto: string }
  | { status: "sent" };

export const EMPTY: Values = {
  role: "",
  name: "",
  organisation: "",
  title: "",
  state: "",
  email: "",
  phone: "",
  interest: "",
  message: "",
};

/** The longest each typed answer may be. The inputs carry the same limits. */
export const LIMITS = { name: 100, organisation: 140, title: 100, email: 254, phone: 24, message: 1500 };

/** One line of text: control characters out (so nothing can break an email header), spaces collapsed. */
const line = (value: FormDataEntryValue | null) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
/** Several lines of text: line breaks kept, every other control character out. */
const lines = (value: FormDataEntryValue | null) =>
  typeof value === "string"
    ? value
        .replace(/\r\n?/g, "\n")
        .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "")
        .trim()
    : "";

const EMAIL_SHAPE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;.]{2,}$/;
const PHONE_SHAPE = /^\+?[\d\s().-]{6,23}$/;
const oneOf = (options: { value: string }[], value: string) => options.some((o) => o.value === value);

export function readRegistration(form: FormData): { values: Values; errors: Errors } {
  const values: Values = {
    role: line(form.get("role")),
    name: line(form.get("name")),
    organisation: line(form.get("organisation")),
    title: line(form.get("title")),
    state: line(form.get("state")),
    email: line(form.get("email")),
    phone: line(form.get("phone")),
    interest: line(form.get("interest")),
    message: lines(form.get("message")),
  };
  const errors: Errors = {};
  const say = copy.errors;
  if (!oneOf(copy.role.options, values.role)) errors.role = say.role;
  if (!values.name || values.name.length > LIMITS.name) errors.name = say.name;
  if (!values.organisation || values.organisation.length > LIMITS.organisation) errors.organisation = say.organisation;
  if (values.title.length > LIMITS.title) errors.title = say.title;
  if (values.state !== copy.fields.state.abroad && !STATES.includes(values.state)) errors.state = say.state;
  if (values.email.length > LIMITS.email || !EMAIL_SHAPE.test(values.email)) errors.email = say.email;
  if (values.phone && !PHONE_SHAPE.test(values.phone)) errors.phone = say.phone;
  if (!oneOf(copy.interest.options, values.interest)) errors.interest = say.interest;
  if (values.message.length > LIMITS.message) errors.message = say.message;
  // An answer that failed a choice list is not shown back: it was never one of ours.
  if (errors.role) values.role = "";
  if (errors.state) values.state = "";
  if (errors.interest) values.interest = "";
  return { values, errors };
}

const labelOf = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? "";

/** The plain-text email the team receives. Plain text on purpose: nothing a visitor typed can turn into markup. */
export function emailFor(v: Values): { subject: string; text: string } {
  const rows: [string, string][] = [
    [copy.role.legend, labelOf(copy.role.options, v.role)],
    [copy.fields.name.label, v.name],
    [copy.fields.organisation.label, v.organisation],
    [copy.fields.title.label, v.title],
    [copy.fields.state.label, v.state],
    [copy.fields.email.label, v.email],
    [copy.fields.phone.label, v.phone],
    [copy.interest.legend, labelOf(copy.interest.options, v.interest)],
  ];
  const width = Math.max(...rows.map(([name]) => name.length)) + 2;
  const table = rows.filter(([, value]) => value).map(([name, value]) => `${`${name}:`.padEnd(width)} ${value}`);
  const message = v.message ? ["", `${copy.fields.message.label}:`, v.message] : [];
  return { subject: `Pre-registration: ${v.name}, ${v.organisation}`, text: [...table, ...message].join("\n") };
}

/** The same message as a link that opens the visitor's own email, for when the page cannot send it. */
export function mailtoFor(v: Values): string {
  const { subject, text } = emailFor(v);
  return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}
