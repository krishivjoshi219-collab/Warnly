## 2025-05-20 - Hardcoded API Key Fallbacks in Client Code
**Vulnerability:** A hardcoded RevenueCat test API key string was assigned as a fallback in `src/lib/warnly/revenuecat.ts`.
**Learning:** Defaulting to test API key strings directly in source files risks leaking credentials and exposing test environments in production builds.
**Prevention:** Rely strictly on environment variables (`process.env.EXPO_PUBLIC_*` or `process.env.*`) and guard initialization when configuration values are missing.
