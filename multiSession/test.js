const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { PrismaClient } = require('./generated/client');
const cors = require('cors');
const qr = require('qr-image');
const prisma = new PrismaClient();
const app = express();
const port = 781;

app.use(express.json());
app.use(cors({
    origin: '', 
    methods: ['GET', 'POST']
}));


async function createAndInitializeClient(clientId, phone_number, res) {
    try {
        if (!clientId || !phone_number) {
            throw new Error('Client ID and phone number are required.');
        }

        let qrCodeData;
        const client = new Client({
            authStrategy: new LocalAuth({ clientId: clientId }),
            puppeteer: {
                headless: true,
                args: ["--no-sandbox"]
            }
        });

        // Define the QR event listener
        const onQRReceived = async (qrCode) => {
            console.log('QR RECEIVED', qrCode);
            const timestamp = Date.now();
            qrCodeData = qrCode;

            const qrImage = qr.image(qrCode, { type: 'png' });
            qrImage.pipe(res, { end: true });

            console.log(`Client ${clientId} generated`);
            await prisma.session.upsert({
                where: { clientId },
                update: { phone_number, qrCodeData, createdAt: timestamp },
                create: { clientId, phone_number, qrCodeData, createdAt: timestamp },
            });

            client.removeListener('qr', onQRReceived);
        };

        client.on('qr', onQRReceived);

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
        res.status(400).json({ error: error.message });
    }
}


async function sendStatusResponse(clientId, phone_number, res) {
    try {
        const session = await prisma.session.findUnique({
            where: { 
                clientId,
                phone_number,
            },
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

app.post('/create-client', async (req, res) => {
    const { clientId, phone_number } = req.body;

    try {
        const client = await createAndInitializeClient(clientId, phone_number, res);
        res.json({ message: 'Success' }); // Change this line accordingly
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/send-message', async (req, res) => {
    const { clientId, phone_number, to, message } = req.query;

    try {
        const session = await prisma.session.findUnique({
            where: {
                clientId,
                phone_number,
            },
        });

        if (!session || session.status !== 'ready') {
            res.status(404).json({ error: 'Client not found or not ready.' });
            return;
        }

        const client = await createAndInitializeClient(clientId, session.phone_number, res);
        await sendMessage(client, to, message);
        res.status(200).json({ success: true, message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    } finally {
        sendStatusResponse(clientId, phone_number, res);
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
