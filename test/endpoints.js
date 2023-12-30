const app = require('./middleware');
const generateQRCode = require('./qrcodeGenerator');
const { insertQRCodeIntoDB } = require('./qrCodeController');

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

    if (!req.session.qrCodes) {
      throw new Error('Session not found. Please generate a QR code first.');
    }
    const userQRCode = req.session.qrCodes.find((qrCode) => qrCode.user_id === user_id && qrCode.number === number);

    if (!userQRCode) {
      throw new Error('QR code not found for the given user.');
    }

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

// Verify Session Endpoint
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

// Get QR Codes Endpoint
app.get('/get_qrcodes', (req, res) => {
  const qrCodes = req.session.qrCodes || [];
  res.json({ qrCodes });
});

module.exports = app;
