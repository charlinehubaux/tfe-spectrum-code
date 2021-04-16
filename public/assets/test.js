const URL = "http://localhost";
const socket = io(URL, { autoConnect: false });

socket.onAny((event, ...args) => {
  console.log(event, args);
});

function showUsernamePicker() {
  console.log("showUsername");
  const container = document.querySelector("#js-container");
  container.html = "select username";
}

function init() {
  let users = [];
  let usernameAlreadySelected = false;
  let connected = false;
  const sessionID = localStorage.getItem("sessionID");
  console.log("My local storage session id", sessionID);
  if (sessionID) {
    console.log("je suis connecté");
    localStorage.removeItem("sessionID");
    usernameAlreadySelected = true;
    socket.auth = { sessionID };
    socket.connect();
  } else {
    console.log("should show username");
    showUsernamePicker();
  }

  socket.on("session", (user) => {
    const { sessionID, userID } = user;
    console.log("session", user);
    // attach the session ID to the next reconnection attempts
    socket.auth = { sessionID };
    // store it in the localStorage
    localStorage.setItem("sessionID", sessionID);
    // save the ID of the user
    socket.userID = userID;
    connected = true;
  });

  socket.on("users", (receivedUsers) => {
    users = receivedUsers;
  });

  socket.on("user connected", (user) => {
    users = [...users, user];
  });

  socket.on("user disconnected", (userID) => {
    users = users.filter((u) => u.userID !== userID);
  });

  socket.on("connect", () => {
    connected = true;
  });
  socket.on("disconnect", () => {
    connected = false;
  });
  socket.on("connect_error", (err) => {
    if (err.message === "invalid username") {
      usernameAlreadySelected = false;
      showUsernamePicker();
    }
  });
}
document.addEventListener("DOMContentLoaded", init);
