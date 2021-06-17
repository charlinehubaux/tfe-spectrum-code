// ---------- ICI C'EST CE QUI SE PASSE AU NIVEAU DU SERVEUR ----------

// Immport packages and setup some boilerplate
require('dotenv').config();
const express = require("express");
const cors = require('cors');
const path = require("path");
const crypto = require("crypto");
const { networkInterfaces } = require('os');
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

var USERS = [];


// Observe si déjà une session avec ce use
io.use(async (socket, next) => {

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
    const username = socket.handshake.auth.username;
    var __indexID = 0;

    if (sessionID) {
        socket.sessionID = sessionID;
        socket.username = socket.handshake.auth.username;

        // Si Déjà ID, on cherche dans la DB
        var __indexID = USERS.findIndex(function(user, index) {
          if(user.ID == socket.sessionID)
            return true;
        });

        // S'il existe, on le mets connecté, et on lui redonne ses données
        if(__indexID != -1){
          USERS[__indexID].connected = true;
          socket.index = __indexID;
          socket.sessionID = USERS[__indexID].ID;
          socket.username = USERS[__indexID].username;
        }
    } 

    if(!sessionID || __indexID == -1){
      if(socket.username){
        socket.sessionID = randomId();
        USERS.push({
          ID : socket.sessionID,
          username : socket.username,
          connected : true  
          });
          socket.index = USERS.length-1;
      } else {
        console.log("a  man has no name");
      }
    }

    socket.join(socket.sessionID);
    console.log(USERS);
    next();
})


io.on("connection", async(socket) => {

    socket.emit('yeah', {ID :socket.sessionID, username : socket.username});
    
   // notify users upon disconnection
    socket.on("disconnect", async () => {
        const matchingSockets = await io.in(socket.sessionID).allSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
            // notify other users
            console.log(socket.sessionID, "disconnected");    
            console.log(USERS);
            USERS[socket.index].connected = false;
           // socket.broadcast.emit("user disconnected", socket.userID);

        }
    });
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
