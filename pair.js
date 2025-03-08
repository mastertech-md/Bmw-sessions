const express = require('express');
const fs = require('fs');
const pino = require('pino');
const { v4: uuidv4 } = require('uuid');
const {
    default: Masterpeace_elite,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
} = require('maher-zubair-baileys');

const router = express.Router();

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

// Helper function to remove session files
function removeFile(filePath) {
    if (fs.existsSync(filePath)) {
        fs.rmSync(filePath, { recursive: true, force: true });
    }
}

// Generate a unique session code
function generateSessionCode() {
    return uuidv4().slice(0, 8).toUpperCase();
}

// Route handler
router.get('/', async (req, res) => {
    console.log("🔄 Incoming request... Generating session...");

    const sessionCode = generateSessionCode();
    let num = req.query.number;

    if (!num) {
        console.error("❌ Error: No phone number provided!");
        return res.status(400).json({ error: "Phone number is required!" });
    }

    num = num.replace(/[^0-9]/g, '');
    console.log("📞 Sanitized phone number:", num);

    async function MASTERTECH_MD_PAIR_CODE() {
        console.log("📂 Creating session folder for:", sessionCode);
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${sessionCode}`);

        try {
            console.log("🚀 Initializing WhatsApp bot...");
            const bot = Masterpeace_elite({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: ['Chrome (Linux)', '', '']
            });

            console.log("✅ Bot initialized successfully!");
            console.log("🔄 Requesting pairing code for:", num);

            // Timeout to prevent hanging
            let code;
            try {
                code = await Promise.race([
                    bot.requestPairingCode(num),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout requesting pairing code")), 10000))
                ]);
                console.log("🔑 Pairing code received:", code);
            } catch (error) {
                console.error("❌ Error requesting pairing code:", error.message);
                return res.status(500).json({ sessionCode, error: "Failed to generate pairing code", details: error.message });
            }

            if (!code || typeof code !== 'string' || code.length !== 8) {
                console.log("❌ Invalid pairing code received:", code);
                return res.json({ sessionCode, code: "Error: Invalid 8-character pairing code" });
            }

            console.log("📩 Sending pairing code to client:", code);
            res.json({ sessionCode, code });

            // Monitor connection events
            bot.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    await delay(5000);
                    const data = fs.readFileSync(`./temp/${sessionCode}/creds.json`);
                    await delay(800);
                    const b64data = Buffer.from(data).toString('base64');

                    console.log("✅ Session data (Base64):", b64data);

                    // Send a random audio after session
                    const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];
                    await bot.sendMessage(bot.user.id, {
                        audio: { url: randomAudioUrl },
                        mimetype: 'audio/mpeg',
                        ptt: true,
                        waveform: [100, 0, 100, 0, 100, 0, 100],
                        fileName: 'shizo',
                        contextInfo: {
                            mentionedJid: [bot.user.id],
                            externalAdReply: {
                                title: '**MASTERTECH-MD** 𝗦𝘂𝗽𝗽𝗼𝗿𝘁 - Happy Deployment 💜',
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
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    MASTERTECH_MD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.error("❌ Service Error:", err);
            removeFile(`./temp/${sessionCode}`);
            return res.status(500).json({ sessionCode, error: "Service Currently Unavailable", details: err.message });
        }
    }

    await MASTERTECH_MD_PAIR_CODE();
});

module.exports = router; 
