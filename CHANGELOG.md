# Changelog

## [1.0.2] - 2025-12-11
### Added
- Status message area and contextual feedback for all tools (encrypt, decrypt, sign, verify, generate).
- Automatic focus on result fields after successful operations to improve usability.
- Basic validation for armored PGP messages and clear-signed messages before invoking OpenPGP.js.
- Environment warning when the browser does not fully support the Web Crypto API.
- SEO meta tags (title, description, keywords) for all main pages to improve discoverability.

### Changed
- Improved error messages for invalid inputs, missing keys or incorrect message formats.
- Refined user-facing text to be clearer and more helpful when operations fail.

### Security
- Added light input validation for PGP armor formats to reduce confusing failures.
- Confirmed that all changes preserve the offline-only, client-side security model.


## [1.0.1] - 2025-12-10
### Added
- Added GitHub repository link to all pages.
- Added new **About / Security Model** page explaining threat model, privacy guarantees and usage.
- Added full favicon set (SVG + multi-size PNG) using the new asymmetric key icon.

### Changed
- Updated OpenPGP.js from **v4.5.0** to **v6.2.2**, including all required refactoring in `utils.js`.
- Updated jQuery from **3.4.1** to **3.7.1**.
- Improved page footers with URANOZ SOLUTIONS copyright.
- Improved mobile and desktop layout consistency, spacing and centering.

### Fixed
- File upload field alignment and overflow issues.
- Inconsistent horizontal centering on smaller screens.
- Minor layout inconsistencies across Encrypt/Decrypt/Sign/Verify/Generate pages.

### Security
- Confirmed all operations continue to run fully offline with no telemetry or network requests.


## [1.0.0] - 2025-12-05
### Added
- Initial public release of PGP Offline Tools.
- Standalone HTML tools: Encrypt, Decrypt, Sign, Verify, Generate Keys.
- OpenPGP.js-based offline cryptography.
- PureCSS styling and responsive layout.
- Footer with automatic year and URANOZ SOLUTIONS branding.
