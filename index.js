// ---------- ICI C'EST CE QUI SE PASSE AU NIVEAU DU SERVEUR ----------

// Immport packages and setup some boilerplate
require('dotenv').config();
const express = require("express");
const cors = require('cors');
const path = require("path");
const crypto = require("crypto");
const { networkInterfaces } = require('os');
const { emit } = require('process');
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
var choix = [0, 0];

var USERS = [];
var state = "waiting";
var globalQuestion = 0;
var timePassed = 0;
var timerInterval;

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

    if(socket.handshake.auth.admin){
      console.log('Admin Connected');
      socket.sessionID ="admin";
      socket.username = "admin";
      socket.userID = "admin";
      socket.admin = true;
      socket.join("admin");
      return next();
    }

    // Donnée passées en ligne 25 dans test.js
    const sessionID = socket.handshake.auth.sessionID;
   // const username = socket.handshake.auth.username;
    var __indexID = 0;

    if (sessionID) {
        socket.sessionID = sessionID;

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
          socket.userID = sessionID;
          socket.join(socket.userID);
          return next();
        }
    } 

    // Si le user existe pas, on le créé et l'ajoute à la db locale
    if(!sessionID){
        socket.username = socket.handshake.auth.username;
        socket.sessionID = randomId();
        socket.userID = socket.sessionID;
        USERS.push({
          ID : socket.sessionID,
          username : socket.username,
          connected : true  
        });

        socket.index = USERS.length-1;
        socket.join(socket.userID);
        console.log(USERS);
        return next();
      }
});

// CONNEXION EFFECTUEE, MAINTENANT ON S'AMUSE
io.on("connection", async(socket) => {

    socket.on('start', async () =>{
      socket.broadcast.emit('startMovie');
      state = 'playing';
    });

  // Ce qu'il fait quand le temps est fini
  const timeIsFinished = (data) => {
    socket.broadcast.emit("timeup");
    socket.emit("timeup");
    clearInterval(timerInterval);
    state = "playing";
    choix = [0, 0];
  };

      // Check fin de video
  socket.on("video-is-finished", (question) => {
    globalQuestion = question;
    state = 'voting';
    socket.broadcast.emit("video-is-finished", {question:question, passed :0});
    setTimeout(timeIsFinished, 20000);
    timePassed = 0.2;

    timerInterval = setInterval(() => {
      timePassed += .1;
  }, 100);
  });

    // Envoie nombre de choix
    socket.on("choix", (selection) => {
      choix[selection]++;
      socket.broadcast.emit("envoi-choix", choix);
      socket.emit("envoi-choix", choix);
    });

    if(state == "playing"){
      socket.emit('startMovie');
    } else if(state == "voting") {
      socket.emit("video-is-finished", {question:globalQuestion, passed :timePassed});
    }


    socket.emit('connected', {ID :socket.sessionID, username : socket.username});
    
    // UPDATE la liste sur l'admin
    if(socket.admin){
      socket.emit("updateUsers", {USERS : USERS});
    } else {
      socket.in('admin').emit("updateUsers", {USERS : USERS});
    }

 
    // notify users upon disconnection
    socket.on("disconnect", async () => {
        const matchingSockets = await io.in(socket.userID).allSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected && socket.userID !="admin") {
            // notify other users
            console.log(socket.userID, "disconnected");    
            console.log(USERS);
            USERS[socket.index].connected = false;
           // socket.broadcast.emit("user disconnected", socket.userID);
           socket.to('admin').emit("updateUsers", {USERS : USERS});
        }
    });
});
