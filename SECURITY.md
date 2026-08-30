# Security Policy

AssetLane is built by Miriyam Core. This policy describes how to report security issues and what falls within scope.

## In scope

Reports are welcome for vulnerabilities affecting:

- Authentication and session handling
- Admin authorization boundaries
- Stripe checkout and webhook verification
- bKash payment callback handling
- Secure download token generation and enforcement
- File upload validation and private storage access
- Secret and credential handling (environment variables, admin settings)
- SMTP configuration and email content injection

## Out of scope

The following are generally not treated as security vulnerabilities:

- Missing features or configuration recommendations documented in [BETA_LAUNCH.md](BETA_LAUNCH.md)
- Issues requiring physical or local machine access to an already-compromised host
- Social engineering attacks against merchants or buyers
- Denial of service through resource exhaustion without a practical exploit path

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Send a private report including:

1. Summary of the issue
2. Affected component or endpoint
3. Steps to reproduce
4. Potential impact
5. Proof of concept, if available

If a dedicated security contact email is published for Miriyam Core, use that address. Until then, use the private contact method listed on the repository profile.

## Response process

1. **Acknowledge** receipt of the report
2. **Reproduce** and assess severity
3. **Develop** a fix or mitigation
4. **Coordinate** disclosure with the reporter

We ask that you do not publicly disclose the issue until we have had reasonable time to address it.

## Supported versions

Security fixes are applied to the active development branch. Self-hosted deployments should track the latest release and apply updates promptly.

## Secure deployment

Operators are responsible for:

- Setting a strong `JWT_SECRET` in production
- Serving the application over HTTPS
- Protecting database and storage volumes
- Rotating payment and SMTP credentials when compromised

See [BETA_LAUNCH.md](BETA_LAUNCH.md) for deployment hardening guidance.
