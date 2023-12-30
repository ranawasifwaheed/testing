const qrcode = require('qrcode');

async function generateQRCode(user_id, number) {
  const text = `user_id=${user_id}&number=${encodeURIComponent(number)}`;
  return qrcode.toDataURL(text);
}

module.exports = generateQRCode;
