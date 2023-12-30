const express = require('express');
const bodyParser = require('body-parser');
const qrcode = require('qrcode');
const session = require('express-session');
const { PrismaClient } = require('./generated/client');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(
  session({
    secret: 'test',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const prisma = new PrismaClient();

async function generateQRCode(user_id, number) {
  const text = `user_id=${user_id}&number=${encodeURIComponent(number)}`;
  return qrcode.toDataURL(text);
}

async function insertQRCodeIntoDB(user_id, number, qrCodeDataURL) {
  return prisma.qRCode.create({
    data: {
      user_id,
      number,
      qr_code_data_url: qrCodeDataURL,
    },
  });
}

app.post('/qr-generate', async (req, res) => {
  const { user_id, number } = req.body;

  try {
    if (!user_id || !number) {
      throw new Error('user_id and number parameters are required.');
    }

    if (!req.session.qrCodes) {
      req.session.qrCodes = [];
    }

    const qrCodeDataURL = await generateQRCode(user_id, number);

    await insertQRCodeIntoDB(user_id, number, qrCodeDataURL);

    // Add the new QR code to the session
    req.session.qrCodes.push({
      user_id,
      number,
      qrCodeDataURL,
    });

    res.json({
      message: 'QR code generated and stored successfully!',
      user_id,
      number,
      qrCodeDataURL,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/send-message', async (req, res) => {
  const { user_id, number, to_number, message } = req.body;

  try {
    if (!user_id || !number || !to_number || !message) {
      throw new Error('user_id, number, to_number, and message parameters are required.');
    }

    // Check if a session exists for the given user
    if (!req.session.qrCodes) {
      throw new Error('Session not found. Please generate a QR code first.');
    }

    // Find the user's QR code information
    const userQRCode = req.session.qrCodes.find((qrCode) => qrCode.user_id === user_id && qrCode.number === number);

    if (!userQRCode) {
      throw new Error('QR code not found for the given user.');
    }

    // Implement logic to send the message (replace with your actual logic)
    console.log(`Sending message "${message}" from ${number} to ${to_number}`);

    res.json({
      message: 'Message sent successfully!',
      user_id,
      number,
      to_number,
      message,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/verify-session', (req, res) => {
  const { user_id, number } = req.body;

  try {
    if (!user_id || !number) {
      throw new Error('user_id and number parameters are required.');
    }

    // Check if a session exists for the given user
    if (!req.session.qrCodes) {
      throw new Error('Session not found. Please generate a QR code first.');
    }

    // Find the user's QR code information
    const userQRCode = req.session.qrCodes.find((qrCode) => qrCode.user_id === user_id && qrCode.number === number);

    if (!userQRCode) {
      throw new Error('QR code not found for the given user.');
    }

    res.json({
      message: 'Session verified successfully!',
      user_id,
      number,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
