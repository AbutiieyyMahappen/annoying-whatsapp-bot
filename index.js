/* 🤖 UNLIMITED REPLIES BOT */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");
const readline = require("readline");

/* 👑 OWNER NUMBER (Abutieyy Mahappen) */
const OWNER_NUMBER = "27687085163@s.whatsapp.net";

let botEnabled = true;

const replies = [
  "Why are you texting me? 😒",
  "I hate you.",
  "Ohk 😏",
  "Yeah, I'm Mahappen the developer.",
  "I'm bored & missing you 😣",
  "Stay tuned for my bot v1.1.2 🚀"
];

/* 📞 INPUT FOR PHONE PAIRING */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (q) => new Promise(res => rl.question(q, res));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
    printQRInTerminal: false,
    browser: ["Annoying Bot", "Chrome", "1.1.2"]
  });

  sock.ev.on("creds.update", saveCreds);

  /* 🔑 PHONE NUMBER PAIRING */
  if (!sock.authState.creds.registered) {
    const phone = await ask("📞 Enter WhatsApp number (country code, no +): ");
    const code = await sock.requestPairingCode(phone.trim());
    console.log("🔢 Pairing Code:", code);
  }

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📱 Scan QR if pairing code not used");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Annoying Bot Connected");
      console.log("👑 Owner: Abutieyy Mahappen");
    }

    if (connection === "close") {
      if (
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      ) {
        startBot();
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const isOwner = sender === OWNER_NUMBER;

    /* 👑 OWNER & PUBLIC COMMANDS */

    if (text === "/owner") {
      return sock.sendMessage(from, {
        text: `👑 *Bot Developer*

Name: Abutieyy Mahappen
GitHub: https://github.com/AbutiieyyMahappen

🍴 *Fork this bot:*
https://github.com/AbutiieyyMahappen/annoying-whatsapp-bot`
      });
    }

    if (text === "/github") {
      return sock.sendMessage(from, {
        text: `🐙 GitHub Repo
https://github.com/AbutiieyyMahappen/annoying-whatsapp-bot

⭐ Star & Fork it`
      });
    }

    if (text === "/ownermenu") {
      if (!isOwner)
        return sock.sendMessage(from, { text: "❌ Owner only command" });

      return sock.sendMessage(from, {
        text: `👑 *Owner Menu*
/on  - Enable bot
/off - Disable bot
/owner - Owner info
/github - Source code`
      });
    }

    if (text === "/off") {
      if (!isOwner)
        return sock.sendMessage(from, { text: "❌ Owner only command" });

      botEnabled = false;
      return sock.sendMessage(from, { text: "😴 Bot OFF (Owner)" });
    }

    if (text === "/on") {
      if (!isOwner)
        return sock.sendMessage(from, { text: "❌ Owner only command" });

      botEnabled = true;
      return sock.sendMessage(from, { text: "😈 Bot ON (Owner)" });
    }

    /* 🤖 AUTO REPLIES */
    if (!botEnabled) return;

    await new Promise(r => setTimeout(r, 2000));

    const reply = replies[Math.floor(Math.random() * replies.length)];
    await sock.sendMessage(from, { text: "🤖 " + reply });
  });
}

startBot();
