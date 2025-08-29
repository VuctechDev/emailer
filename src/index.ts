import express, { Application } from "express";
import cors from "cors";
import nodemailer from "nodemailer";
require("dotenv/config");

const app: Application = express();
app.use(cors());
app.use(express.json());

let defaultTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

app.post("/emailer/send", async (req, res) => {
  const key = process.env.API_KEY;
  try {
    const { apikey } = req.headers;

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

app.get('/health', (_req, res) => res.send('ok'));

const port = Number(process.env.PORT) || 1994;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});
