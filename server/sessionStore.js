class SessionStore {
  constructor() {
    this.collection = [];
  }
  async findSession(sessionID) {
    return this.collection.find((session) => session.sessionID === sessionID);
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
