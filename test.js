const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');
const qr = require('qr-image');
const { PrismaClient } = require("./generated/client");
const prisma = new PrismaClient();
const cors = require('cors');
const app = express();
const port = 781;
app.use(cors({
    origin: '', 
    methods: ['GET', 'POST']
}));
app.use(bodyParser.json());

const activeClients = {};
app.get('/initialize-client', async (req, res) => {
    const { clientId, phone_number } = req.query;

    try {
        const existingClient = await prisma.qRCode.findFirst({
            where: { clientId, status: 1 },
        });

        if (existingClient) {
            res.status(400).json({ error: `Client ${clientId} already initialized` });
            return;
        }

        const existingQRCode = await prisma.qRCode.findFirst({
            where: { clientId, status: 0 },
        });

        const client = new Client({
            qrMaxRetries: 1,
            authStrategy: new LocalAuth({ clientId }),
            puppeteer: {
                headless: true,
            }
        });
        let updatedQRCode;

        client.on('qr', async (qrCode) => {
            
            if (existingQRCode) {
                updatedQRCode = await prisma.qRCode.update({
                    where: { id: existingQRCode.id },
                    data: { qrCode, phone_number }
                });
            } else {
                updatedQRCode = await prisma.qRCode.create({
                    data: { clientId, qrCode, phone_number, status: 0 }
                });
                
            }

            console.log(`QR RECEIVED for ${clientId}`, qrCode);
            const qrImage = qr.image(qrCode, { type: 'png' });
            qrImage.pipe(res, { end: true });
        });

        client.on('ready', async () => {
            console.log(`Client is ready for ${clientId}`);
                await prisma.qRCode.update({
                where: { id: updatedQRCode.id },
                data: { status: 1}
            });
            activeClients[clientId] = client;
        });

        client.on('disconnected', async (reason) => {
            console.log(`Client for ${clientId} was logged out`, reason);
            await prisma.qRCode.update({
                where: { id: updatedQRCode.id },
                data: { status: 0 }
            });
            delete activeClients[clientId];
        });

        client.initialize();

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get('/status', (req, res, next) => {
    const requestedClientId = req.query.clientId;

    if (!requestedClientId) {
        res.status(400).json({ error: 'clientId is required in the query parameters' });
        return;
    }

    const client = activeClients[requestedClientId];
    if (client) {
        res.status(200).json({ message: `Client ${requestedClientId} is ready` });
    } else {
        res.status(404).json({ error: `Client ${requestedClientId} not found or not ready` });
    }
});

app.get('/message', async (req, res, next) => {
    const requestedClientId = req.query.clientId;
    const number = req.query.to;
    const text = req.query.message;

    if (!requestedClientId || !number || !text) {
        res.status(400).json({ error: 'clientId, number, and text are required in the query parameters' });
        return;
    }

    const client = activeClients[requestedClientId];

    if (client) {
        const chatId = number.substring(1) + "@c.us";
        client.sendMessage(chatId, text);

        try {
            await prisma.messageLog.create({
                data: {
                    clientId: requestedClientId,
                    phoneNumber: number,
                    message: text,
                },
            });
            res.status(200).json({ message: `Client ${requestedClientId} sent message successfully` });
        } catch (error) {
            console.error("Error saving message log:", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(404).json({ error: `Client ${requestedClientId} not found or not ready` });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://207.244.239.151:${port}`);
});
