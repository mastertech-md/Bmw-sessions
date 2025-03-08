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
    "https://files.catbox.moe/26oeeh.mp3"
];

// Helper function to remove files
function removeFile(filePath) {
    if (existsSync(filePath)) {
        rmSync(filePath, { recursive: true, force: true });
    }
}

// Generate an 8-character alphanumeric session code
function generateSessionCode() {
    const sessionCode = uuidv4().slice(0, 8).toUpperCase();
    console.log('🔑 Generated session code:', sessionCode);
    return sessionCode;
}

// Route handler
router.get('/', async (req, res) => {
    console.log("📩 Received request for pairing code...");
    const sessionCode = generateSessionCode(); 
    let num = req.query.number;

    if (!num) {
        console.log("❌ No phone number provided!");
        return res.status(400).send({ error: "Phone number is required!" });
    }

    num = num.replace(/[^0-9]/g, ''); 
    if (num.length < 10) {
        console.log("❌ Invalid phone number format:", num);
        return res.status(400).send({ error: "Invalid phone number format!" });
    }

    async function MASTERTECH_MD_PAIR_CODE() {
        console.log("🛠 Starting WhatsApp session...");
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${sessionCode}`);

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

            console.log("📞 Requesting pairing code for:", num);
            let code = await Pair_Code_By_Masterpeace_elite.requestPairingCode(num);

            if (!code || typeof code !== 'string' || code.length !== 8) {
                console.log('❌ Invalid pairing code received:', code);
                return res.send({ sessionCode, code: 'Error generating valid pairing code' });
            }

            console.log("✅ Pairing code received:", code);
            if (!res.headersSent) {
                await res.send({ sessionCode, code });
            }

            Pair_Code_By_Masterpeace_elite.ev.on('creds.update', saveCreds);
            Pair_Code_By_Masterpeace_elite.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === 'open') {
                    console.log("✅ Connection successful!");

                    await delay(5000);
                    const data = readFileSync(`./temp/${sessionCode}/creds.json`);
                    await delay(800);
                    const b64data = Buffer.from(data).toString('base64');
                    console.log('🔐 Session data (Base64):', b64data);

                    // Send a random audio file after pairing
                    const randomAudioUrl = audioUrls[Math.floor(Math.random() * audioUrls.length)];
                    await Pair_Code_By_Masterpeace_elite.sendMessage(Pair_Code_By_Masterpeace_elite.user.id, {
                        audio: { url: randomAudioUrl },
                        mimetype: 'audio/mpeg',
                        ptt: true,
                        fileName: 'shizo',
                        contextInfo: {
                            externalAdReply: {
                                title: '🎉 Successfully Linked 🎉',
                                body: 'Thanks for choosing **MASTERTECH-MD** 💜',
                                thumbnailUrl: 'https://files.catbox.moe/fq30m0.jpg',
                                sourceUrl: 'https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D',
                                mediaType: 1,
                                renderLargerThumbnail: true,
                            },
                        },
                    });

                    await delay(100);
                    await Pair_Code_By_Masterpeace_elite.ws.close();
                    removeFile(`./temp/${sessionCode}`);
                } else if (connection === 'close' && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    console.log("🔄 Connection closed, retrying...");
                    await delay(10000);
                    MASTERTECH_MD_PAIR_CODE();
                }
            });

        } catch (err) {
            console.error("❌ Service error:", err);
            removeFile(`./temp/${sessionCode}`);
            if (!res.headersSent) {
                await res.send({ sessionCode, code: 'Service Currently Unavailable' });
            }
        }
    }

    await MASTERTECH_MD_PAIR_CODE();
});

module.exports = router;
