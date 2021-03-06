const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// http request
exports.redirectWebsite = functions.https.onRequest((req, res) => {
  res.redirect("https://www.google.com");
});

//auth trigger (new user signup)
exports.newUserSignup = functions.auth.user().onCreate(async (user) => {
  return await admin.firestore().collection("user").doc(user.uid).set({
    email: user.email,
    upvotedOn: [],
  });
});

//auth trigger (delete user)
exports.userDeleted = functions.auth.user().onDelete(async (user) => {
  const currentUser = await admin.firestore().collection("user").doc(user.uid);
  currentUser.delete();
  return { message: "user deleted" };
});

//http callable function (add request)
exports.addRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }

  if (data.text.length > 30) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "request must be no more than 30 characters long"
    );
  }

  return await admin.firestore().collection("requests").add({
    text: data.text,
    upvotes: 0,
  });
});

//http callable function (upvote)
exports.upvote = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }

  const user = admin.firestore().collection("user").doc(context.auth.uid);
  const request = admin.firestore().collection("requests").doc(data.id);

  const doc = await user.get();
  if (doc.data().upvotedOn.includes(data.id)) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "You can only upvote something once"
    );
  }

  await user.update({
    upvotedOn: [...doc.data().upvotedOn, data.id],
  });

  return request.update({ upvotes: admin.firestore.FieldValue.increment(1) });
});
