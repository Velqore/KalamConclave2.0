import QRCode from 'qrcode'

/**
 * Generates a QR code data URL encoding pass verification data.
 * @param {string} passId  - The unique pass / registration ID
 * @param {string} participantId - Participant's name or reg ID used for verification
 * @returns {Promise<string>} base64 PNG data URL
 */
export async function generateQRCode(passId, participantId) {
  const verificationData = JSON.stringify({
    passId,
    participantId,
    verified: true,
    timestamp: new Date().toISOString(),
  })

  const dataUrl = await QRCode.toDataURL(verificationData, {
    width: 200,
    margin: 1,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  })

  return dataUrl
}
