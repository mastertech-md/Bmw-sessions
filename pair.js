const { writeFileSync, readFileSync, existsSync, rmSync, mkdirSync } = require('fs');
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

// Audio URLs
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

// Generate session code
function generateSessionCode() {
    const sessionCode = uuidv4().split('-')[0].toUpperCase(); // 8-char unique session
    return sessionCode;
}

// Route handler
router.get('/', async (req, res) => {
    const sessionCode = generateSessionCode(); // Generate session code
    let num = req.query.number;

    if (!num) {
        return res.send({ error: "Phone number is required!" });
    }

    num = num.replace(/[^0-9]/g, ''); // Sanitize phone number

    // Ensure the temp folder exists
    const tempDir = `./temp/${sessionCode}`;
    if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
    }

    async function MASTERTECH_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(tempDir);

        try {
            const Pair_Code_By_Masterpeace_elite = Masterpeace_elite({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: ['Chrome (Linux)', '', '']
            });

            if (!Pair_Code_By_Masterpeace_elite.authState.creds.registered) {
                await delay(1500);
                const code = await Pair_Code_By_Masterpeace_elite.requestPairingCode(num);

                if (!code || typeof code !== 'string' || code.length !== 8) {
                    console.log("❌ Invalid pairing code received:", code);
                    return res.send({ sessionCode, code: "Error generating valid 8-character pairing code" });
                }

                console.log("✅ Pairing code generated:", code);
                if (!res.headersSent) {
                    res.send({ sessionCode, code });
                }
            }

            Pair_Code_By_Masterpeace_elite.ev.on('creds.update', saveCreds);
            Pair_Code_By_Masterpeace_elite.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === 'open') {
                    console.log("✅ WhatsApp Connected!");
                    await delay(5000);
                    const data = readFileSync(`${tempDir}/creds.json`);
                    await delay(800);
                    const b64data = Buffer.from(data).toString('base64');

                    console.log("🔐 Session data (Base64):", b64data);

                    // Send random audio after pairing
                    const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];
                    await Pair_Code_By_Masterpeace_elite.sendMessage(Pair_Code_By_Masterpeace_elite.user.id, {
                        audio: { url: randomAudioUrl },
                        mimetype: 'audio/mpeg',
                        ptt: true,
                        fileName: 'shizo',
                        contextInfo: {
                            mentionedJid: [Pair_Code_By_Masterpeace_elite.user.id],
                            externalAdReply: {
                                title: "**MASTERTECH-MD** - Thanks for choosing us! 💜",
                                body: "Regards MASTERPEACE ELITE",
                                thumbnailUrl: "https://files.catbox.moe/v38p4r.jpeg",
                                sourceUrl: "https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D",
                                mediaType: 1,
                                renderLargerThumbnail: true,
                            },
                        },
                    });

                    await delay(100);
                    await Pair_Code_By_Masterpeace_elite.ws.close();
                    removeFile(tempDir);
                } else if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
                    console.log("🔄 Reconnecting...");
                    await delay(10000);
                    MASTERTECH_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("⚠️ ERROR OCCURRED:", err);
            removeFile(tempDir);
            if (!res.headersSent) {
                res.send({ sessionCode, code: "Service Currently Unavailable" });
            }
        }
    }

    await MASTERTECH_MD_PAIR_CODE();
});

module.exports = router;
