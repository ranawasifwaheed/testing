const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { PrismaClient } = require('./generated/client');

const prisma = new PrismaClient();
const app = express();
const port = 781;

app.use(express.json());

async function createAndInitializeClient(clientId, phone_number, res) {
    try {
        let qrCodeData;
        let generateQRCode = true;

        const client = new Client({
            authStrategy: new LocalAuth({ clientId: clientId }),
            puppeteer: {
                headless: true,
                args: ["--no-sandbox"]
            }
        });

        client.on('qr', async (qr) => {
            if (!generateQRCode) {
                return;
            }

            console.log('QR RECEIVED', qr);

            const timestamp = Date.now();

            try {
                qrCodeData = qr;
                await prisma.session.upsert({
                    where: { clientId },
                    update: { qrCodeData, createdAt: timestamp },
                    create: { clientId, phone_number, qrCodeData, createdAt: timestamp },
                });

                res.status(200).json({ qrCodeData, message: 'QR code sent. Waiting for the client to be ready.' });

                // Consider clearing the timeout if necessary
                clearTimeout(qrCodeTimeout);

                // Set a timeout if needed
                qrCodeTimeout = setTimeout(() => {
                    // Handle timeout actions
                }, 40000);
            } catch (error) {
                console.error('Error updating session in the database:', error.message);
                res.status(500).json({ error: 'Internal server error.' });
            }
        });

        client.on('ready', async () => {
            console.log('Client is ready!');
            await prisma.session.upsert({
                where: { clientId },
                update: { status: 'ready', qrCodeData },
                create: { clientId, status: 'ready', phone_number, qrCodeData },
            });
            sendStatusResponse(clientId, phone_number, res);
        });

        client.initialize();
        return client;
    } catch (error) {
        console.error('Error creating and initializing client:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

async function sendStatusResponse(clientId, phone_number, res) {
    try {
        const session = await prisma.session.findUnique({
            where: { clientId },
        });

        if (!session) {
            res.status(404).json({ error: 'Client not found.' });
        } else {
            res.status(200).json({
                clientId: session.clientId,
                status: session.status || 'unknown',
                phone_number: phone_number || session.phone_number,
            });
        }
    } catch (error) {
        console.error('Error fetching session status:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
}

async function sendMessage(client, to, message) {
    try {
        await client.sendMessage(to, message);
        console.log('Message sent successfully.');
    } catch (error) {
        console.error('Error sending message:', error.message);
        throw error;
    }
}

app.get('/create-client', async (req, res) => {
    const clientId = req.query.clientId;
    const phone_number = req.query.phone_number;

    if (!clientId || !phone_number) {
        res.status(400).json({ error: 'Client ID and phone number are required as query parameters.' });
    } else {
        try {
            const client = await createAndInitializeClient(clientId, phone_number, res);
            }
        catch (error) {
        // Handle errors from createAndInitializeClient
        }
    }
});

app.get('/send-message', async (req, res) => {
    const { clientId, to, message } = req.query;

    if (!clientId || !to || !message) {
        res.status(400).json({ error: 'Client ID, recipient (to), and message are required as query parameters.' });
    } else {
        try {
            const session = await prisma.session.findUnique({
                where: { clientId },
            });

            if (!session || session.status !== 'ready') {
                res.status(404).json({ error: 'Client not found or not ready.' });
            } else {
                const client = await createAndInitializeClient(clientId, session.phone_number, res);
                await sendMessage(client, to, message);
                res.status(200).json({ success: true, message: 'Message sent successfully.' });
            }
        } catch (error) {
            console.error('Error sending message:', error.message);
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
});

app.get('/status', async (req, res) => {
    const { clientId, phone_number } = req.query;

    if (!clientId) {
        res.status(400).json({ error: 'Client ID is required as a query parameter.' });
    } else {
        sendStatusResponse(clientId, phone_number, res);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://207.244.239.151:${port}`);
});
