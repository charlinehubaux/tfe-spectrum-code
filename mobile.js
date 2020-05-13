$(function() {

    //Variable Socket pour les commandes socket.io
    var socket = io();

    // Variables d'elements HTML
    var $buttonReady = $(".buttonReady");
    var $iAmReady = $(".iAmReady");
    var $messages = $('.messages');
    var $buttonA = $(".buttonA");
    var $buttonB = $(".buttonB");
    var $question = $(".question");
    var $totalA = $(".totalA");
    var $totalB = $(".totalB");

    var nbrReady = 0;

    var nbrQuestion = 0;
    var questions = [
                    {   txt_choixA : "Désarmer l'homme",
                        txt_choixB : "Sauver Alice" },
                    {   txt_choixA : "Ouvrir la porte",
                        txt_choixB : "S'enfuir par la fenêtre"},
                    {   txt_choixA : "La supplier d'arrêter",
                        txt_choixB : "Se défendre"}
                    ];


    socket.emit('connected');

    $iAmReady.hide();
    $buttonA.hide();
    $buttonB.hide();
    $question.hide();
    
    

    // Quand on clique sur le bouton
    $buttonReady.click(() => {
        // On emit ('le nom de la fonction ON', 'les datas à utiliser')
        socket.emit('ready', "READY !");
        $buttonReady.hide();
        $iAmReady.show();
    });

    
    // Aller chercher les nouvelles données sur le serveur
    socket.on('ready', (data) => {
        var $newMessage = $('<span class="messageBody">').text("Une Personne est prête!");
        $messages.append($newMessage);
        $messages.append("<br>");

        nbrReady++;
        console.log(nbrReady);
    });
  
    // Afficher les boutons en fin de vidéo
    socket.on('video-is-finished', (data) => {
        nbrQuestion = data;
        $iAmReady.hide();
        $buttonA.show();
        $buttonB.show();
        $buttonA.html(questions[nbrQuestion].txt_choixA);
        $buttonB.html(questions[nbrQuestion].txt_choixB);
        $question.show();
    });

    // Quand tu click sur un bouton, il efface les boutons
    function quandTuVotes(){
        $buttonA.hide();
        $buttonB.hide();
    }

    // Si tu clique sur le choix A
    $buttonA.click(() => {
        socket.emit('choix', 0);
        quandTuVotes();
    });

    // Si tu clique sur le choix B
    $buttonB.click(() => {
        socket.emit('choix', 1);
        quandTuVotes();
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


    // Quand time is over, on retire TOUT
    socket.on('timeup', () =>{
        console.log("Le temps est écoulé");
        $buttonA.hide();
        $buttonB.hide();
        $question.hide();
        $totalA.hide();
        $totalB.hide();
    });



  });