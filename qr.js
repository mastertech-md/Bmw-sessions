const PastebinAPI = require('pastebin-js'),
pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL')
const {makeid} = require('./id');
const QRCode = require('qrcode');
const express = require('express');
const path = require('path');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
	default: drex_ai,
	useMultiFileAuthState,
	jidNormalizedUser,
	Browsers,
	delay,
	makeInMemoryStore,
} = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
	if (!fs.existsSync(FilePath)) return false;
	fs.rmSync(FilePath, {
		recursive: true,
		force: true
	})
};
const {
	readFile
} = require("node:fs/promises")
router.get('/', async (req, res) => {
	const id = makeid();
	async function DREX_AI_QR_CODE() {
		const {
			state,
			saveCreds
		} = await useMultiFileAuthState('./temp/' + id)
		try {
			let Qr_Code_By_Drex_Mose = drex_ai({
				auth: state,
				printQRInTerminal: false,
				logger: pino({
					level: "silent"
				}),
				browser: Browsers.macOS("Desktop"),
			});

			Qr_Code_By_Maher_Zubair.ev.on('creds.update', saveCreds)
			Qr_Code_By_Maher_Zubair.ev.on("connection.update", async (s) => {
				const {
					connection,
					lastDisconnect,
					qr
				} = s;
				if (qr) await res.end(await QRCode.toBuffer(qr));
				if (connection == "open") {
					await delay(5000);
					let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
					await delay(800);
				   let b64data = Buffer.from(data).toString('base64');
				   let session = await Qr_Code_By_Drex_Mose.sendMessage(Qr_Code_By_Drex_Mose.user.id, { text: 'BMW-XD;;;' + b64data });
	
				   let GIFTED_MD_TEXT = `
*𝐒𝐞𝐬𝐬𝐢𝐨𝐧 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝*
*𝐄𝐧𝐣𝐨𝐲😺*
*By _MASTERPEACE ELITE⚪_*
______________________________
╭┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅◇
║『 𝐘𝐎𝐔'𝐕𝐄 𝐂𝐇𝐎𝐒𝐄𝐍 MASTERTECH-M𝐃 』
║ You've Completed the First Step
║ to Deploy a Whatsapp Bot.
╰┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉┉
╭┄┄────────────◇
┋ 『••• 𝗩𝗶𝘀𝗶𝘁 𝗙𝗼𝗿 𝗛𝗲𝗹𝗽 •••』
┋❍ 𝐘𝐨𝐮𝐭𝐮𝐛𝐞: _#######_
┋❍ 𝐎𝐰𝐧𝐞𝐫: _https://wa.me/263714757857_
┋❍ 𝐑𝐞𝐩𝐨: _https://github.com/mastertech-md/Mastertech_
┋❍ 𝐖𝐚𝐆𝐫𝐨𝐮𝐩: _https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D_
┋❍ 𝐖𝐚𝐂𝐡𝐚𝐧𝐧𝐞𝐥: _https://whatsapp.com/channel/0029VazeyYx35fLxhB5TfC3D_
┋❍ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦: _#########_
┋ ☬ ☬ ☬ ☬
╰┄┄┄┄┅┅┅┅┅┅┄┄┄┄┄┄┄┄┄┄┄ 
    🚘 MASTERTECH-MD 🚘
______________________________

_Don't Forget To Give Star⭐ To My Repo_`
	 await Qr_Code_By_Drex_Mose.sendMessage(Qr_Code_By_Drex_Mose.user.id,{text:DREX-AI_TEXT},{quoted:session})



					await delay(100);
					await Qr_Code_By_Drex_Mose.ws.close();
					return await removeFile("temp/" + id);
				} else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
					await delay(10000);
					DREX_AI_QR_CODE();
				}
			});
		} catch (err) {
			if (!res.headersSent) {
				await res.json({
					code: "Service Unavailable"
				});
			}
			console.log(err);
			await removeFile("temp/" + id);
		}
	}
	return await DREX_AI_QR_CODE()
});
module.exports = router
