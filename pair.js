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

function removeFile(filePath) {
    if (existsSync(filePath)) {
        rmSync(filePath, { recursive: true, force: true });
    }
}

function generateSessionCode() {
    const sessionCode = uuidv4().slice(0, 8).toUpperCase();
    console.log('Generated Session Code:', sessionCode);
    return sessionCode;
}

router.get('/', async (req, res) => {
    const sessionCode = generateSessionCode();
    let num = req.query.number;

    if (!num) {
        console.log("Error: No phone number provided!");
        return res.status(400).json({ error: "Phone number is required!" });
    }

    num = num.replace(/[^0-9]/g, '');
    console.log("Sanitized phone number:", num);

    async function MASTERTECH_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState(`./temp/${sessionCode}`);
        
        try {
            console.log("Initializing bot...");
            const bot = Masterpeace_elite({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: ['Chrome (Linux)', '', '']
            });

            console.log("Bot instance created successfully");

            let code;
            try {
                console.log("Requesting pairing code for:", num);
                code = await bot.requestPairingCode(num);
                console.log("Pairing code response:", code);
            } catch (pairingError) {
                console.error("Error generating pairing code:", pairingError);
                return res.status(500).json({ sessionCode, error: "Failed to generate pairing code", details: pairingError.message });
            }

            if (!code || typeof code !== 'string' || code.length !== 8) {
                console.log("Invalid pairing code received:", code);
                return res.json({ sessionCode, code: "Error: Invalid 8-character pairing code" });
            }

            console.log("Sending pairing code to client:", code);
            res.json({ sessionCode, code });

        } catch (err) {
            console.error("Service Error:", err);
            removeFile(`./temp/${sessionCode}`);
            if (!res.headersSent) {
                res.status(500).json({ sessionCode, code: "Service Currently Unavailable", details: err.message });
            }
        }
    }

    await MASTERTECH_MD_PAIR_CODE();
});

module.exports = router;
