# Changelog

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
