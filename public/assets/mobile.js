

    //Variable Socket pour les commandes socket.io
    //const URL = "http://localhost";
    
    const URL = "192.168.1.44:5000";
    const socket = io(URL,{autoConnect: false });

   
    function init() {
        let users = [];
        let usernameAlreadySelected = false;
        let connected = false;
        const sessionID = localStorage.getItem("sessionID");
        const username = "Thomas";
        console.log("My local storage session id", sessionID);
        if (sessionID) {
          localStorage.removeItem("sessionID");
          // socket.auth, c'est les données échangée lors de la poignée de main initiale
          socket.auth = { sessionID, username };
          socket.connect();
        } else {
          socket.connect();
          //showUsernamePicker();
    }
}


socket.on("yeah", (data) => {
    localStorage.setItem("sessionID", data.ID);
    console.log("Mon nom est :", data.username);
    console.log("Mon ID est :", data.ID);
});


    document.addEventListener("DOMContentLoaded", init);



/*
    // Variables d'elements HTML
    var $buttonReady = $(".buttonReady");
    var $titre = $(".titre");
    var $iAmReady = $(".iAmReady");
    var $messages = $('.messages');
    var $buttonA = $(".buttonA");
    var $buttonB = $(".buttonB");
    var $question = $(".question");
    var $totalA = $(".totalA");
    var $totalB = $(".totalB");
  //  var $timerTxt = $('.timer');
    var $timerRond = $('.timerRond');
    var $waiting = $('.waiting');
    var $connected = $('.connected');

  //  var timer;
   // var time = 20;

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
    $waiting.hide();
    $totalA.hide();
    $totalB.hide();
    $timerRond.hide();

    
    

    // Quand on clique sur le bouton
    $buttonReady.click(() => {
        // On emit ('le nom de la fonction ON', 'les datas à utiliser')
        socket.emit('ready', "READY !");
        $buttonReady.hide();
        $titre.hide();
        $waiting.show();
        $connected.show

        socket.on('connected', (data) => {
            $connected.html(data);
        });
    
        socket.on('disconnected', (data) => {
            $connected.html(data);
        });

      document.getElementById("app").style.animationPlayState = "paused"; 
    
    });

    
    // Aller chercher les nouvelles données sur le serveur
    socket.on('ready', (data) => {
        var $newMessage = $('<span class="messageBody">').text("Une Personne est prête!");
        $messages.append($newMessage);
        $messages.append("<br>");

        nbrReady++;
        console.log(nbrReady);

    });

    socket.on('sendReady', (data)=> {
        $connected.html("Il y a " + data + " personne(s) connectée(s)");
    });
  
    // Afficher les boutons en fin de vidéo
    socket.on('video-is-finished', (data) => {
        nbrQuestion = data;
        $waiting.hide();
        $iAmReady.hide();
        $connected.hide();
        $buttonA.show();
        $buttonB.show();
        $buttonA.html(questions[nbrQuestion].txt_choixA);
        $buttonB.html(questions[nbrQuestion].txt_choixB);
        $question.show();

        $timerRond.show();
     

    ///////// Animation du timer ///////

       // Credit: Mateusz Rybczonec

        const FULL_DASH_ARRAY = 283;
        const WARNING_THRESHOLD = 10;
        const ALERT_THRESHOLD = 5;

        const COLOR_CODES = {
        info: {
            color: "green"
        },
        warning: {
            color: "orange",
            threshold: WARNING_THRESHOLD
        },
        alert: {
            color: "red",
            threshold: ALERT_THRESHOLD
        }
        };

        const TIME_LIMIT = 20;
        let timePassed = 0;
        let timeLeft = TIME_LIMIT;
        let timerInterval = null;
        let remainingPathColor = COLOR_CODES.info.color;

        document.getElementById("app").innerHTML = `
        <div class="base-timer">
        <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <g class="base-timer__circle">
            <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
            <path
                id="base-timer-path-remaining"
                stroke-dasharray="283"
                class="base-timer__path-remaining ${remainingPathColor}"
                d="
                M 50, 50
                m -45, 0
                a 45,45 0 1,0 90,0
                a 45,45 0 1,0 -90,0
                "
            ></path>
            </g>
        </svg>
        <span id="base-timer-label" class="base-timer__label">${formatTime(
            timeLeft
        )}</span>
        </div>
        `;

        startTimer();

        function onTimesUp() {
        clearInterval(timerInterval);
        }

        function startTimer() {
        timerInterval = setInterval(() => {
            timePassed = timePassed += 1;
            timeLeft = TIME_LIMIT - timePassed;
            document.getElementById("base-timer-label").innerHTML = formatTime(
            timeLeft
            );
            setCircleDasharray();
            setRemainingPathColor(timeLeft);

            if (timeLeft === 0) {
            onTimesUp();
            }
        }, 1000);
        }

        function formatTime(time) {
        const minutes = Math.floor(time / 60);
        let seconds = time % 60;

        if (seconds < 10) {
            seconds = `0${seconds}`;
        }

        return `${minutes}:${seconds}`;
        }

        function setRemainingPathColor(timeLeft) {
        const { alert, warning, info } = COLOR_CODES;
        if (timeLeft <= alert.threshold) {
            document
            .getElementById("base-timer-path-remaining")
            .classList.remove(warning.color);
            document
            .getElementById("base-timer-path-remaining")
            .classList.add(alert.color);
        } else if (timeLeft <= warning.threshold) {
            document
            .getElementById("base-timer-path-remaining")
            .classList.remove(info.color);
            document
            .getElementById("base-timer-path-remaining")
            .classList.add(warning.color);
        }
        }

        function calculateTimeFraction() {
        const rawTimeFraction = timeLeft / TIME_LIMIT;
        return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
        }

        function setCircleDasharray() {
        const circleDasharray = `${(
            calculateTimeFraction() * FULL_DASH_ARRAY
        ).toFixed(0)} 283`;
        document
            .getElementById("base-timer-path-remaining")
            .setAttribute("stroke-dasharray", circleDasharray);
        }
            });







    // Quand tu click sur un bouton, il efface les boutons
    function quandTuVotes(){
        $buttonA.hide();
        $buttonB.hide();
        $totalA.show();
        $totalB.show();
        $timerRond.hide();
        $question.hide();
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
        $timerRond.hide();
        $waiting.show();
        $buttonA.hide();
        $buttonB.hide();
        $question.hide();
        $totalA.hide();
        $totalB.hide();

    });

*/


