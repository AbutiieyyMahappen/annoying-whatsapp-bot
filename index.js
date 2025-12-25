    /* 🤖 UNLIMITED REPLIES */
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");

/* 👑 OWNER NUMBER (Abutieyy Mahappen) */
const OWNER_NUMBER = "27687085163@s.whatsapp.net";

let botEnabled = true;

const replies = [
  "Why are you texting me? 😒",
  "I Hate you.",
  "Ohk🤔",
  "yea im mahappen the developer.",
  "Hey you son of a b*tch.",
  "uhmm bored & missing you😣"
  "Stay tuned for my bot V 1.1.2"
];

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📱 Scan this QR with WhatsApp");
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

    /* 👑 OWNER COMMANDS */

    if (text === "/owner") {
  return sock.sendMessage(from, {
    text: `👑 *Bot Developer*

Name: Abutieyy Mahappen
GitHub: https://github.com/AbutiieyyMahappen

📦 *Fork this bot:*
https://github.com/AbutiieyyMahappen/annoying-whatsapp-bot`
  });
}

    if (text === "/ownermenu") {
      if (!isOwner)
        return sock.sendMessage(from, { text: "❌ Owner only command" });

      return sock.sendMessage(from, {
        text: `👑 *Owner Menu*
/on  - Enable bot
/off - Disable bot
/owner - Owner info`
      });
    }

    if (text === "/off") {
      if (!isOwner)
        return sock.sendMessage(from, { text: "❌ Owner only command" });

      botEnabled = false;
      await sock.sendMessage(from, { text: "😴 Bot OFF (Owner)" });
      return;
    }

    if (text === "/on") {
      if (!isOwner)
        return sock.sendMessage(from, { text: "❌ Owner only command" });

      botEnabled = true;
      await sock.sendMessage(from, { text: "😈 Bot ON (Owner)" });
      return;
    }


    if (!botEnabled) return;

    await new Promise(r => setTimeout(r, 2000));

    const reply = replies[Math.floor(Math.random() * replies.length)];

    await sock.sendMessage(from, { text: "🤖 " + reply });
  });
}

startBot();
