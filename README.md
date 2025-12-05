# PGP Offline Tools

PGP Offline Tools is a small, self-contained collection of OpenPGP utilities
for encrypting, decrypting, signing, verifying, and generating keys — all
running entirely in your browser, with no server-side component.

You can open the `index.html` file directly from disk, or serve the folder with
a static HTTP server. No data is uploaded or logged anywhere.

## Features

- Encrypt plaintext using a recipient's public key  
- Decrypt ciphertext using a private key  
- Sign messages with your private key  
- Verify signed messages using a public key  
- Generate OpenPGP key pairs locally  

All cryptographic operations use OpenPGP.js and run locally.

## Security model

- No backend, no logging, no analytics  
- Fully offline-compatible  
- All cryptography happens in-browser  
- Key material never leaves your machine  

## Usage

Open `index.html` directly in your browser or serve the folder with:

```
python3 -m http.server 8000
```

## License

MIT License — see LICENSE.

## Maintainer

URANOZ SOLUTIONS
