$(function() {

    //Variable Socket pour les commandes socket.io
    var socket = io();

    // Variables d'elements HTML
    var $ready = $('.ready');
    var $connected = $('.connected');
    var $start = $('.start');
    var $totalA = $(".totalA");
    var $totalB = $(".totalB");

    socket.emit('admin');

    
    // Aller chercher les nouvelles données sur le serveur
    socket.on('sendReady', (data) => {
        $ready.html(data);
    });

    socket.on('connected', (data) => {
        $connected.html(data);
        console.log("connecté");
    });

    socket.on('disconnected', (data) => {
        $connected.html(data);
        console.log("déconnecté");
    });


    $start.click(() => {
        socket.emit('start');  
        console.log('start');   
    });




    // Affichage % par choix
    socket.on('envoi-choix', (data)=>{
        choixA = (data[0] / (data[0] + data[1])) *100;
        choixB = (data[1] / (data[0] + data[1])) *100;
        console.log('choix A : ' + choixA);
        console.log('choix B : ' + choixB);

        $totalA.html('choix A : ' + Math.round(choixA) + "%");
        $totalB.html('choix B : ' + Math.round(choixB) + "%");
    });

    
  });
 