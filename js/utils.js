$(document).ready(function() {
    // Encrypt
    $('#encrypt').on('submit', function() {
        const message = $('#message').val().trim();
        if (!message) {
            alert('Message is empty. Please enter some text to encrypt.');
            return false;
        }

        encrypt(message)
            .then(result => {
                $('#result').val(result);
            })
            .catch(err => {
                console.error(err);
                alert('Could not encrypt. Check the public key file and try again.');
            });

        return false;
    });

    // Decrypt
    $('#decrypt').on('submit', function() {
        const passphrase = $('#passphrase').val();
        $('#passphrase').val(''); // clear passphrase field as soon as we read it

        const message = $('#message').val().trim();
        if (!message) {
            alert('Encrypted message is empty. Paste an armored PGP message.');
            return false;
        }

        decrypt(message, passphrase)
            .then(result => {
                $('#result').val(result);
            })
            .catch(err => {
                console.error(err);
                alert('Could not decrypt. This can be caused by a wrong passphrase, wrong private key, or invalid PGP message.');
            });

        return false;
    });

    // Sign
    $('#sign').on('submit', function() {
        const passphrase = $('#passphrase').val();
        $('#passphrase').val(''); // clear passphrase after reading

        const message = $('#message').val().trim();
        if (!message) {
            alert('Message is empty. Please enter some text to sign.');
            return false;
        }

        sign(message, passphrase)
            .then(result => {
                $('#result').val(result);
            })
            .catch(err => {
                console.error(err);
                alert('Could not sign the message. Check the private key file and passphrase.');
            });

        return false;
    });

    // Verify
    $('#verify').on('submit', function() {
        const message = $('#message').val().trim();
        if (!message) {
            alert('Signed message is empty. Paste a clear-signed PGP message.');
            return false;
        }

        verify(message)
            .then(result => {
                if (!result) {
                    $('#result').text('Invalid or untrusted signature.');
                    return;
                }

                const text = [
                    'Valid signature.',
                    'Signer key id (hex): ' + result
                ].join('\n');
                $('#result').text(text);
            })
            .catch(err => {
                console.error(err);
                alert('Could not verify the signature. Check the signed message and public key.');
            });

        return false;
    });

    // Generate
    $('#generate').on('submit', function() {
        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const passphrase = $('#passphrase').val();

        if (!name || !email) {
            alert('Name and e-mail are required to generate a key pair.');
            return false;
        }

        generate(name, email, passphrase)
            .then(result => {
                if (result && result.pub && result.priv) {
                    $('#pubkey').val(result.pub);
                    $('#privkey').val(result.priv);
                } else {
                    alert('Unexpected error while generating the key pair.');
                }
            })
            .catch(err => {
                console.error(err);
                alert('Could not generate the key pair. See console for details.');
            });

        return false;
    });

    // Copy button for result (works both for textarea and pre/text)
    $('#copy-result').on('click', function() {
        const $result = $('#result');
        const text = $result.is('textarea') ? $result.val() : $result.text();
        if (!text) {
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(function(err) {
                console.error(err);
            });
        }
    });

    // Show basic info when a key file is selected
    $('#key').on('change', function () {
        const files = $('#key').prop('files');
        const $info = $('#key-info');

        if (!$info.length) {
            // No info element on this page; nothing to do.
            return;
        }

        if (!files || files.length === 0) {
            $info.text('');
            return;
        }

        files[0].text()
            .then(function (text) {
                // Quick sanity check: is this an ASCII-armored OpenPGP key?
                if (!text.includes('BEGIN PGP PUBLIC KEY BLOCK')) {
                    $info.text(
                        'This file does not look like an ASCII-armored OpenPGP public key. ' +
                        'Please use a PGP public key (not an SSH .pub file).'
                    );
                    return null;
                }
                return openpgp.key.readArmored(text);
            })
            .then(function (result) {
                if (!result) {
                    // We already showed a specific message above.
                    return;
                }
                if (!result.keys || result.keys.length === 0) {
                    $info.text('Could not parse this OpenPGP key file.');
                    return;
                }
                const fp = result.keys[0].getFingerprint();
                $info.text('Loaded key fingerprint: ' + fp);
            })
            .catch(function (err) {
                console.error(err);
                $info.text('Could not parse this OpenPGP key file.');
            });
    });
});

// === Crypto helpers ===

/**
 * Load a PGP key from the #key file input.
 * @param {'public'|'private'} type Key type (only used for error messages).
 * @returns {Promise<string>} ASCII-armored key content.
 */
let loadKey = async function(type) {
    const files = $('#key').prop('files');

    if (!files || files.length === 0) {
        throw new Error('No ' + type + ' key file selected.');
    }

    return files[0].text();
};

async function encrypt(message) {
    const pubKey = await loadKey('public');

    const options = {
        message: openpgp.message.fromText(message),
        publicKeys: (await openpgp.key.readArmored(pubKey)).keys
    };

    return new Promise(function(resolve, reject) {
        openpgp.encrypt(options)
            .then(function(ciphertext) {
                resolve(ciphertext.data);
            })
            .catch(reject);
    });
}

async function decrypt(message, passphrase) {
    const privKey = await loadKey('private');
    const privKeyObj = (await openpgp.key.readArmored(privKey)).keys[0];

    await privKeyObj.decrypt(passphrase);

    const options = {
        message: await openpgp.message.readArmored(message),
        privateKeys: [privKeyObj]
    };

    return new Promise(function(resolve, reject) {
        openpgp.decrypt(options)
            .then(function(plaintext) {
                resolve(plaintext.data);
            })
            .catch(reject);
    });
}

async function sign(message, passphrase) {
    const privKey = await loadKey('private');
    const privKeyObj = (await openpgp.key.readArmored(privKey)).keys[0];

    await privKeyObj.decrypt(passphrase);

    const options = {
        message: openpgp.cleartext.fromText(message),
        privateKeys: [privKeyObj]
    };

    return new Promise(function(resolve, reject) {
        openpgp.sign(options)
            .then(function(signed) {
                resolve(signed.data);
            })
            .catch(reject);
    });
}

async function verify(message) {
    const pubKey = await loadKey('public');

    const options = {
        message: await openpgp.cleartext.readArmored(message),
        publicKeys: (await openpgp.key.readArmored(pubKey)).keys
    };

    return new Promise(function(resolve, reject) {
        openpgp.verify(options)
            .then(function(verified) {
                const validity = verified.signatures &&
                    verified.signatures[0] &&
                    verified.signatures[0].valid;

                if (validity) {
                    resolve(verified.signatures[0].keyid.toHex());
                } else {
                    resolve(null);
                }
            })
            .catch(reject);
    });
}

async function generate(name, email, passphrase) {
    const options = {
        userIds: [{ name: name, email: email }],
        numBits: 4096,
        passphrase: passphrase,
    };

    return new Promise(function(resolve, reject) {
        openpgp.generateKey(options)
            .then(function(key) {
                resolve({
                    pub: key.publicKeyArmored,
                    priv: key.privateKeyArmored,
                });
            })
            .catch(reject);
    });
}