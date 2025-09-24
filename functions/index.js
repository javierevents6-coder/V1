const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Callable function to assign admin to a fixed email
exports.makeAdmin = functions.https.onCall(async (data, context) => {
  const email = "wildpicturesstudio@gmail.com";

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `✅ Usuario ${email} ahora es admin` };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});

// Mercado Pago config check
exports.mpCheckConfig = functions.https.onCall(async (_data, _context) => {
  const accessToken = process.env.MP_ACCESS_TOKEN || (functions.config().mp && functions.config().mp.access_token);
  return { configured: Boolean(accessToken) };
});

// Mercado Pago - create preference via Firebase Functions (no Netlify)
exports.mpCreatePreference = functions.https.onCall(async (data, context) => {
  try {
    const { preference } = data || {};
    if (!preference || !Array.isArray(preference.items)) {
      throw new functions.https.HttpsError('invalid-argument', 'Preferência inválida.');
    }

    const accessToken = process.env.MP_ACCESS_TOKEN || (functions.config().mp && functions.config().mp.access_token);
    if (!accessToken) {
      throw new functions.https.HttpsError('failed-precondition', 'Mercado Pago não configurado. Defina MP_ACCESS_TOKEN nas variáveis do Firebase Functions.');
    }

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    let body = null;
    try { body = await response.clone().json(); } catch (_) { try { body = await response.text(); } catch (e) { body = null; } }

    if (!response.ok) {
      const msg = (body && (body.message || body.error)) || 'Erro ao criar preferência';
      throw new functions.https.HttpsError('unknown', msg);
    }

    return {
      id: body.id,
      init_point: body.init_point,
      sandbox_init_point: body.sandbox_init_point,
    };
  } catch (err) {
    if (err instanceof functions.https.HttpsError) throw err;
    throw new functions.https.HttpsError('unknown', err?.message || 'Erro desconhecido', err);
  }
});

// Mercado Pago webhook - receive notifications and persist minimal audit
exports.mpWebhook = functions.https.onRequest(async (req, res) => {
  // Basic CORS for MP callbacks
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN || (functions.config().mp && functions.config().mp.access_token);
    const db = admin.firestore();
    const notification = req.body || {};

    await db.collection('mp_webhooks').add({
      receivedAt: new Date().toISOString(),
      notification,
    });

    if (notification.type === 'payment' && notification?.data?.id && accessToken) {
      try {
        const paymentId = notification.data.id;
        const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const payment = await r.json();
        await db.collection('mp_payments').doc(String(paymentId)).set({
          fetchedAt: new Date().toISOString(),
          payment,
        }, { merge: true });
      } catch (e) {
        console.warn('Failed to fetch payment details', e?.message || e);
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
