$(function() {

    //Variable Socket pour les commandes socket.io
    var socket = io();

    // Variables d'elements HTML
    var $bienvenue = $(".bienvenue");
    var $generique = $(".generique");
    const $troncPlayer = $(".tronc-player");
    const $troncSource = $("#tronc-video-source");
    const $timerPlayer = $(".timer-player");
    const $timerSource = $("#timer-video-source");
    const $choixPlayer = $(".choix-player");
    const $choixSource = $("#choix-video-source");

    // Cache les lecteurs vidéos au début
    $generique.hide();
    $troncPlayer.hide();
    $timerPlayer.hide();
    $choixPlayer.hide();
    $timerPlayer.css( "zIndex", 1);
    $troncPlayer.css( "zIndex", 2 );
    $choixPlayer.css( "zIndex", 3 );

    // Tableau de toutes les vidéos à lancer, triées
    var videos = [
        ["src/videos/T1.mp4" ,  "src/videos/T2.mp4",    "src/videos/T3.mp4"],
        ["src/videos/A1.mp4",   "src/videos/A2.mp4"],
        ["src/videos/B1A1.mp4", "src/videos/B1A2.mp4",  "src/videos/B2A1.mp4",  "src/videos/B2A2.mp4"],
        ["src/videos/F1.mp4",   "src/videos/F2.mp4",    "src/videos/F3.mp4"],
        ["src/videos/timer.mp4", "src/videos/timer.mp4", "src/videos/timer.mp4"]
    ]; 

    // Choix par défauts (si égalité ou si aucun vote)
    var resultVote = [0,1,1];
    var question = -1;

    socket.emit('admin');

function final()
{
    $troncPlayer.hide();
    $timerPlayer.hide();
    $choixPlayer.hide();
    $generique.show();
}

    // La toute première fois, on lance la vidéo T1
    socket.on('start', (data) => {
        $bienvenue.hide();
        $timerPlayer.show();
        $troncPlayer.show(); 
        $troncSource.attr("src", videos[0][0]);
        $troncPlayer.on('ended',onTroncEnded);
        $troncPlayer.load();
        $timerSource.attr("src", videos[4][0]);
        $timerPlayer.on('ended',onTimerEnded);
        $timerPlayer.load();
        $troncPlayer.trigger('play');
    });
    

    // Fonction pour lire les vidéos choix suivies des vidéos troncs communs
    function launchVideo(src){


        // Change l'attribut src par la bonne source
        $choixSource.attr("src", src);
        $choixPlayer.on('ended',onVideoEnded);

        // On charge, montre et lance la vidéo
        $choixPlayer.css( "zIndex", 0 );
        $choixPlayer.show();
        $choixPlayer.load();


        if(question < 2){
        setTimeout(function(){
            $troncPlayer.css( "zIndex", -1 );
            $troncPlayer.show();
            $troncSource.attr("src", videos[0][question+1]);
            $troncPlayer.on('ended',onTroncEnded);
            $troncPlayer.load();
        },2500);}
    }


    // Quand la vidéo d'un choix finit, il la cache et lance le prochain tronc
    function onVideoEnded() {
        $choixPlayer.unbind('ended');
        $choixPlayer.hide();
        
        if(question < 2){
            $troncPlayer.trigger('play');
            $troncPlayer.css( "zIndex", 2 );

            setTimeout(function(){
                $timerSource.attr("src", videos[4][0]);
                $timerPlayer.on('ended',onTimerEnded);
                $timerPlayer.show();
                $timerPlayer.load();
            },1000);

        } else final();

        
    }
    


    // Quand le tronc finit, on l'envoie au serveur
    function onTroncEnded(){
        $troncPlayer.unbind('ended');
        // Va chercher question d'après
        question++;
        socket.emit("video-is-finished", question);

        $timerPlayer.trigger('play');

        $troncPlayer.hide();
 
    }

    // Quand le timer finit, on l'envoie au serveur
    function onTimerEnded(){
        $timerPlayer.unbind('ended');
        $choixPlayer.trigger('play');
        $timerPlayer.hide();
        $choixPlayer.css( "zIndex", 2 );
    }
    


    // Va chercher le plus au % à un choix pour le lancer
    socket.on('envoi-choix', (data) => {
        if(data[0] > data[1]){
            resultVote[question] = 0;
        } else if(data[0] < data[1]){
            resultVote[question] = 1;
        }
    });


    socket.on('timeup', () =>{
        // Instancie var pour chercher vidéo dans la bonne colonne du tableau à double entrée
        var column;
        console.log(resultVote);

        switch(question){
            // Pour la question A
            case 0:
                column = resultVote[0];
            break;

            // Pour la question B
            case 1:
                // S'ils ont choisi B1
                if(resultVote[1] == 0)
                {
                    // S'ils avaient choisi A1
                    if(resultVote[0] == 0) column = 0;
                    // S'ils avaient choisi A2
                    else column = 1;
                // S'ils ont choisi B2
                } else {
                    // S'ils avaient choisi A1
                    if(resultVote[0] == 0) column = 2;
                    // S'ils avaient choisi A2
                    else column = 3;
                }
            break;

            // Pour la question C
            case 2:
                // S'ils ont choisi C1
                if(resultVote[2] == 0)
                {
                    // S'ils avaient choisi A1
                    if(resultVote[0] == 0) column = 1;
                    // S'ils avaient choisi A2
                    else column = 0;
                // S'ils ont choisi C2
                } else {
                    // S'ils avaient choisi B1
                    if(resultVote[1] == 0) column = 1;
                    // S'ils avaient choisi B2
                    else column = 2;
                }
            break;
        }
        // Lance la vidéo correspondante au choix du dessus
        launchVideo(videos[question +1][column]);
    });



  });