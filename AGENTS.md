# Project rules
- Keep visual styling in global semantic tokens and shared UI primitives so storefront and administrative screens remain consistent.
- Never transform or filter the document body or root layout: third-party payment overlays depend on viewport-relative positioning.
- Keep UI refinements presentation-only; preserve checkout, authentication, analytics, and inventory behavior.