# Sprint 0 App Shell Validation

## Scope

Validated the initial Weldoo app shell before starting product features.

## Implemented

- Shared application shell with brand header and primary navigation.
- Responsive home dashboard for Sprint 0 status and next sprint scope.
- Links to the UI style guide and development healthcheck.
- Navigation items for future product areas are visible but not clickable until implemented.

## Automated Checks

```bash
npm run lint
npm run build
```

Both checks pass.

## Responsive Notes

- Header stacks on small screens and becomes horizontal on large screens.
- Main content stacks on mobile and becomes a two-column layout on desktop.
- Primary actions stack on mobile and align horizontally from the `sm` breakpoint.
- Navigation supports horizontal overflow on narrow screens.
- Long brand subtitle is truncated to avoid header overflow.

## Manual Browser Check

Checked against the running local app at:

- `http://127.0.0.1:3002/`
- `http://127.0.0.1:3002/style-guide`
- `http://127.0.0.1:3002/api/dev/health`

Results:

- Home shell loads with header, navigation, main content, and workspace aside.
- Style guide route renders the UI component examples.
- Development healthcheck responds with the expected unconfigured Supabase status when `.env.local` values are not set.
- Browser console check returned no errors or warnings on the home shell.
- Screenshot capture timed out in the Codex browser integration, so validation was performed through DOM and route checks.

Recommended viewport checks:

- Mobile: 390 x 844
- Tablet: 768 x 1024
- Desktop: 1440 x 900
