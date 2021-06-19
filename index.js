// ---------- ICI C'EST CE QUI SE PASSE AU NIVEAU DU SERVEUR ----------

// Immport packages and setup some boilerplate
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { networkInterfaces } = require('os');
const { emit } = require('process');
//Create the express server
const app = express();
const server = require('http').createServer(app);
//Create the socket io server by passing a reference to the httpServer

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  },
});

const port = process.env.PORT || 5000;
app.use(cors());
server.listen(port);

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Instanciation des variables
const randomId = () => crypto.randomBytes(8).toString('hex');
const nbrConnected = 0;
const nbrReady = 0;
const TIMER = 19;
var nbreChoix = 0;
var choix = [0, 0];

var USERS = [];
var state = 'waiting';
var globalQuestion = 0;
var timePassed = 0;
var timerInterval;
var triTotal = [[], [], [], []];
var results = [];
var videoClicked = false;


function createUser(socket, username){
  socket.username = username;
  socket.sessionID = randomId();
  socket.userID = socket.sessionID;
  USERS.push({
    ID: socket.sessionID,
    username: socket.username,
    connected: true,
    choix: [],
  });

  socket.index = USERS.length - 1;
  socket.join(socket.userID);
  socket.join('users');
  console.log(USERS);
  return true;
}


// Observe si déjà une session avec ce use
io.use(async (socket, next) => {
  if (!socket.handshake.auth) {
    return next(new Error('invalid handshake'));
  }

  if (socket.handshake.auth.video) {
    console.log('video player connected');
    socket.sessionID = 'video';
    socket.username = 'video';
    socket.userID = 'video';
    socket.join('video');
    socket.video = true;
    return next();
  }

  if (socket.handshake.auth.admin) {
    console.log('Admin Connected');
    socket.sessionID = 'admin';
    socket.username = 'admin';
    socket.userID = 'admin';
    socket.admin = true;
    socket.join('admin');
    return next();
  }

  // Donnée passées en ligne 25 dans test.js
  const sessionID = socket.handshake.auth.sessionID;
  // const username = socket.handshake.auth.username;
  var __indexID = 0;

  if (sessionID) {
    socket.sessionID = sessionID;

    // Si Déjà ID, on cherche dans la DB
    var __indexID = USERS.findIndex(function (user, index) {
      if (user.ID == socket.sessionID) return true;
    });

    // S'il existe, on le mets connecté, et on lui redonne ses données
    if (__indexID != -1) {
      USERS[__indexID].connected = true;
      socket.index = __indexID;
      socket.sessionID = USERS[__indexID].ID;
      socket.username = USERS[__indexID].username;
      socket.userID = sessionID;
      socket.join(socket.userID);
      socket.join('users');
      return next();
    } else {
      socket.error = true;
      return next();
    } 
  }

  // Si le user existe pas, on le créé et l'ajoute à la db locale
  else {
    if (createUser(socket, socket.handshake.auth.username)) return next();
  }
});

/*io.on('connection', async (socket) => {
  if(ERROR){
    console.log('error');
    socket.emit('error');
  }
});*/

// CONNEXION EFFECTUEE, MAINTENANT ON S'AMUSE
io.on('connection', async (socket) => {
  
 
  socket.on('start', async () => {
    socket.broadcast.emit('startMovie');
    state = 'playing';
  });

  // Ce qu'il fait quand le temps est fini
  const timeIsFinished = (data) => {
    io.sockets.in('admin').emit('updateUsers', { USERS: USERS });
    io.sockets.in('users').emit('timeup');
    clearInterval(timerInterval);
    state = 'playing';
    nbreChoix++;
  }

  // Check fin de video
  socket.on('video-is-finished', (question) => {
    globalQuestion = question;
    state = 'voting';

    socket.broadcast.emit('video-is-finished', {
      question: question,
      passed: 0
    });

    choix = [0, 0];
    //setTimeout(timeIsFinished, TIMER);
    timePassed = 0;
    socket.broadcast.emit("timeUpdate", {timePassed :timePassed});
    timerInterval = setInterval(() => {
      timePassed += 1;
      socket.broadcast.emit("timeUpdate", {timePassed :timePassed});
      if(timePassed >=TIMER) timeIsFinished();
    }, 1000);

    setTimeout(() => {
      io.sockets.in('video').emit('envoi-choix', choix);
      io.sockets.in('video').emit('timeup');
    }, 19000);

  });

  // Envoie nombre de choix
  socket.on('choix', (selection) => {
    choix[selection]++;
    USERS[socket.index].choix[nbreChoix] = selection;
    socket.voted = true;
    io.sockets.in('users').emit('envoi-choix', choix);

    console.log(choix);
  });

  socket.on('credits', (data) => {
    console.log('credits Rolling');
    state = "credits";
    results = data.results;

    let userIndex = 0;

    USERS.forEach((user, userIndex) => {
      let points = 0;

      if (user.choix.length > 0) {
        let choixIndex = 0;
        user.choix.forEach((choi, choixIndex) => {
          if (choi == results[choixIndex]) {
            points++;
          }
          choixIndex++;
        });
      } else {
        points =-1;
      }
      console.log(user.choix.length);

      let tri = 3;

      if (points == 3) {
        tri = 0;
      } else if (points < 3 && points > 0) {
        tri = 1;
      } else if (points == 0) {
        tri = 2;
      }

      triTotal[tri].push(user.username);
      userIndex++;
    });
    socket.broadcast.emit("credits", {tri:triTotal, results:results});
  });

  if(socket.error){
    socket.emit('error');
    socket.disconnect();
    socket.error = false;
  } else {

  socket.emit('connected', {
    ID: socket.sessionID,
    username: socket.username,
    index: socket.index
  });

  if (state == 'playing') {
    socket.emit('startMovie');
  } else if (state == 'voting') {
    socket.emit('video-is-finished', {
      question: globalQuestion,
      passed: timePassed,
      voted: USERS[socket.index].choix[nbreChoix],
    });
    socket.emit('envoi-choix', choix);
  } else if(state=="credits"){
    socket.emit("credits", {tri:triTotal, results:results});
  } else if(state =="fin"){
    socket.emit('FIN', { USERS: USERS, results: results, index : socket.index });
  }
      
}

  socket.on('clickVideo', ()=>{
    io.sockets.in("admin").emit("clickVideo");
    videoClicked = true;
  });

  socket.on('FIN', () => {
    state="fin";
    socket.broadcast.emit('FIN', { USERS: USERS, results: results });
    console.log(USERS);
  });


  // UPDATE la liste sur l'admin
  if (socket.admin) {
    socket.emit('updateUsers', { USERS: USERS });
    if(videoClicked && state!="playing") io.sockets.in("admin").emit("clickVideo");
  } else {
    socket.in('admin').emit('updateUsers', { USERS: USERS });
  }

  // notify users upon disconnection
  socket.on('disconnect', async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected && socket.userID != 'admin' && socket.userID != "video") {
      // notify other users
      console.log(socket.userID, 'disconnected');
      console.log(USERS);
      USERS[socket.index].connected = false;
      // socket.broadcast.emit("user disconnected", socket.userID);
      io.sockets.in('admin').emit('updateUsers', { USERS: USERS });
    } else if(socket.userID == "video"){
      io.sockets.in('admin').emit('videoDisconnected');
      videoClicked = false;
    }
  });
});
