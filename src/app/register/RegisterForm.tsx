"use client";

import { useActionState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/sections/SiteChrome";
import { Arrow } from "@/components/ui";
import { nav, registration as copy } from "@/content";
import { EMPTY, LIMITS, STATES, type Errors, type Field, type RegisterState, type Values } from "@/lib/registration";
import { register } from "./actions";

const IDLE: RegisterState = { status: "idle", values: EMPTY, errors: {} };
const describedBy = (...ids: (string | false | undefined)[]) => ids.filter(Boolean).join(" ") || undefined;

/**
 * The pre-registration page: its header, its heading and the form. The server decides what
 * is valid and sends the mail (actions.ts); this draws the answers, the errors it sends back, and the
 * three ways an attempt can end. It works with scripts off too: the browser posts the form
 * and the page comes back with the same result.
 *
 * Once an entry is sent, the page is only the receipt: the form's heading and the header's
 * back link go, and one "Back to the site" stays under the message.
 */
export function RegisterForm() {
  const [state, action, pending] = useActionState(register, IDLE);
  // After each attempt, move to the result so a keyboard or screen-reader user lands on it.
  const result = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status !== "idle") result.current?.focus();
  }, [state]);

  const sent = state.status === "sent";
  return (
    <>
      <PageHeader back={!sent} />
      <main className="section reg-sheet">
        <div className="graph" aria-hidden="true" />
        <div className="wrap">
          {sent ? (
            <div className="form-done" ref={result} tabIndex={-1} role="status">
              <h1>{copy.done.title}</h1>
              <p className="lead">{copy.done.body}</p>
              <a className="btn btn-line" href={nav.back.href}>
                {nav.back.label}
              </a>
            </div>
          ) : (
            <>
              <div className="head">
                <p className="label">{copy.label}</p>
                <h1>{copy.title}</h1>
                <p className="lead">{copy.lead}</p>
              </div>
              <Fields state={state} action={action} pending={pending} result={result} />
            </>
          )}
        </div>
      </main>
    </>
  );
}

/** The form itself: every question, the errors, and the send bar. */
function Fields({
  state,
  action,
  pending,
  result,
}: {
  state: Exclude<RegisterState, { status: "sent" }>;
  action: (form: FormData) => void;
  pending: boolean;
  result: React.RefObject<HTMLDivElement | null>;
}) {
  const { values, errors } = state;
  return (
    // The server checks every answer, so the browser's own pop-up checks are switched off:
    // one set of rules, and errors that look like the rest of the page.
    <form className="reg-form" action={action} noValidate>
      {state.status === "invalid" && (
        <div className="form-alert" ref={result} tabIndex={-1} role="alert">
          <p>{copy.errors.summary}</p>
        </div>
      )}
      {state.status === "unsent" && (
        <div className="form-alert" ref={result} tabIndex={-1} role="alert">
          <h2>{copy.unsent.title}</h2>
          <p>{copy.unsent.body}</p>
          <a className="btn btn-maroon" href={state.mailto}>
            {copy.unsent.action}
            <Arrow />
          </a>
        </div>
      )}

      <Choices name="role" group={copy.role} values={values} errors={errors} />

      <div className="reg-group">
        <h2 className="reg-legend">{copy.details}</h2>
        <div className="reg-grid">
          <Text name="name" autoComplete="name" values={values} errors={errors} />
          <Text name="organisation" autoComplete="organization" values={values} errors={errors} />
          <Text name="title" autoComplete="organization-title" optional values={values} errors={errors} />
          <div className="field" data-invalid={errors.state ? "" : undefined}>
            <label htmlFor="reg-state">{copy.fields.state.label}</label>
            {/* The key makes React draw a fresh list after each attempt: a reset form
                otherwise falls back to the list's very first choice, not the last answer. */}
            <select
              key={values.state}
              id="reg-state"
              name="state"
              defaultValue={values.state}
              required
              aria-invalid={errors.state ? true : undefined}
              aria-describedby={describedBy(errors.state && "reg-state-error")}
            >
              <option value="" disabled>
                {copy.fields.state.choose}
              </option>
              {STATES.map((name) => (
                <option key={name}>{name}</option>
              ))}
              <option>{copy.fields.state.abroad}</option>
            </select>
            <Problem id="reg-state-error" text={errors.state} />
          </div>
        </div>
      </div>

      <div className="reg-group">
        <h2 className="reg-legend">{copy.contact}</h2>
        <div className="reg-grid">
          <Text name="email" type="email" autoComplete="email" inputMode="email" values={values} errors={errors} />
          <Text name="phone" type="tel" autoComplete="tel" inputMode="tel" optional values={values} errors={errors} />
        </div>
      </div>

      <Choices name="interest" group={copy.interest} values={values} errors={errors}>
        <div className="field" data-invalid={errors.message ? "" : undefined}>
          <label htmlFor="reg-message">
            {copy.fields.message.label}
            <span className="field-optional">{copy.optional}</span>
          </label>
          <textarea
            id="reg-message"
            name="message"
            rows={4}
            maxLength={LIMITS.message}
            defaultValue={values.message}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy(errors.message && "reg-message-error")}
          />
          <Problem id="reg-message-error" text={errors.message} />
        </div>
      </Choices>

      {/* A field for bots only: off screen, out of the tab order, hidden from screen readers. */}
      <div className="field-trap" aria-hidden="true">
        <label htmlFor="reg-website">Website</label>
        <input id="reg-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="reg-send">
        <button type="submit" className="register register-submit" disabled={pending}>
          <span className="register-label" aria-live="polite">
            {pending ? copy.sending : copy.submit}
          </span>
          <span className="register-go" aria-hidden="true">
            <Arrow />
          </span>
        </button>
        <p className="reg-notice">{copy.notice}</p>
      </div>
    </form>
  );
}

type Shared = { values: Values; errors: Errors };

/** One error line under a field. Not red: on this page red means a person acts or signs. */
function Problem({ id, text }: { id: string; text?: string }) {
  return text ? (
    <p className="field-error" id={id}>
      {text}
    </p>
  ) : null;
}

/** A single-line answer with its label, optional hint and error. */
function Text({
  name,
  type = "text",
  optional,
  values,
  errors,
  ...input
}: Shared & {
  name: Exclude<Field, "role" | "state" | "interest" | "message">;
  type?: "text" | "email" | "tel";
  optional?: boolean;
  autoComplete: string;
  inputMode?: "email" | "tel";
}) {
  const field: { label: string; hint?: string } = copy.fields[name];
  const id = `reg-${name}`;
  return (
    <div className="field" data-invalid={errors[name] ? "" : undefined}>
      <label htmlFor={id}>
        {field.label}
        {optional && <span className="field-optional">{copy.optional}</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={values[name]}
        maxLength={LIMITS[name]}
        required={!optional}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={describedBy(field.hint && `${id}-hint`, errors[name] && `${id}-error`)}
        {...input}
      />
      {field.hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {field.hint}
        </p>
      )}
      <Problem id={`${id}-error`} text={errors[name]} />
    </div>
  );
}

/** One question answered by picking a tile. Whatever is passed as children sits under the tiles. */
function Choices({
  name,
  group,
  values,
  errors,
  children,
}: Shared & {
  name: "role" | "interest";
  group: { legend: string; options: { value: string; label: string }[] };
  children?: React.ReactNode;
}) {
  const error = `reg-${name}-error`;
  return (
    <div className="reg-group">
      <fieldset
        className="choices"
        data-invalid={errors[name] ? "" : undefined}
        aria-describedby={describedBy(errors[name] && error)}
      >
        <legend className="reg-legend">{group.legend}</legend>
        <div className="choice-list" data-count={group.options.length}>
          {group.options.map((option) => (
            <label className="choice" key={option.value}>
              <input
                type="radio"
                name={name}
                value={option.value}
                defaultChecked={values[name] === option.value}
                required
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <Problem id={error} text={errors[name]} />
      </fieldset>
      {children}
    </div>
  );
}
