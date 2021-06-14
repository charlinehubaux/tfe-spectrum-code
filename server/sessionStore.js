var admin = require("firebase-admin");

var serviceAccount = require("../tfe-spectrum-code-firebase-adminsdk-iz9ma-d7f7c55698.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: 'https://tfe-spectrum-code.firebaseio.com'
});

const db = admin.firestore();
const cityRef = db.collection('cities').doc('SF');
cityRef.get().then(doc => {
  if (!doc.exists) {
    console.log('No such document!');
  } else {
    console.log('Document data:', doc.data());
  }
});


class SessionStore {
  constructor() {
    this.collection = [];
  }
  async findSession(sessionID) {
    //return this.collection.find((session) => session.sessionID === sessionID);
    db.collection('users').where('sessionID', "==", sessionID).get
  }
  async findSessionIndex(sessionToSearch) {
    return this.collection.findIndex(
      (session, index) => sessionToSearch.userID === session.userID
    );
  }
  async saveSession(session) {
    console.log("save session", session);
    const existingSessionIndex = await this.findSessionIndex(session);
    console.log("existingSessionIndex", existingSessionIndex);
    if (existingSessionIndex >= 0) {
      this.collection[existingSessionIndex] = session;
    } else {
      this.collection.push(session);
    }
    console.log("current database : ", this.collection);
    return;
  }

  async findAllSessions() {
    return this.collection;
  }
}

module.exports = SessionStore;
