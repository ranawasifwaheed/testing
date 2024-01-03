const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();
const app = express();
const port = 781;

app.use(express.json());

async function createAndInitializeClient(clientId, res) {
    try {
        let qrCodeData;
        let responseSent = false;
        let qrCodeTimeout;
        let generateQRCode = true;

        const client = new Client({
            authStrategy: new LocalAuth({ clientId: clientId }),
            puppeteer: {
                headless: true,
                args: ["--no-sandbox"]
            }
        });

        client.on('qr', async (qr) => {
            if (!generateQRCode || responseSent) {
                return;
            }

            console.log('QR RECEIVED', qr);

            const existingSession = await prisma.session.findUnique({
                where: { clientId },
            });

            if (existingSession) {
                await prisma.session.update({
                    where: { clientId },
                    data: {
                        qrCodeData: qr,
                    },
                });
            } else {
                await prisma.session.create({
                    data: {
                        clientId,
                        qrCodeData: qr,
                    },
                });
            }

            qrCodeData = qr;

            if (!responseSent && generateQRCode) {
                res.status(200).json({ qrCodeData, message: 'QR code sent. Waiting for the client to be ready.' });

                clearTimeout(qrCodeTimeout);

                qrCodeTimeout = setTimeout(() => {
                    
                }, 40000);
            }

            generateQRCode = false;
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

app.get('/create-client', async (req, res) => {
    const clientId = req.query.clientId;

    if (!clientId) {
        return res.status(400).json({ error: 'Client ID is required as a query parameter.' });
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
