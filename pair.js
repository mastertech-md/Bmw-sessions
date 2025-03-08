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

// List of audio files
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

// Function to generate session code
function generateSessionCode() {
    const sessionCode = uuidv4();
    console.log('Generated session code:', sessionCode);
    return sessionCode;
}

// Route handler
router.get('/', async (req, res) => {
    const sessionCode = generateSessionCode();
    let num = req.query.number;

    if (!num || typeof num !== 'string' || num.length < 8) {
        return res.status(400).json({ error: "Invalid phone number provided." });
    }

    async function MASTERTECH_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${sessionCode}`);
        try {
            const bot = Masterpeace_elite({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: ['Chrome (Linux)', '', '']
            });

            if (!bot.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                console.log('Requesting pairing code for number:', num);

                let code;
                try {
                    code = await bot.requestPairingCode(num);
                    console.log('Received pairing code:', code);
                } catch (pairingError) {
                    console.error('Error generating pairing code:', pairingError);
                    return res.status(500).json({ sessionCode, error: 'Failed to generate pairing code' });
                }

                // Ensure the pairing code is valid
                if (!code || typeof code !== 'string' || code.length !== 8) {
                    console.error('Invalid pairing code received:', code);
                    return res.status(500).json({ sessionCode, error: 'Received invalid 8-character pairing code' });
                }

                if (!res.headersSent) {
                    res.json({ sessionCode, pairingCode: code });
                }
            }

            bot.ev.on('creds.update', saveCreds);
            bot.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    console.log("Bot connected successfully!");

                    await delay(5000);
                    const data = readFileSync(`./temp/${sessionCode}/creds.json`);
                    const b64data = Buffer.from(data).toString('base64');
                    console.log('Session data (Base64):', b64data);

                    // Send random audio after successful connection
                    const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];
                    await bot.sendMessage(bot.user.id, {
                        audio: { url: randomAudioUrl },
                        mimetype: 'audio/mpeg',
                        ptt: true,
                        fileName: 'shizo',
                        contextInfo: {
                            mentionedJid: [bot.user.id],
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
                    await bot.ws.close();
                    removeFile(`./temp/${sessionCode}`);
                } else if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
                    console.log('Connection lost. Retrying...');
                    await delay(10000);
                    MASTERTECH_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error('Service error:', err);
            removeFile(`./temp/${sessionCode}`);
            if (!res.headersSent) {
                res.status(500).json({ sessionCode, error: 'Service Currently Unavailable' });
            }
        }
    }

    await MASTERTECH_MD_PAIR_CODE();
});

module.exports = router;
