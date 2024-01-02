const puppeteer = require('puppeteer');
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

async function createAndInitializeClient(clientId, res) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
    });

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: clientId }),
<<<<<<< HEAD
        puppeteer: {
            headless: true,
            args: ["--no-sandbox"]
        }
=======
        puppeteer: { browserWSEndpoint: await browser.wsEndpoint() },
>>>>>>> 51a3f994cc0902a65706ccc04bf443cc424afe6f
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

    client.on('ready', async () => {
        console.log('Client is ready!');
        await prisma.session.update({
            where: { clientId },
            data: { status: 'ready' }
        });
        sendStatusResponse(clientId, res);
    });

    client.initialize();
    return client;
<<<<<<< HEAD
}

async function sendStatusResponse(clientId, res) {
    const session = await prisma.session.findUnique({
        where: { clientId },
    });

    if (!session) {
        return res.status(404).json({ error: 'Client not found.' });
    }
    res.status(200).json({ status: session.status || 'unknown' });
=======
>>>>>>> 51a3f994cc0902a65706ccc04bf443cc424afe6f
}

app.post('/create-client', async (req, res) => {
    const { clientId } = req.body;

    if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required in the request body.' });
    }
    const client = await createAndInitializeClient(clientId, res);
});

app.get('/status', async (req, res) => {
    const { clientId } = req.query;

    if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required as a query parameter.' });
    }

    sendStatusResponse(clientId, res);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
