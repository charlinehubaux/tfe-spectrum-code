// ---------- ICI C'EST CE QUI SE PASSE AU NIVEAU DU SERVEUR ----------


// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;

server.listen(port,"0.0.0.0");

// Routing
app.use(express.static(path.join(__dirname, '')));




// Instanciation des variables
var nbrConnected = 0;
var nbrReady = 0;
var choix=[0,0];


// LANCEMENT DES EVENTS QUAND QUELQU'UN SE CONNECTE
io.on('connection', (socket) => {
 
  var pushed = false; // Si bouton appuyé
  var Sadmin = false; // Si admin ou pas
  nbrConnected++;


  // Check si la personne est l'admin
  socket.on('admin', () => {
    nbrConnected--;
    Sadmin= true;
  }); 


  // Lit si nouvelle personne connectée
  socket.on('connected', () => {
    socket.broadcast.emit('connected', nbrConnected);
  });


  //création de la fonction de READY
  socket.on('ready', (data) => {
    nbrReady++;
    //Envoyer sur le serveur, les datas qu'on a défini en appelant la fonction
    // entre crochets, création d'objets,.. tu peux envoyer pleins de données différentes, dans un même "message"
    pushed = true;
    socket.broadcast.emit('sendReady',nbrReady);
  });

  

  // Check si la personne se déconnecte
  socket.on('disconnect', () => { 
    //console.log(Sadmin);
    if(!Sadmin){
      nbrConnected--;
      if(pushed){
        nbrReady--;
        socket.broadcast.emit('sendReady',nbrReady);
      }
    
    } else {    
    console.log('JE SUIS UN ADMIN !!!');
    }
    socket.broadcast.emit('disconnected', nbrConnected);
  });


  // Quand bouton Start est appuyé
  socket.on('start', () => {
    socket.broadcast.emit('start');
  });


  // Ce qu'il fait quand le temps est fini
  const timeIsFinished = (data) => {
    socket.broadcast.emit('timeup');
    socket.emit('timeup');
    choix = [0,0];
  }


  // Check fin de video
  socket.on('video-is-finished', (question)=>{
    socket.broadcast.emit('video-is-finished', question);
    setTimeout(timeIsFinished, 13000);
  });


  // Envoie nombre de choix
  socket.on("choix", (selection) =>{
   choix[selection]++;
   socket.broadcast.emit('envoi-choix', choix);
   socket.emit('envoi-choix', choix);
  });


});
