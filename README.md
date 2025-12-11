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


## ✅ Manual Test Script

To manually verify that everything is working correctly:

1. Open `generate.html` and create a new key pair (name + email + passphrase).
2. Copy the generated **public key** into a file and load it on `encrypt.html`.
3. Enter a test message and encrypt it.
4. Copy the encrypted message and paste it into `decrypt.html`.
5. Load the matching **private key**, enter the same passphrase and decrypt the message.
6. Copy the decrypted output and confirm that it matches the original plaintext.
7. On `sign.html`, load the private key, enter a message and sign it.
8. Copy the signed output and paste it into `verify.html`, then load the public key and verify the signature.

If all of these steps succeed, the core functionality of PGP Offline Tools is working as expected.


## 🌐 Browser Compatibility

PGP Offline Tools is designed to work on modern browsers with Web Crypto support:

- Google Chrome (latest versions)
- Mozilla Firefox (latest versions)
- Microsoft Edge (Chromium-based)
- Apple Safari (latest versions)

Older browsers that lack a complete Web Crypto implementation may show a warning and some operations may not work correctly.


## 🚀 Version History

### **1.0.2 — UX, Validation & SEO**
- Added contextual status messages and automatic focus on result fields.
- Improved error handling and validation for armored PGP and clear-signed messages.
- Added environment warning when Web Crypto support is missing or incomplete.
- Added SEO meta tags (title, description, keywords) to all main HTML pages.

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
