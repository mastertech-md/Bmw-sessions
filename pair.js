const { writeFileSync, readFileSync, existsSync, rmSync } = require('fs');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const pino = require('pino');
const {
    default: Masterpeace_elite,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
} = require('maher-zubair-baileys');

const router = express.Router();

// List of audio files (Restored)
const audioUrls = [
    "https://files.catbox.moe/hpwsi2.mp3",
    "https://files.catbox.moe/xci982.mp3",
    "https://files.catbox.moe/utbujd.mp3",
    "https://files.catbox.moe/w2j17k.m4a",
    "https://files.catbox.moe/851skv.m4a",
    "https://files.catbox.moe/qnhtbu.m4a",
    "https://files.catbox.moe/lb0x7w.mp3",
    "https://files.catbox.moe/efmcxm.mp3",
    "https://files.catbox.moe/gco5bq.mp3",
    "https://files.catbox.moe/26oeeh.mp3",
    "https://files.catbox.moe/a1sh4u.mp3",
    "https://files.catbox.moe/vuuvwn.m4a",
    "https://files.catbox.moe/wx8q6h.mp3",
    "https://files.catbox.moe/uj8fps.m4a",
    "https://files.catbox.moe/dc88bx.m4a",
    "https://files.catbox.moe/tn32z0.m4a",
    "https://files.catbox.moe/9fm6gi.mp3",
    "https://files.catbox.moe/9h8i2a.mp3",
    "https://files.catbox.moe/5pm55z.mp3",
    "https://files.catbox.moe/zjk77k.mp3",
    "https://files.catbox.moe/fe5lem.m4a",
    "https://files.catbox.moe/4b1ohl.mp3"
];

// Helper function to remove files
function removeFile(filePath) {
    if (!existsSync(filePath)) return false;
    rmSync(filePath, { recursive: true, force: true });
}

// Function to generate and save session code
function generateSessionCode() {
    const sessionCode = uuidv4();
    writeFileSync('session.json', JSON.stringify({ sessionCode }, null, 2));
    console.log('Session code generated:', sessionCode);
    return sessionCode;
}

// Route handler for pairing request
router.get('/', async (req, res) => {
    const sessionCode = generateSessionCode(); // Generate a unique session code
    let num = req.query.number; // Get phone number from request

    async function MASTERTECH_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${sessionCode}`);
        try {
            const Pair_Code_By_masterpeace_elite = Masterpeace_elite({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: ['Chrome (Linux)', '', '']
            });

            if (!Pair_Code_By_masterpeace_elite.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                let code = await Pair_Code_By_masterpeace_elite.requestPairingCode(num);

                // Ensure the code is valid (8 characters)
                if (!code || typeof code !== 'string' || code.length !== 8) {
                    console.log('Invalid pairing code received:', code);
                    return res.send({ sessionCode, code: 'Error generating valid 8-character pairing code' });
                }

                console.log(`Generated Pairing Code: ${code}`);

                // **Send Response with Pairing Code**
                if (!res.headersSent) {
                    res.json({ sessionCode, pairingCode: code });
                }

                // Save pairing code for GitHub bot deployment (Optional)
                writeFileSync('./pairingCode.json', JSON.stringify({ sessionCode, pairingCode: code }, null, 2));
            }

            Pair_Code_By_masterpeace_elite.ev.on('creds.update', saveCreds);
            Pair_Code_By_masterpeace_elite.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    console.log("Connection Opened. Bot is now linked!");

                    await delay(5000);
                    const data = readFileSync(`./temp/${sessionCode}/creds.json`);
                    const b64data = Buffer.from(data).toString('base64');

                    console.log('Session data (Base64):', b64data);

                    // Store session data for use in GitHub repo
                    writeFileSync('./sessionData.json', JSON.stringify({ sessionCode, sessionData: b64data }, null, 2));

                    // Play random audio after successful connection
                    const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];
                    await Pair_Code_By_masterpeace_elite.sendMessage(Pair_Code_By_masterpeace_elite.user.id, {
                        audio: { url: randomAudioUrl },
                        mimetype: 'audio/mpeg',
                        ptt: true,
                        waveform: [100, 0, 100, 0, 100, 0, 100], // Optional waveform pattern
                        fileName: 'shizo',
                        contextInfo: {
                            mentionedJid: [Pair_Code_By_masterpeace_elite.user.id], // Mention the sender in the audio message
                            externalAdReply: {
                                title: 'Thanks for choosing MASTERTECH-MD 𝗦𝘂𝗽𝗽𝗼𝗿𝘁 happy deployment 💜',
                                body: 'Regards MASTERPEACE ELITE',
                                thumbnailUrl: 'https://files.catbox.moe/fq30m0.jpg',
                                sourceUrl: 'https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D',
                                mediaType: 1,
                                renderLargerThumbnail: true,
                            },
                        },
                    });

                    await delay(100);
                    await Pair_Code_By_masterpeace_elite.ws.close();
                    removeFile(`./temp/${sessionCode}`);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    MASTERTECH_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log('Service restarted:', err);
            removeFile(`./temp/${sessionCode}`);
            if (!res.headersSent) {
                res.json({ sessionCode, code: 'Service Currently Unavailable' });
            }
        }
    }

    await MASTERTECH_MD_PAIR_CODE();
});

module.exports = router;
