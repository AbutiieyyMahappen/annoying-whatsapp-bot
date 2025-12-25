/* 🤖 ANNOYING WHATSAPP BOT v1.1.2
👑 Developer: Abutieyy Mahappen
GitHub: https://github.com/AbutiieyyMahappen
*/

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");

/* 👑 OWNER NUMBER */
const OWNER_NUMBER = "27687085163@s.whatsapp.net";

let botEnabled = true;

/* 🤖 AUTO REPLIES */
const replies = [
  "Why are you texting me? 😒",
  "I hate you.",
  "Ohk 😏",
  "Yeah, I'm Mahappen the developer.",
  "I'm bored & missing you 😣",
  "Stay tuned for bot v1.1.2 🚀"
];

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state,
    printQRInTerminal: false,
    browser: ["Annoying Bot", "Chrome", "1.1.2"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("📱 Scan this QR with WhatsApp");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ Bot Connected Successfully");
      console.log("👑 Owner: Abutieyy Mahappen");
    }

    if (connection === "close") {
      if (
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      ) {
        startBot();
      } else {
        console.log("❌ Logged out. Delete auth folder and restart.");
      }
    }
  });

  /* 📩 MESSAGE HANDLER */
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (!text) return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith("@g.us");
    const sender = msg.key.participant || from;
    const isOwner = sender === OWNER_NUMBER;

    /* 👑 COMMANDS */

    if (text === "/owner") {
      return sock.sendMessage(from, {
        text: `👑 *Bot Developer*
Name: Abutieyy Mahappen
GitHub: https://github.com/AbutiieyyMahappen`
      });
    }

    if (text === "/github") {
      return sock.sendMessage(from, {
        text: `🐙 *Source Code*
https://github.com/AbutiieyyMahappen/annoying-whatsapp-bot

⭐ Star & Fork it`
      });
    }

    if (text === "/on") {
      if (!isOwner)
        return sock.sendMessage(from, { text: "❌ Owner only command" });

      botEnabled = true;
      return sock.sendMessage(from, { text: "😈 Bot Enabled" });
    }

    if (text === "/off") {
      if (!isOwner)
        return sock.sendMessage(from, { text: "❌ Owner only command" });

      botEnabled = false;
      return sock.sendMessage(from, { text: "😴 Bot Disabled" });
    }

    if (!botEnabled) return;

    /* 🤖 AUTO REPLY */
    await new Promise(r => setTimeout(r, 1500));

    const reply = replies[Math.floor(Math.random() * replies.length)];

    if (isGroup) {
      await sock.sendMessage(from, {
        text: `🤖 ${reply}`,
        mentions: [sender]
      });
    } else {
      await sock.sendMessage(from, {
        text: "🤖 " + reply
      });
    }
  });
}

startBot();
