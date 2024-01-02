const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

async function createAndInitializeClient(clientId, res) {
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: clientId })
    });

    client.on('qr', async (qr) => {
        console.log('QR RECEIVED', qr);
        await prisma.session.create({
            data: {
                clientId,
                qrCodeData: qr
            }
        });

        res.status(200).json({ qrCodeData: qr, message: 'Client created and initialized successfully.' });
    });

    client.on('ready', () => {
        console.log('Client is ready!');
    });

    client.initialize();
    return client;
}

app.post('/create-client', async (req, res) => {
    const { clientId } = req.body;

    if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required in the request body.' });
    }
    const client = await createAndInitializeClient(clientId, res);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
