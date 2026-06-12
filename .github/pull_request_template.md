## Description

[What this PR does and why]

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Infrastructure / config
- [ ] Tests

## Related Jira Epic / Task

[WEL-XXX]

## Checklist Before Requesting Claude Code Review

### Code

- [ ] No secrets or credentials in source code
- [ ] No `console.log` in production code
- [ ] Explicit TypeScript types; no unjustified `any`
- [ ] New environment variables added to `.env.example`

### Scalability

- [ ] Lists have bounded pagination
- [ ] Queries have indexes for filtered, joined, ordered, or ownership fields
- [ ] Images use `next/image` or documented exceptions
- [ ] No API calls inside loops
- [ ] No obvious client-side N+1 data fetching

### Security

- [ ] User input is validated server-side
- [ ] Protected routes verify session server-side
- [ ] Supabase RLS impact reviewed
- [ ] No XSS risk from unsanitized HTML
- [ ] Destructive actions use Weldoo-styled confirmation modals

### Tests / Validation

- [ ] Tests added for new critical logic, or manual validation documented
- [ ] Existing checks pass (`npm run lint`, `npm run build`, and tests when available)

## Context For Auditor

[Technical decisions, trade-offs, known limitations, or areas where Claude Code should focus]
