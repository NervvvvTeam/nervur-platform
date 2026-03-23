const QRCode = require("qrcode");

async function generateQRCode(url, options = {}) {
  const { width = 400, margin = 2, color = "#09090B", background = "#FFFFFF" } = options;

  const qrDataUrl = await QRCode.toDataURL(url, {
    width,
    margin,
    color: {
      dark: color,
      light: background,
    },
    errorCorrectionLevel: "H",
  });

  return qrDataUrl;
}

async function generateQRBuffer(url, options = {}) {
  const { width = 800, margin = 2, color = "#09090B", background = "#FFFFFF" } = options;

  const buffer = await QRCode.toBuffer(url, {
    width,
    margin,
    color: {
      dark: color,
      light: background,
    },
    errorCorrectionLevel: "H",
    type: "png",
  });

  return buffer;
}

module.exports = { generateQRCode, generateQRBuffer };
