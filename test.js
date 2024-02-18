const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');
const qr = require('qr-image');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors({
    origin: '', 
    methods: ['GET', 'POST']
}));
app.use(bodyParser.json());

const activeClients = {}; 

app.get('/initialize-client', async (req, res) => {
    const { clientId } = req.query;

    try {
        if (activeClients[clientId]) {
            res.status(400).json({ error: `Client ${clientId} already initialized` });
            return;
        }
        const client = new Client({
            qrMaxRetries: 1,
            authStrategy: new LocalAuth({ clientId }),
            puppeteer: {
                headless: true,
                args: ["--no-sandbox", '--proxy-server=46.166.137.38:31499']
            }
        });
        client.on('qr', (qrCode) => {
            console.log(`QR RECEIVED for ${clientId}`, qrCode);
            const qrImage = qr.image(qrCode, { type: 'png' });
            qrImage.pipe(res, { end: true });
        });

        client.on('ready', () => {
            console.log(`Client is ready for ${clientId}`);
            activeClients[clientId] = client;
        });

        client.initialize();
        
    } catch (error) {
        console.error(`Error initializing client ${clientId}:`, error.message);
        res.status(500).json({ error: `Error initializing client ${clientId}` });
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

app.get('/message', (req, res, next) => {
    const requestedClientId = req.query.clientId;
    const number = req.query.to;
    const text = req.query.message;

    if (!requestedClientId && number && text ) {
        res.status(400).json({ error: 'clientId, number and text are required in the query parameters' });
        return;
    }

    const client = activeClients[requestedClientId];    
    if (client) {

       const chatId = number.substring(1) + "@c.us";
       client.sendMessage(chatId, text);
            res.status(200).json({ message: `Client ${requestedClientId} send message successfully` });
        
    } else {
        res.status(404).json({ error: `Client ${requestedClientId} not found or not ready` });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://207.244.239.151:${port}`);
});
