# PGP Offline Tools
A fully offline, browser-based OpenPGP toolkit for encrypting, decrypting, signing, verifying and generating keys — without any server communication, uploads or tracking.

All cryptographic operations run locally using **OpenPGP.js 6.x**, and the entire project can be downloaded and executed offline.

## ✨ Features
- ✔ Fully offline (no servers, no tracking, no requests)
- ✔ Encrypt / decrypt messages
- ✔ Sign / verify text
- ✔ Generate OpenPGP key pairs
- ✔ Compatible with `.asc` and standard public/private key formats
- ✔ Mobile & desktop responsive UI
- ✔ Modern offline-security favicon set
- ✔ Open-source and auditable

## 🔧 Technology Stack
- **OpenPGP.js 6.2.2**
- **jQuery 3.7.1**
- Pure HTML/CSS/JS (no frameworks required)

## 🛡 Security Model
See: **About / Security Model** (`about.html`)

Summary:
- No analytics, telemetry or external requests.
- No data stored anywhere except user’s browser memory.
- All crypto operations performed locally via OpenPGP.js.
- No cookies, no logs, no cloud dependencies.

## 📦 Installation / Offline Usage
1. Download the repository:
   ```bash
   git clone https://github.com/uranozdev/pgpoffline
   ```
2. Open any of the HTML files directly in your browser:
   - `index.html`
   - `encrypt.html`
   - `decrypt.html`
   - `sign.html`
   - `verify.html`
   - `generate.html`

No build step is required.

## 🚀 Version History

### **1.0.1 — Security & Transparency Update**
- Updated OpenPGP.js to **6.2.2**
- Updated jQuery to **3.7.1**
- Added GitHub link to all pages
- Added **About / Security Model** page
- Added official favicon set (SVG + PNG)
- UI/UX refinements for centering and alignment

Full changelog is available in `CHANGELOG.md`.

## 📝 License
MIT License — see `LICENSE` for details.

## 🏢 Maintained by  
**URANOZ SOLUTIONS**  
Secure Offline Tools Division

GitHub repository:  
https://github.com/uranozdev/pgpoffline
