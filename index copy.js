/////////// ICI C'EST CE QUI SE PASSE AU NIVEAU DU SERVEUR


// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 8080;



server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, '')));




var nbrConnected = 0;
var nbrReady = 0;
var adminList = [];


// LANCEMENT DES EVENTS QUAND QUELQU'UN SE CONNECTE
io.on('connection', (socket) => {
 
  var pushed = false;
  var Sadmin = false;
  nbrConnected++;

  // Check si la personne est l'admin
  socket.on('admin', () => {
    adminList.push(socket.id);
    nbrConnected--;
    socket.broadcast
    Sadmin= true;
  }); 


  socket.on('connected', () => {
    socket.broadcast.emit('connected', nbrConnected);
  });


  //création de la fonction de READY
  socket.on('ready', (data) => {
    nbrReady++;
    //Envoyer sur le serveur, les datas qu'on a défini en appelant la fonction
    // entre crochets, cr&ation d'objets,.. tu peux envoyer pleins de données différentes, dans un même "message"
    pushed = true;
    socket.broadcast.emit('sendReady', {
      ready: nbrReady
    });
  });

  



  // Check si la personne se déconnecte
  socket.on('disconnect', () => { 
    var admin = false;

    //Checker la liste des admins
    for (var item = 0; item < adminList.length; item++) {
      if(socket.id == adminList[item])
      {
        admin = true;
        adminList.splice(item);
      }
    }
    //console.log(pushed);
    console.log(Sadmin);
    if(!admin)
    {
      nbrConnected--;
      if(pushed){
        nbrReady--;
        socket.broadcast.emit('sendReady', {
          ready: nbrReady
        });
      }
      

    } else {    
    console.log('JE SUIS UN ADMIN !!!');
    }
    socket.broadcast.emit('disconnected', nbrConnected);
  });

  socket.on('start', () => {
    socket.broadcast.emit('start');
  });

});