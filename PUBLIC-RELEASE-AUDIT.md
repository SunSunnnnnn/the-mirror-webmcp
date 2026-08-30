# The Mirror — Public Release Audit

Date: 2026-08-30  
Candidate status: `safe_to_publish_as_independent_public_experiment`

## Scope

This audit covers the independent public source tree and its generated static release. The public release is assembled from an explicit allowlist and contains no inherited repository history.

## Content boundary

| Check | Result |
| --- | --- |
| Four anonymized public cases only | PASS |
| Eight public judgment rules only | PASS |
| Public case identifiers only | PASS |
| Internal source-link fields absent | PASS |
| Legacy case identifiers absent | PASS |
| Proprietary knowledge corpus absent | PASS |
| Client media and other media files absent | PASS |
| Local filesystem paths absent | PASS |
| Common credential and token patterns absent | PASS |

## Runtime boundary

| Check | Result |
| --- | --- |
| Runtime exposes one `public-sample` dataset mode | PASS |
| Data requests stay inside `data/public-sample/` | PASS |
| Exactly four read-only WebMCP tools register | PASS |
| Unsupported-browser fallback remains safe | PASS |
| Remote physical uncertainty boundary remains enforced | PASS |

## Verification

- Public-only Node tests: 24/24 PASS
- Designed-visibility demo journey: PASS
- JSON parsing: PASS
- Source-tree release audit: PASS
- Public-only clean build: PASS
- Built-release smoke test: PASS
- Desktop browser review: PASS at 1265 × 720; four tools discovered; no console errors
- Live WebMCP demo call: PASS; strong fit evidence with `public-case-003` and `public-case-004`
- Fixed-device browser review: PASS at an internal 390 × 844 CSS viewport
- Fixed-device scrolling and replay: PASS; content remained intact with no console errors

## Licensing

- Software: MPL-2.0, official unmodified license text in `LICENSE`
- Public sample data: CC BY 4.0, attribution and scope in `DATA-LICENSE.md`
- The complete proprietary SunSun Design Knowledge Layer is not included in this repository.

## Git boundary

The directory was created without copying another repository's metadata. The release procedure initializes a new local repository only after every check above passes, creates one release-candidate commit, configures no remote, and performs no push or deployment.
