const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');
const qr = require('qr-image');
const { PrismaClient } = require("./generated/client");
const prisma = new PrismaClient();
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors({
    origin: '', 
    methods: ['GET', 'POST']
}));
app.use(bodyParser.json());


app.get('/initialize-client', async (req, res) => {
    const { clientId, phone_number } = req.query;

    try {
        const client = new Client({
            qrMaxRetries: 1,
            authStrategy: new LocalAuth({ clientId }),
            puppeteer: {
                headless: true,
            }
        });

        const existingQRCode = await prisma.qRCode.findFirst({
            where: { clientId },
        });

        
        let updatedQRCode;

        client.on('qr', async (qrCode) => {
            
            if (existingQRCode) {
                updatedQRCode = await prisma.qRCode.update({
                    where: { id: existingQRCode.id },
                    data: { qrCode, phone_number }
                });
            } else {
                // Create a new QR code entry
                updatedQRCode = await prisma.qRCode.create({
                    data: { clientId, qrCode, phone_number, status: 0 }
                });
                
            }

            console.log(`QR RECEIVED for ${clientId}`, qrCode);
            console.log(client)
            const qrImage = qr.image(qrCode, { type: 'png' });
            qrImage.pipe(res, { end: true });
        });

        client.on('ready', async () => {
            console.log(`Client is ready for ${clientId}`);
            
            console.log(client_data)
            await prisma.qRCode.update({
                where: { id: updatedQRCode.id },
                data: { status: 1,  client: client}
            });
        });

        client.on('disconnected', async (reason) => {
            console.log(`Client for ${clientId} was logged out`, reason);
            await prisma.qRCode.update({
                where: { id: updatedQRCode.id },
                data: { status: 0 }
            });
        });

        client.initialize();

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get('/status', async (req, res, next) => {
    const requestedClientId = req.query.clientId;

    if (!requestedClientId) {
        res.status(400).json({ error: 'clientId is required in the query parameters' });
        return;
    }

    try {
        const existingClient = await prisma.qRCode.findFirst({
            where: { clientId: requestedClientId, status: 1 },
        });

        if (existingClient) {
            res.status(200).json({ message: `Client ${requestedClientId} is ready` });
        } else {
            res.status(404).json({ error: `Client ${requestedClientId} not found or not ready` });
        }
    } catch (error) {
        console.error(`Error checking status for client ${requestedClientId}:`, error.message);
        res.status(500).json({ error: `Error checking status for client ${requestedClientId}` });
    }
});

app.get('/message', async (req, res, next) => {
    const requestedClientId = req.query.clientId;
    const number = req.query.to;
    const text = req.query.message;

    if (!requestedClientId || !number || !text) {
        res.status(400).json({ error: 'clientId, phoneNumber, and text are required in the query parameters' });
        return;
    }

    try {
        // Check if the client is ready in the database
        const existingClient = await prisma.qRCode.findFirst({
            where: { clientId: requestedClientId, status: 1 },
        });

        if (!existingClient) {
            res.status(404).json({ error: `Client ${requestedClientId} not found or not ready` });
            return;
        }

        // Proceed without checking the activeClients object
        const chatId = number.substring(1) + "@c.us";
        existingClient.sendMessage(chatId, text);

        // Store the message log in the database
        await prisma.messageLog.create({
            data: {
                clientId: requestedClientId,
                phoneNumber: number,
                message: text,
            },
        });
        console.log(`Message logged for client ${requestedClientId}`);

        res.status(200).json({ message: `Client ${requestedClientId} sent the message successfully` });
    } catch (error) {
        console.error(`Error processing message for client ${requestedClientId}:`, error.message);
        res.status(500).json({ error: `Error processing message for client ${requestedClientId}` });
    }
});




// app.get('/logout', (req, res, next) => {
//     const requestedClientId = req.query.clientId;

//     if (!requestedClientId) {
//         res.status(400).json({ error: 'clientId is required in the query parameters' });
//         return;
//     }

//     const client = activeClients[requestedClientId];
//     console.log(client);
    
//     if (client) {
//         client.on('disconnected', (reason) => {
//             // client.destroy();
//             console.log(`Client for ${requestedClientId} was logged out`, reason);
//             delete activeClients[requestedClientId];
//             client.initialize()

//         });
    
//         res.status(200).json({ message: `Client ${requestedClientId} was logged out` });
//     } else {
//         res.status(404).json({ error: `Client ${requestedClientId} not found or not ready` });
//     }
// });


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});