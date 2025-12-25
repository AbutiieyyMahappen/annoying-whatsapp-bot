const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const qrcode = require("qrcode-terminal");

let botEnabled = true;

const replies = [
  "Why are you texting me? 😒",
  "I saw your message… ignored.",
  "Hmm 🤔",
  "Okay.",
  "Bot says no.",
  "Try again later 😴"
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

    if (text === "/off") {
      botEnabled = false;
      await sock.sendMessage(from, { text: "😴 Bot OFF" });
      return;
    }

    if (text === "/on") {
      botEnabled = true;
      await sock.sendMessage(from, { text: "😈 Bot ON" });
      return;
    }

    if (!botEnabled) return;

    await new Promise(r => setTimeout(r, 2000));

    const reply = replies[Math.floor(Math.random() * replies.length)];

    await sock.sendMessage(from, { text: "🤖 " + reply });
  });
}

startBot();
