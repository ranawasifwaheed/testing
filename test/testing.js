const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Client } = require('whatsapp-web.js');
const client = new Client();
app.get('/generate-qr', async (req, res) => {
    const { user_id, phone_number } = req.query;

    if (!user_id || !phone_number) {
        return res.status(400).json({ error: 'user_id and phone_number are required parameters' });
    }

    const qrEventListener = async (qr) => {
        // Display the QR code in the terminal
        qrcode.generate(qr, { small: true });

        try {
            // Save data to the database using Prisma
            const qrData = await prisma.qr.create({
                data: {
                    user_id,
                    phone_number,
                    qrCode: qr,
                },
            });

            // Send the QR code data along with user_id and phone_number in the response
            res.json({ user_id, phone_number, qrCode: qr });

            // Remove the event listener after handling it once
            client.removeListener('qr', qrEventListener);
        } catch (error) {
            console.error('Error saving data to the database:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    // Attach the event listener
    client.on('qr', qrEventListener);

    // Initialize the WhatsApp client to trigger the 'qr' event
    client.initialize();
});

// Start your Express app
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
