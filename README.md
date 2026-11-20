# Pramana AI landing page

The public website for Pramana AI, built with Next.js 16, React 19 and TypeScript: one long landing page and a
pre-registration form. There is no database and no login. The form needs two settings on the host (see below).

## Run it

Needs Node.js 20.9 or newer.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Starts the page for editing. It reloads as you save      |
| `npm run build`     | Makes the optimised version that goes live               |
| `npm run start`     | Serves that built version, to check it before going live |
| `npm run typecheck` | Checks the TypeScript for mistakes                       |
| `npm run format`    | Formats all the code with Prettier                       |

## Where things are

| What                                                               | File                                        |
| ------------------------------------------------------------------ | ------------------------------------------- |
| **Every word on the page**                                         | `src/content.ts`                            |
| Colours, type and all styles                                       | `src/app/globals.css`                       |
| Font, page title and share tags                                    | `src/app/layout.tsx`                        |
| Section order                                                      | `src/app/page.tsx`                          |
| One file per section                                               | `src/components/sections/`                  |
| The skyline drawing (canvas animation), in the hero and at the end | `src/components/Skyline.tsx`                |
| The badge at the bottom of the screen                              | `src/components/RecordChip.tsx`             |
| Scroll animations and number count-ups                             | `src/components/Reveal.tsx`                 |
| The three product screens                                          | `src/assets/`                               |
| The logo mark and the browser-tab icon                             | `public/brand/mark.svg`, `src/app/icon.svg` |
| Server settings (image formats, safety headers)                    | `next.config.ts`                            |
| The pre-registration page, its form and the code that emails it    | `src/app/register/`                         |
| The form's rules: which answers are allowed                        | `src/lib/registration.ts`                   |

## Rules

- **The copy is the founder's.** It lives in `src/content.ts`, word for word. Change a string only with her
  approval. No invented figures. The exceptions are noted in that file.
- **Cream, red and green only. No yellow.**
- **Red marks where a person acts or signs:** calls to action, the stamp, the checker's marks, "Where the
  machine stops", the Signer. It is not a status colour.
- **Never use red for text, lines or small marks on dark green** (contrast 1.5:1). Use cream or the soft red.
- **Square corners.** Nothing is rounded except the stamp and the numbered bubbles.
- **Screens are prototypes with sample data.** Keep the captions that say so.
- **Motion** respects the "reduce motion" setting, and the page reads fully without scripts.

## The pre-registration form

The hero's main button opens `/register`. A visitor says who they are, where they work and what they would like;
the site emails the entry to the team, with the visitor as the reply address, so the team answers by pressing Reply.

- **Nothing is stored.** The entry exists only as that email. No database, no analytics, no mail to the visitor.
- **The server checks every answer** (`src/lib/registration.ts`): allowed choices, lengths, the shape of the email
  and phone number. Line breaks are stripped from one-line answers, so nothing typed can add an email header.
- **A hidden field catches simple bots.** Whatever fills it gets a thank-you and no email is sent.
- **If the email cannot be sent,** the visitor keeps their answers and is offered a link that sends the same message
  from their own email.
- **It works with scripts off:** the browser posts the form and the page comes back with the result.

**Settings on the host** (Vercel: Project, Settings, Environment Variables). `.env.example` lists them.

| Name                                    | What it is                                                           |
| --------------------------------------- | -------------------------------------------------------------------- |
| `SMTP_USER`                             | The mailbox that sends the mail, for example `team@pramanaai.in`     |
| `SMTP_PASS`                             | That mailbox's password. Never put it in the code                    |
| `SMTP_HOST`, `SMTP_PORT`, `REGISTER_TO` | Optional. Defaults: `smtp.hostinger.com`, `465`, `team@pramanaai.in` |

Until `SMTP_USER` and `SMTP_PASS` are set, every entry falls back to the "send from your own email" link.

**Not done:** there is no limit on how often one visitor can submit. If spam arrives, add a rate limit in the host's
firewall.

## Going live

The page runs on any host that runs Next.js (Vercel is the simplest). Its address, `https://pramanaai.in`, is set
as `meta.url` in `src/content.ts`.

Still open:

1. **Founder's sign-off** on three changes made on 16 Nov 2026:
   - the hero's main button, "Pre-register with us" (an email link), which replaced her "Propose a pilot" button
   - the removed dashboard picture under the hero, and its caption
   - the logo
2. **Add a share picture** (1200 × 630) as `src/app/opengraph-image.png`, so links shared on WhatsApp or LinkedIn
   show a picture.
3. **Founder's sign-off on the form's wording** (`registration` in `src/content.ts`), written on 21 Nov 2026.
4. **Check the email works:** the form and the pilot section's link both write to `team@pramanaai.in`.

Not included, on purpose: analytics, a cookie banner, a sitemap.

## How it was checked

- No sideways scrolling and no overlapping text at twelve widths from 320 to 1920 pixels.
- Animation measured on a computer slowed down four times: it holds 60 frames a second.
- One small gap remains: on phones the product screens scroll sideways inside their frame, and Safari on a very
  narrow desktop window cannot reach that frame with the keyboard.
