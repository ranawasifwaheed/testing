const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const bodyParser = require('body-parser');
const qr = require('qr-image');
const cors = require('cors');
const app = express();
const port = 781;
app.use(cors({
    origin: '', 
    methods: ['GET', 'POST']
}));
app.use(bodyParser.json());


app.post('/initialize-client', async (req, res) => {
    const { clientId } = req.body;

    try {
        const client = new Client({
            authStrategy: new LocalAuth({ clientId }),
            puppeteer: {
              headless: true,
            //   args: ["--no-sandbox", '--proxy-server=46.166.137.38:31499']
            }
          });
        client.on('qr', (qrCode) => {
            console.log('QR RECEIVED', qrCode);
            const qrImage = qr.image(qrCode, { type: 'png' });
            qrImage.pipe(res, { end: true });
        });

        client.on('ready', () => {
            console.log(`Client is ready! ${clientId}`);
        });

        // client.on('message', (message) => {
        //     console.log(message.body);
        // });
 
        client.on('disconnected', (reason) => {
            console.log('Client was logged out', reason);
        });

        client.initialize();
    } catch (error) {
        console.error(`Error initializing client ${clientId}:`, error.message);
        res.status(500).json({ error: `Error initializing client ${clientId}` });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://207.244.239.151:${port}`);
});
