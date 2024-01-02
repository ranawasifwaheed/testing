const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();
const app = express();
//add port
const port = 781;

app.use(express.json());

async function createAndInitializeClient(clientId, res) {
    try {
        const client = new Client({
            authStrategy: new LocalAuth({ clientId: clientId }),
            puppeteer: {
                headless: true,
                args: ["--no-sandbox"]
            }
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
    } catch (error) {
        console.error('Error creating and initializing client:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

async function sendStatusResponse(clientId, res) {
    const session = await prisma.session.findUnique({
        where: { clientId },
    });

    if (!session) {
        return res.status(404).json({ error: 'Client not found.' });
    }
    res.status(200).json({ status: session.status || 'unknown' });
}

app.post('/create-client', async (req, res) => {
    const { clientId } = req.body;

    if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required in the request body.' });
    }

    await createAndInitializeClient(clientId, res);
});

app.get('/status', async (req, res) => {
    const { clientId } = req.query;

    if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required as a query parameter.' });
    }

    sendStatusResponse(clientId, res);
});

app.listen(port, () => {
    console.log(`Server is running on http://207.244.239.151:${port}`);
});
