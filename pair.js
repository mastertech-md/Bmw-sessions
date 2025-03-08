const { existsSync, rmSync } = require('fs');
const express = require('express');
const pino = require('pino');
const { v4: uuidv4 } = require('uuid');
const {
    default: Masterpeace_elite,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
} = require('maher-zubair-baileys');

const router = express.Router();

// Helper function to remove old sessions
function removeFile(filePath) {
    if (existsSync(filePath)) {
        rmSync(filePath, { recursive: true, force: true });
    }
}

// Generate a unique session ID
function generateSessionCode() {
    return uuidv4().slice(0, 8).toUpperCase();
}

// Main route to generate pairing code
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
            
            // Add a timeout in case requestPairingCode hangs
            let code;
            try {
                code = await Promise.race([
                    bot.requestPairingCode(num),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout requesting pairing code")), 10000)) // 10 sec timeout
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
            return res.json({ sessionCode, code });

        } catch (err) {
            console.error("❌ Service Error:", err);
            removeFile(`./temp/${sessionCode}`);
            return res.status(500).json({ sessionCode, error: "Service Currently Unavailable", details: err.message });
        }
    }

    await MASTERTECH_MD_PAIR_CODE();
});

module.exports = router;
