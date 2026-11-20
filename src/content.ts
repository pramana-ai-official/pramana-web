/**
 * Every word on the landing page.
 *
 * This copy is the founder's (website/v1-founder/index.html, 15 Nov 2026) and is kept
 * word for word, punctuation included. Change a string here only with her approval.
 * Figures come from NITI Aayog (Feb 2026), the Oct 2026 officer interviews and the
 * ECBC 2017 clause map; none are invented.
 */

/** Our contact address. It fills the founder's "[CONTACT EMAIL]" placeholder (16 Nov 2026). */
export const EMAIL = "team@pramanaai.in";

export const meta = {
  /** The page's public address. Share previews and search engines read it. */
  url: "https://pramanaai.in",
  title: "Pramana AI — compliance records for building energy codes",
  description:
    "Pramana reads values from a building project's documents, checks each clause by clause against the state's notified limit, and keeps every result on an append-only record.",
};

export const nav = {
  links: [
    { href: "#how", label: "How it works" },
    { href: "#states", label: "For states" },
    { href: "#developers", label: "For developers" },
    { href: "#assessors", label: "For assessors" },
  ],
  cta: { href: "#pilot", label: "Start a pilot" },
  /** On the pre-registration page, where the section links have nothing to point at. */
  back: { href: "/", label: "Back to the site" },
};

export const hero = {
  label: "Compliance records for ECBC 2017 and ECSBC 2024",
  title: "Making a building energy code something a state can see.",
  body: "Pramana reads values from the documents a building project already produces, checks each one clause by clause against the state's notified limit, and keeps every result on an append-only record. The empanelled assessor signs. Pramana keeps the evidence.",
  // The hero's main call to action. Not in the founder's page: it was added on
  // 16 Nov 2026 and took the place of her "Propose a pilot" button (the header's
  // "Start a pilot" and the pilot section still lead there). Since 21 Nov 2026 it opens
  // the pre-registration form instead of an email.
  register: { href: "/register", label: "Pre-register with us" },
  secondary: { href: "#how", label: "See how it works" },
  // The founder's page also showed the state dashboard here, under the hero. It was removed
  // on 16 Nov 2026 because the same screen appears in "For states". Its caption was
  // "State dashboard · prototype with sample data".
};

export const problem = {
  label: "The problem",
  title: "Notifying the code is the easy part.",
  body: "India's energy conservation codes for buildings are notified, but what happens after notification is mostly unseen. NITI Aayog's February 2026 buildings report sets out the gap.",
  gaps: [
    { title: "No dataset", body: "There is no consolidated record of the building stock." },
    { title: "Checked by hand", body: "Compliance is checked manually, where it is checked at all." },
    { title: "No capacity", body: "Urban local bodies lack the people to verify it." },
    { title: "Never enforced", body: "No penalty for non-compliance has ever been levied." },
  ],
  deadline: {
    figure: "2030",
    body: "The report recommends that every state build a compliance portal before 2030. Today, exactly one state has anything working.",
  },
  interviews: {
    source: "From our interviews with municipal town-planning officers, October 2026",
    figures: [
      { figure: "10–15", label: "people in town planning for a city of five lakh" },
      { figure: "2", label: "signatures carry a sanction" },
      { figure: "0", label: "projects tracked after sanction" },
    ],
    quoteLead: "Asked whether the department could verify an energy mandate:",
    quote: "“generally, no.”",
  },
};

export const how = {
  label: "How it works",
  title: "A portal moves a form. A record holds the evidence.",
  body: "BEE already gives compliance calculators away. What's missing is the chain of custody that carries compliance data from a project to the regulator, in a form the regulator can act on.",
  steps: [
    {
      number: "1",
      title: "Read",
      body: "Values are read from the drawings, schedules and test certificates the project already produces. No new form, no data entry.",
    },
    {
      number: "2",
      title: "Check",
      body: "Each value is checked clause by clause against the state-notified limit for its building type, climate zone and tier. Every result carries its clause.",
    },
    {
      number: "3",
      title: "Keep",
      body: "An append-only record of every decision, every document version (hashed, superseded but never replaced) and every assessor's identity.",
    },
  ],
  boundary: {
    label: "Where the machine stops",
    body: "Values are extracted and checked by machine, then verified by your empanelled assessor. No certificate is ever issued by a model.",
    seal: "Evidence on record",
  },
  stages: [
    { label: "Stage 1 · before plan approval", title: "Design compliance certificate" },
    { label: "Stage 2 · before the occupancy certificate", title: "Construction-stage verification" },
  ],
};

export const ruleSet = {
  label: "The rule set",
  title: "We have already read the code.",
  body: "ECBC 2017 is transcribed into 873 atomic checks, each tied to its clause, climate zone, tier and the evidence it needs. Where the published code is blank or inconsistent, we flag it to the assessor. We never quietly fill the gap.",
  note: "Limits and chapter numbers come from the code version your state has notified.",
  total: "873",
  totalLabel: "checkable parameters in ECBC 2017",
  /** `share` is the bar length the founder's page drew, as a percentage of the longest bar. */
  systems: [
    { name: "Lighting", count: "286", share: 100 },
    { name: "Envelope", count: "180", share: 63 },
    { name: "Whole building performance", count: "180", share: 63 },
    { name: "Comfort systems", count: "115", share: 40 },
    { name: "Electrical and renewable", count: "104", share: 36 },
    { name: "Scope and compliance", count: "8", share: 3 },
  ],
};

export const states = {
  label: "For state agencies and municipal corporations",
  title: "Your own building stock, for the first time.",
  body: "The state is the beneficiary, not the labour. The developer supplies the evidence, the empanelled assessor checks it, and the state receives the record. The verification happens outside your payroll.",
  imageAlt: "State dashboard prototype showing every project on a map with its compliance status",
  caption: "State dashboard · prototype with sample data and anonymised corporations",
  points: [
    {
      title: "Every figure has an address",
      body: "Each project sits on the map, linked to its record and its evidence.",
    },
    {
      title: "The numbers you're asked for",
      body: "Submissions, approvals and compliance rate by municipality, building type and month, with exports for the State Energy Efficiency Index.",
    },
    {
      title: "Which corporation, which check",
      body: "See where compliance falls short and which clauses fail most often.",
    },
    {
      title: "A review queue for your officers",
      body: "Approve, query with reasons or reject with reasons, so each decision is defensible in minutes.",
    },
  ],
};

export const record = {
  label: "The project record",
  title: "A decision you can still explain in five years.",
  body: "One project ID from application to occupation. Every value on the record traces back the same way.",
  chain: ["Evidence document", "Extracted value", "Clause and limit", "Result", "Assessor's decision", "Signer"],
  imageAlt:
    "Project record prototype: identity, applicability, compliance checks by chapter, audit trail and evidence vault",
  caption: "Project record · prototype with sample data",
};

export const developers = {
  label: "For developers, architects and MEP consultants",
  title: "Submit what you already have.",
  body: "A guided submission, chapter by chapter, with one upload per requirement. It asks for specifications, not a bill of quantities, and it should be easier than today's process.",
  points: [
    "Know at once whether the code applies to your building",
    "See every failing check with its clause, before the assessor does",
    "Answer queries in one thread, with revised documents kept as new versions",
    "Forms save as you go and uploads resume on a weak connection",
  ],
  intake: {
    label: "Guided intake · in design",
    rows: [
      { name: "Building envelope", status: "Upload per requirement" },
      { name: "Lighting", status: "Upload per requirement" },
      { name: "Electrical and renewable", status: "Upload per requirement" },
      { name: "Simulation report", status: "Accepted as an upload" },
    ],
  },
};

export const assessors = {
  label: "For empanelled assessors and energy auditors",
  title: "You certify. We put the evidence in front of you.",
  body: "Your queue, the failing checks with their clauses, the documents behind every value, and the query thread, all on one screen.",
  imageAlt:
    "Assessor workbench prototype: review queue, failing check with shortfall, query thread, evidence versions and decision buttons",
  caption: "Assessor workbench · prototype with sample data",
  points: [
    {
      title: "Shortfalls, stated plainly",
      body: "Proposed value, limit and clause side by side for every check.",
    },
    {
      title: "Queries with the clause attached",
      body: "Ask the developer for what's missing, citing the exact requirement.",
    },
    {
      title: "Every version kept",
      body: "Revised documents supersede, never replace. The trail shows what you saw.",
    },
    {
      title: "Your decision, your signature",
      body: "Issue the design certificate, raise a query, or reject with reasons.",
    },
  ],
};

export const commitments = {
  label: "Built for a regulator",
  title: "One test for every design decision: does it make the record more trustworthy?",
  items: [
    { title: "Data stays in India", body: "Records and documents are hosted in the country." },
    {
      title: "Audit records can't be altered",
      body: "An append-only log with hashed document storage.",
    },
    {
      title: "Role-based access",
      body: "Submitter, reviewer, assessor, municipal admin and state admin.",
    },
    {
      title: "Configured per state",
      body: "Code version, thresholds, climate zones, amendments and assessor model.",
    },
    { title: "Open exports", body: "Every record exportable in an open format." },
    {
      title: "Your language",
      body: "English first; Hindi and the state language after the pilot.",
    },
  ],
};

export const pilot = {
  label: "A first pilot",
  title: "Start with one corporation.",
  asks: [
    {
      number: "1",
      body: "One municipal corporation, ideally one already receiving submissions under the notified rules.",
    },
    {
      number: "2",
      body: "A contact at the state designated agency who knows which code version the rules bind to and how empanelment works.",
    },
    {
      number: "3",
      body: "Two or three empanelled assessors, working on the platform from the first file.",
    },
  ],
  founders: "Vaishnavi Yerte and Carlos Cordeiro, founders",
  /** The founder's wording, with her "[CONTACT EMAIL]" placeholder filled in. */
  contact: { href: `mailto:${EMAIL}`, label: `Write to us · ${EMAIL}` },
};

export const footer = {
  tagline: "Regional Building Impact Platform",
  principle: "Empanelled assessors certify. Pramana keeps the evidence and issues no certificates.",
  sources: {
    before: "Problem statistics: NITI Aayog, ",
    report: "Scenarios Towards Viksit Bharat and Net Zero: Sectoral Insights, Buildings",
    after:
      ", February 2026. Capacity figures: Pramana interviews, October 2026. Screens show prototypes with sample data.",
  },
  copyright: "© 2026 Pramana AI",
};

export const wordmark = { name: "Pramana", suffix: "AI" };

/**
 * The pre-registration form (the page at /register). None of this is the founder's copy:
 * it was written on 21 Nov 2026 and waits for her sign-off. The four kinds of visitor are
 * the three the page already speaks to, plus everyone else.
 */
export const registration = {
  title: "Pre-register with us",
  lead: "Tell us who you are and where you work. We read every entry and write back by email.",
  role: {
    legend: "Who you are",
    options: [
      { value: "state", label: "State agency or municipal corporation" },
      { value: "developer", label: "Developer, architect or MEP consultant" },
      { value: "assessor", label: "Empanelled assessor or energy auditor" },
      { value: "other", label: "Someone else" },
    ],
  },
  details: "Your details",
  contact: "How to reach you",
  interest: {
    legend: "What you would like",
    options: [
      { value: "pilot", label: "Take part in the first pilot" },
      { value: "walkthrough", label: "See a walkthrough" },
      { value: "updates", label: "Stay informed" },
    ],
  },
  fields: {
    name: { label: "Full name" },
    organisation: { label: "Organisation", hint: "Department, corporation or firm" },
    title: { label: "Your role there" },
    state: { label: "State or union territory", choose: "Choose one", abroad: "Outside India" },
    email: { label: "Work email" },
    phone: { label: "Phone" },
    message: { label: "Anything we should know" },
  },
  optional: "optional",
  submit: "Send pre-registration",
  sending: "Sending",
  notice: "We use these details only to write back to you about Pramana AI.",
  errors: {
    summary: "Some answers are missing or need a second look.",
    role: "Choose the one that fits you best.",
    name: "Enter your name.",
    organisation: "Enter where you work.",
    title: "Shorten this a little.",
    state: "Choose your state or union territory.",
    email: "Enter an email address we can reply to.",
    phone: "Enter a phone number, or leave this empty.",
    interest: "Choose what you would like.",
    message: "Shorten this to 1,500 characters.",
  },
  done: {
    title: "Received.",
    body: "Thank you. Your details are with the Pramana team, and we will write back to the address you gave.",
  },
  unsent: {
    title: "This did not send from the page.",
    body: "Your answers are still below. Send them from your own email instead; they reach the same inbox.",
    action: "Send by email",
  },
};
