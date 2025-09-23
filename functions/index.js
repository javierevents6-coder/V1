const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Función que asigna admin únicamente a tu correo principal
exports.makeAdmin = functions.https.onCall(async (data, context) => {
  const email = "wildpicturesstudio@gmail.com"; // <-- tu correo fijo aquí

  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    return { message: `✅ Usuario ${email} ahora es admin` };
  } catch (error) {
    throw new functions.https.HttpsError("unknown", error.message, error);
  }
});
