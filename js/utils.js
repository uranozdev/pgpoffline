// Basic environment check for WebCrypto support
(function () {
    if (!window.crypto || !window.crypto.subtle) {
        // Fallback: simple warning, does not block usage
        alert('Warning: This browser does not fully support the Web Crypto API. Some operations may not work correctly. For best results, use a modern browser such as Chrome, Firefox, Edge or Safari.');
    }
})();

$(document).ready(function () {
    // Helpers for status messages
    function setStatus(message, type) {
        const el = $('#status');
        if (el.length) {
            el.text(message || '');
            el.removeClass('status-success status-error');
            if (type === 'success') {
                el.addClass('status-success');
            } else if (type === 'error') {
                el.addClass('status-error');
            }
        } else if (type === 'error') {
            // Fallback to alert only for errors when no status element exists
            alert(message);
        }
    }

    function focusResult(selector) {
        const $el = $(selector);
        if ($el.length) {
            // Prefer .focus() + .select() when it is a textarea/input
            try {
                $el.focus();
                if (typeof $el.select === 'function') {
                    $el.select();
                }
            } catch (e) {
                // Ignore focus errors
            }
        }
    }

    // Encrypt form
    $('#encrypt').on('submit', function () {
        const message = $('#message').val();
        $('#result').val('');

        if (!message || !message.trim()) {
            setStatus('Please enter a message to encrypt.', 'error');
            return false;
        }

        encrypt(message)
            .then(result => {
                $('#result').val(result);
                setStatus('Message encrypted successfully.', 'success');
                focusResult('#result');
            })
            .catch(err => {
                console.error(err);
                setStatus('Failed to encrypt message. Please check the public key and message content.', 'error');
            });
        return false;
    });

    // Decrypt form
    $('#decrypt').on('submit', function () {
        const passphrase = $('#passphrase').val();
        const message = $('#message').val();
        $('#passphrase').val('');
        $('#result').val('');

        if (!message || !message.trim()) {
            setStatus('Please paste an armored PGP message to decrypt.', 'error');
            return false;
        }

        decrypt(message, passphrase)
            .then(result => {
                $('#result').val(result);
                setStatus('Message decrypted successfully.', 'success');
                focusResult('#result');
            })
            .catch(err => {
                console.error(err);
                setStatus('Failed to decrypt message. Please check the private key, passphrase and message format.', 'error');
            });
        return false;
    });

    // Sign form
    $('#sign').on('submit', function () {
        $('#result').val('');
        const passphrase = $('#passphrase').val();
        const message = $('#message').val();

        if (!message || !message.trim()) {
            setStatus('Please enter a message to sign.', 'error');
            return false;
        }

        sign(message, passphrase)
            .then(result => {
                $('#result').val(result);
                setStatus('Message signed successfully.', 'success');
                focusResult('#result');
            })
            .catch(err => {
                console.error(err);
                setStatus('Failed to sign message. Please check the private key and passphrase.', 'error');
            });
        return false;
    });

    // Verify form
    $('#verify').on('submit', function () {
        $('#result').val('');
        const message = $('#message').val();

        if (!message || !message.trim()) {
            setStatus('Please paste a clear-signed PGP message to verify.', 'error');
            return false;
        }

        verify(message)
            .then(result => {
                if (result) {
                    const text = ['Valid message!', 'Hex: ' + result].join('\n');
                    $('#result').text(text);
                    setStatus('Signature verified successfully.', 'success');
                } else {
                    $('#result').text('Signature is not valid.');
                    setStatus('Signature verification failed. The message may have been modified.', 'error');
                }
                focusResult('#result');
            })
            .catch(err => {
                console.error(err);
                setStatus('Failed to verify message. Please check the signed content and public key.', 'error');
            });
        return false;
    });

    // Generate keys form
    $('#generate').on('submit', function () {
        $('#result').val('');
        const name = $('#name').val();
        const email = $('#email').val();
        const passphrase = $('#passphrase').val();

        if (!name || !name.trim() || !email || !email.trim()) {
            setStatus('Please provide a name and email address before generating keys.', 'error');
            return false;
        }

        generate(name, email, passphrase)
            .then(result => {
                if (result && result.pub && result.priv) {
                    $('#pubkey').val(result.pub);
                    $('#privkey').val(result.priv);
                    setStatus('Key pair generated successfully.', 'success');
                    focusResult('#pubkey');
                } else {
                    setStatus('Error generating key pair. Please try again.', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                setStatus('Failed to generate key pair. Please review the input fields and try again.', 'error');
            });
        return false;
    });

    // Optional: copy result button (if present on the page)
    $('#copy-result').on('click', function () {
        const $result = $('#result');
        const text = $result.val ? ($result.val() || $result.text()) : $result.text();
        if (!text) {
            setStatus('Nothing to copy.', 'error');
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => setStatus('Result copied to clipboard.', 'success'))
                .catch(err => {
                    console.error(err);
                    setStatus('Could not copy to clipboard.', 'error');
                });
        } else {
            setStatus('Clipboard API is not available in this browser.', 'error');
        }
    });

    // Key file info (fingerprint) – works for public or private keys
    $('#key').on('change', function () {
        const files = $('#key').prop('files');
        const $info = $('#key-info');

        if (!$info.length) return;
        if (!files || files.length === 0) {
            $info.text('Use an ASCII-armored OpenPGP key file (for example, a .asc file).');
            return;
        }

        files[0].text()
            .then(async function (text) {
                if (
                    !text.includes('BEGIN PGP PUBLIC KEY BLOCK') &&
                    !text.includes('BEGIN PGP PRIVATE KEY BLOCK')
                ) {
                    $info.text(
                        'This file does not look like an ASCII-armored OpenPGP key. ' +
                        'Please use a PGP key file (not an SSH .pub file).'
                    );
                    return;
                }

                try {
                    // readKey accepts both public and private keys in v6
                    const key = await openpgp.readKey({ armoredKey: text });
                    const fp = key.getFingerprint();
                    $info.text('Loaded key fingerprint: ' + fp);
                } catch (e) {
                    console.error(e);
                    $info.text('Could not parse this OpenPGP key file.');
                }
            })
            .catch(function (err) {
                console.error(err);
                $info.text('Could not read key file.');
            });
    });
});

// Load key file contents as text
let loadKey = async type => {
    const files = $('#key').prop('files');
    if (!files || files.length === 0) {
        alert('Add a ' + type + ' key first.');
        return;
    }
    return await files[0].text();
};

// Encrypt with public key (OpenPGP.js v6)
async function encrypt(message) {
    const pubKeyArmored = await loadKey('public');
    if (!pubKeyArmored) throw new Error('Missing public key');

    const publicKey = await openpgp.readKey({ armoredKey: pubKeyArmored });
    const messageObj = await openpgp.createMessage({ text: message });

    const encrypted = await openpgp.encrypt({
        message: messageObj,
        encryptionKeys: publicKey
    });

    return encrypted;
}

// Decrypt with private key (OpenPGP.js v6)
async function decrypt(message, passphrase) {
    if (!message.includes('BEGIN PGP MESSAGE'))
        throw new Error('The provided text does not look like an armored PGP message.');

    const privKeyArmored = await loadKey('private');
    if (!privKeyArmored) throw new Error('Missing private key');

    const privateKey = await openpgp.readPrivateKey({ armoredKey: privKeyArmored });
    const decryptedPrivateKey = await openpgp.decryptKey({
        privateKey,
        passphrase
    });

    const messageObj = await openpgp.readMessage({ armoredMessage: message });

    const { data } = await openpgp.decrypt({
        message: messageObj,
        decryptionKeys: decryptedPrivateKey
    });

    return data;
}

// Sign cleartext message (OpenPGP.js v6)
async function sign(message, passphrase) {
    const privKeyArmored = await loadKey('private');
    if (!privKeyArmored) throw new Error('Missing private key');

    const privateKey = await openpgp.readPrivateKey({ armoredKey: privKeyArmored });
    const decryptedPrivateKey = await openpgp.decryptKey({
        privateKey,
        passphrase
    });

    const cleartextMessage = await openpgp.createCleartextMessage({ text: message });

    const signed = await openpgp.sign({
        message: cleartextMessage,
        signingKeys: decryptedPrivateKey
    });

    return signed;
}

// Verify clear-signed message (OpenPGP.js v6)
async function verify(message) {
    if (!message.includes('BEGIN PGP SIGNED MESSAGE'))
        throw new Error('The provided text does not look like a clear-signed PGP message.');

    const pubKeyArmored = await loadKey('public');
    if (!pubKeyArmored) throw new Error('Missing public key');

    const publicKey = await openpgp.readKey({ armoredKey: pubKeyArmored });
    const cleartextMessage = await openpgp.readCleartextMessage({
        cleartextMessage: message
    });

    const verificationResult = await openpgp.verify({
        message: cleartextMessage,
        verificationKeys: publicKey
    });

    const signature = verificationResult.signatures[0];
    const { verified, keyID } = signature;

    try {
        await verified; // throws if invalid
        return keyID.toHex();
    } catch (e) {
        return null;
    }
}

// Generate a new RSA key pair (OpenPGP.js v6)
async function generate(name, email, passphrase) {
    const options = {
        type: 'rsa',
        rsaBits: 4096,
        userIDs: [{ name: name, email: email }],
        passphrase: passphrase,
        format: 'armored'
    };

    const { privateKey, publicKey } = await openpgp.generateKey(options);

    return {
        pub: publicKey,
        priv: privateKey
    };
}