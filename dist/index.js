"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
console.log("WORKS");
const usePort = Number(process.env.EMAIL_PORT) || 587;
const useSecure = usePort === 465;
const defaultTransporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST || "mail.privateemail.com",
    port: usePort,
    secure: useSecure, // true for 465, false for 587
    requireTLS: !useSecure, // upgrade to TLS on 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
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
app.post("/emailer/send", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield defaultTransporter.sendMail(Object.assign({}, req.body));
        console.log("Email sent: ", req.body.to, " - ", !req.body.subject);
        res.status(200).json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ success: false });
    }
}));
app.get("/health", (_req, res) => res.status(200).send("ok"));
const port = Number(process.env.PORT) || 1994;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
});
