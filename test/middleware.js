const app = require('./app');

function verifySecretKey(req, res, next) {
  const incomingSecretKey = req.headers['x-secret-key'];

  if (incomingSecretKey !== process.env.SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Invalid secret key.' });
  }

  next();
}

app.use(verifySecretKey);

module.exports = app;
