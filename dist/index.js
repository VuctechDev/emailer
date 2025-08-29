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
let defaultTransporter = nodemailer_1.default.createTransport({
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
app.post("/emailer/send", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const key = process.env.API_KEY;
    try {
        const { apikey } = req.headers;
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
const envPort = process.env.PORT;
const port = +envPort || 2302;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
