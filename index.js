// ---------- ICI C'EST CE QUI SE PASSE AU NIVEAU DU SERVEUR ----------

// Immport packages and setup some boilerplate
require('dotenv').config();
const express = require("express");
const cors = require('cors');
const path = require("path");
const crypto = require("crypto");
//Create the express server
const app = express();
const server = require("http").createServer(app);
//Create the socket io server by passing a reference to the httpServer

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
    }
});

const port = process.env.PORT || 5000;
app.use(cors());


const randomId = () => crypto.randomBytes(8).toString("hex");

server.listen(port);

// Routing
app.use(express.static(path.join(__dirname, "public")));

// Instanciation des variables
const nbrConnected = 0;
const nbrReady = 0;
const choix = [0, 0];

/*
// Observe si déjà une session avec ce use
io.use(async (socket, next) => {
console.log("hello");
  console.log(socket.handshake.auth);

    if (!socket.handshake.auth) {
        return next(new Error("invalid handshake"));
    }
    
    if (socket.handshake.auth.video) {
        console.log('video player connected');
        socket.sessionID = 'video';
        socket.username = 'video';
        socket.userID = 'video';
        socket.video = true;
        return next();
    }

    // Donnée passées en ligne 25 dans test.js
    const sessionID = socket.handshake.auth.sessionID;
    console.log("sessionID lol", sessionID);
    if (sessionID) {
        console.log("sessionID", sessionID);
        //const session = await sessionStore.findSession(sessionID);

        // Si session, va chercher les IDs et name
       /* if (session) {
            console.log("session", session);
            socket.sessionID = sessionID;
            socket.username = session.username;
            socket.userID = session.userID;
            return next();
        }
    }

    // Si pas encore connecté, crée IDs
  /*  const username = socket.handshake.auth.username;
    console.log("username", username);
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.sessionID = randomId();
    socket.userID = randomId();
    socket.username = username;
    next();
})*/


io.on("connection", async(socket) => {
    console.log("on connection");

    socket.emit('yeah');
    /*// persist session
    await sessionStore.saveSession({
        sessionID: socket.sessionID,
        userID: socket.userID,
        username: socket.username,
        connected: true
    });
    console.log(socket.sessionID)

    // emit session details
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID
    });

    // join the "userID" room
    socket.join(socket.userID);

    // fetch existing users
    const sessions = await sessionStore.findAllSessions();

    console.log("all sessions", sessions);

    const users = sessions.map((session) => ({
        userID: session.userID,
        username: session.username,
        connected: session.connected
    }));

    socket.emit("users", users);

    // notify existing users
    socket.broadcast.emit("user connected", {
        userID: socket.userID,
        username: socket.username,
        connected: true,
        messages: []
    });

    socket.on("start", () => {
      socket.broadcast.emit("start");
      console.log('start');
    });

    // notify users upon disconnection
    socket.on("disconnect", async () => {
        const matchingSockets = await io.in(socket.userID).allSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
            // notify other users
            console.log(socket.sessionID, "disconnected");
            socket.broadcast.emit("user disconnected", socket.userID);
            // update the connection status of the session
            sessionStore.saveSession({
                sessionID: socket.sessionID,
                userID: socket.userID,
                username: socket.username,
                connected: false
            });
        }
    });*/
});

/*
// LANCEMENT DES EVENTS QUAND QUELQU'UN SE CONNECTE
io.on("connection", (socket) => {
  var pushed = false; // Si bouton appuyé
  var Sadmin = false; // Si admin ou pas
  nbrConnected++;

  // Check si la personne est l'admin
  socket.on("admin", () => {
    nbrConnected--;
    Sadmin = true;
  });

  // Lit si nouvelle personne connectée
  socket.on("connected", () => {
    socket.broadcast.emit("connected", nbrConnected);
  });

  //création de la fonction de READY
  socket.on("ready", (data) => {
    nbrReady++;
    //Envoyer sur le serveur, les datas qu'on a défini en appelant la fonction
    // entre crochets, création d'objets,.. tu peux envoyer pleins de données différentes, dans un même "message"
    pushed = true;
    socket.broadcast.emit("sendReady", nbrReady);
    socket.emit("sendReady", nbrReady);
  });

  // Check si la personne se déconnecte
  socket.on("disconnect", () => {
    //console.log(Sadmin);
    if (!Sadmin) {
      nbrConnected--;
      if (pushed) {
        nbrReady--;
        socket.broadcast.emit("sendReady", nbrReady);
      }
    } else {
      console.log("JE SUIS UN ADMIN !!!");
    }
    socket.broadcast.emit("disconnected", nbrConnected);
  });

  // Quand bouton Start est appuyé
  socket.on("start", () => {
    socket.broadcast.emit("start");
  });

  // Ce qu'il fait quand le temps est fini
  const timeIsFinished = (data) => {
    socket.broadcast.emit("timeup");
    socket.emit("timeup");
    choix = [0, 0];
  };

  // Check fin de video
  socket.on("video-is-finished", (question) => {
    socket.broadcast.emit("video-is-finished", question);
    setTimeout(timeIsFinished, 20000);
  });

  // Envoie nombre de choix
  socket.on("choix", (selection) => {
    choix[selection]++;
    socket.broadcast.emit("envoi-choix", choix);
    socket.emit("envoi-choix", choix);
  });
});
*/
