import QRCode from 'qrcode';

/**
 * Generates a UPI payment QR code as a data URL
 * Works with GPay, PhonePe, Paytm, any UPI app
 * 
 * @param {string} upiId     - Shop's UPI ID e.g. "boutique@okaxis"
 * @param {string} name      - Shop name shown in UPI app
 * @param {number} amount    - Amount in INR
 * @param {string} orderId   - For transaction note
 * @returns {Promise<string>} - Base64 image data URL
 */
export async function generateUpiQr(upiId, name, amount, orderId) {
    const upiUrl = [
        `upi://pay`,
        `?pa=${encodeURIComponent(upiId)}`,
        `&pn=${encodeURIComponent(name)}`,
        `&am=${amount}`,
        `&cu=INR`,
        `&tn=${encodeURIComponent(`StitchFlow Order #${orderId.slice(0, 6).toUpperCase()}`)}`,
    ].join('');

    const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 220,
        margin: 2,
        color: {
            dark: '#111827',  // matches --adm-text
            light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H', // highest reliability
    });

    return qrDataUrl;
}