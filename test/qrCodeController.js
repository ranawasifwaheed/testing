const generateQRCode = require('./qrcodeGenerator');
const prisma = require('./prismaClient');

async function insertQRCodeIntoDB(user_id, number, qrCodeDataURL) {
  return prisma.qRCode.create({
    data: {
      user_id,
      number,
      qr_code_data_url: qrCodeDataURL,
    },
  });
}

module.exports = { insertQRCodeIntoDB };
