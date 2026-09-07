# Security policy

## Supported versions

Cloud Peek is in early development. Security fixes target the latest `master`; older snapshots are not maintained separately. Use the newest version and keep dependencies current.

## Report a vulnerability privately

Use [GitHub private vulnerability reporting](https://github.com/IsaacHatilima/CloudPeek/security/advisories/new). If that is unavailable, email isaachatilima@gmail.com with the subject “Cloud Peek security report”. Do not open a public issue containing an exploit or sensitive data.

Include the affected commit/version, reproduction steps with test credentials, expected and actual behavior, and the potential impact. Never include active API tokens, customer data, or private environment values. Coordinate public disclosure with the maintainer after a fix is available. This is a volunteer project and has no guaranteed response SLA or paid bounty program.

## Testing boundaries

Test with resources and credentials you own or have permission to use. Avoid production writes, disruption, and accessing others' data. Vulnerabilities in Laravel Cloud itself should go to Laravel through its own reporting process.

The app stores tokens in device secure storage. CI uses mocked API requests and never needs live Cloud credentials. Report unexpected logging, persistence, or display of credentials as a security concern.
