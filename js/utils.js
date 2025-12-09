$(document).ready(function () {
    // Encrypt form
    $('#encrypt').on('submit', function () {
        const message = $('#message').val();
        encrypt(message)
            .then(result => $('#result').val(result))
            .catch(() => alert('Error in some fields'));
        return false;
    });

    // Decrypt form
    $('#decrypt').on('submit', function () {
        const passphrase = $('#passphrase').val();
        $('#passphrase').val('');
        const message = $('#message').val();
        decrypt(message, passphrase)
            .then(result => $('#result').val(result))
            .catch(() => alert('Error in some fields'));
        return false;
    });

    // Sign form
    $('#sign').on('submit', function () {
        const passphrase = $('#passphrase').val();
        const message = $('#message').val();
        sign(message, passphrase)
            .then(result => $('#result').val(result))
            .catch(() => alert('Error in some fields'));
        return false;
    });

    // Verify form
    $('#verify').on('submit', function () {
        const message = $('#message').val();
        verify(message)
            .then(result => {
                const text = result
                    ? ['Valid message!', 'Hex: ' + result].join('\n')
                    : 'Signature is not valid.';
                $('#result').text(text);
            })
            .catch(() => alert('Error in some fields'));
        return false;
    });

    // Generate keys form
    $('#generate').on('submit', function () {
        const name = $('#name').val();
        const email = $('#email').val();
        const passphrase = $('#passphrase').val();

        generate(name, email, passphrase)
            .then(result => {
                if (result && result.pub && result.priv) {
                    $('#pubkey').val(result.pub);
                    $('#privkey').val(result.priv);
                } else {
                    alert('Error');
                }
            })
            .catch(() => alert('Error in some fields'));
        return false;
    });

    // Optional: copy result button (if present on the page)
    $('#copy-result').on('click', function () {
        const $result = $('#result');
        const text = $result.val ? ($result.val() || $result.text()) : $result.text();
        if (!text) {
            alert('Nothing to copy.');
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .catch(() => alert('Could not copy to clipboard.'));
        } else {
            alert('Clipboard API is not available in this browser.');
        }
    });

    // Key file info (fingerprint) – works for public or private keys
    $('#key').on('change', function () {
        const files = $('#key').prop('files');
        const $info = $('#key-info');

        // Some pages may not have key-info
        if (!$info.length) {
            return;
        }

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
                    // readKey accepts both public and private keys
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
    if (!pubKeyArmored) {
        throw new Error('Missing public key');
    }

    const publicKey = await openpgp.readKey({ armoredKey: pubKeyArmored });
    const messageObj = await openpgp.createMessage({ text: message });

    const encrypted = await openpgp.encrypt({
        message: messageObj,
        encryptionKeys: publicKey
    });

    // In v6, encrypt returns an armored string by default
    return encrypted;
}

// Decrypt with private key (OpenPGP.js v6)
async function decrypt(message, passphrase) {
    const privKeyArmored = await loadKey('private');
    if (!privKeyArmored) {
        throw new Error('Missing private key');
    }

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
    if (!privKeyArmored) {
        throw new Error('Missing private key');
    }

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

    // Returns a clear-signed armored string
    return signed;
}

// Verify clear-signed message (OpenPGP.js v6)
async function verify(message) {
    const pubKeyArmored = await loadKey('public');
    if (!pubKeyArmored) {
        throw new Error('Missing public key');
    }

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