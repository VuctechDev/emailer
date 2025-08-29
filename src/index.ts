import express, { Application } from "express";
import cors from "cors";
import nodemailer from "nodemailer";
require("dotenv/config");

const app: Application = express();
app.use(cors());
app.use(express.json());

console.log("WORKS");

const usePort = Number(process.env.EMAIL_PORT) || 587;
const useSecure = usePort === 465;

const defaultTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "mail.privateemail.com",
  port: usePort,
  secure: useSecure, // true for 465, false for 587
  requireTLS: !useSecure, // upgrade to TLS on 587
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
  // fail fast
  connectionTimeout: 15000, // time to establish TCP
  socketTimeout: 20000, // idle socket timeout
  greetingTimeout: 10000,
  // helpful when cert chains are odd; prefer to leave this true in prod
  tls: {
    servername: "mail.privateemail.com",
    rejectUnauthorized: true,
  },
  // enable logs during debugging
  logger: true,
  debug: true,
});

app.post("/emailer/send", async (req, res) => {
  const key = process.env.API_KEY;
  try {
    const { apikey } = req.headers;
    console.log("New REQUEST: ", apikey, key);

    if (!apikey || key !== apikey) {
      return res.status(401).json({ success: false });
    }

    if (!req.body.to || !req.body.subject || !req.body.html || !req.body.from) {
      return res.status(400).json({ success: false });
    }

    await defaultTransporter.sendMail({ ...req.body });
    console.log("Email sent: ", req.body.to, " - ", !req.body.subject);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false });
  }
});

app.get("/health", (_req, res) => res.status(200).send("ok"));

const port = Number(process.env.PORT) || 1994;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
