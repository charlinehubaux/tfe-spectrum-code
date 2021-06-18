
    
    //Variable Socket pour les commandes socket.io
    //const URL = "http://localhost";
    
    const URL = "192.168.1.44:5000";
    const socket = io(URL,{autoConnect: false });


    // Variables d'elements HTML
    var $buttonReady = $(".buttonReady"); 
    var $usernameInput = $(".usernameInput");
    var $iAmReady = $(".iAmReady");
    var $results = $('.results');
    var $titre = $('.titre');

    var $buttonA = $(".buttonA");
    var $buttonB = $(".buttonB");
    var $question = $(".question");
    var $totalA = $(".totalA");
    var $totalB = $(".totalB");
  //  var $timerTxt = $('.timer');
    var $timerRond = $('.timerRond');
    var $waiting = $('.waiting');
    var $connected = $('.connected');

    // PAGES
    var $usernameSelection = $(".home-mobile-content");
    var $choixPage = $('.page-choix-content');
    var $waitingPage = $('.waiting');
    var $creditsPage = $('.credits');


   // var timer;
   // var time = 20;

    var nbrReady = 0;
    var myIndex;

    var nbrQuestion = 0;
    var questions = [
                    {   txt_choixA : "Désarmer l'homme",
                        txt_choixB : "Sauver Alice" },
                    {   txt_choixA : "Ouvrir la porte",
                        txt_choixB : "S'enfuir par la fenêtre"},
                    {   txt_choixA : "La supplier d'arrêter",
                        txt_choixB : "Se défendre"}
                    ];


    //socket.emit('connected');            
    $iAmReady.hide();
    $buttonA.hide();
    $buttonB.hide();
    $question.hide();
    //$waiting.hide();
    $totalA.hide();
    $totalB.hide();
    $results.hide();
    $creditsPage.hide();
    $waiting.hide();
   // $timerRond.hide();

    
   function showReady(){
       $usernameInput.hide();
       $buttonReady.hide();
       $iAmReady.show();
   }



    

   socket.on('startMovie', ()=> {
    $usernameSelection.hide();
    $waiting.show();
   });
  
    // Afficher les boutons en fin de vidéo
    socket.on('video-is-finished', (data) => {
        nbrQuestion = data.question;
        
        
        console.log('timeToVote');

        $usernameSelection.hide();
        $waiting.hide();
        $iAmReady.hide();
        $connected.hide();
        $buttonA.show();
        $buttonB.show();
        $buttonA.html(questions[nbrQuestion].txt_choixA);
        $buttonB.html(questions[nbrQuestion].txt_choixB);
        $question.show();
        $timerRond.show();
     
        if(data.voted >= 0){
         console.log('déjà voté');
            quandTuVotes();
        }

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
        let timePassed = data.passed;
        let timeLeft = TIME_LIMIT - timePassed;
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

        document.getElementById("base-timer-label").innerHTML = formatTime(
            timeLeft
            );
        setCircleDasharray();
        setRemainingPathColor(timeLeft);

        startTimer();

        function onTimesUp() {
        clearInterval(timerInterval);
        }

        function startTimer() {
        timerInterval = setInterval(() => {
            timePassed += .1;
            timeLeft = TIME_LIMIT - timePassed;
            document.getElementById("base-timer-label").innerHTML = formatTime(
            timeLeft
            );
            setCircleDasharray();
            //setRemainingPathColor(timeLeft);
            if (timeLeft < 0.1) {
            onTimesUp();
            }
        }, 100);
        }

        function formatTime(time) {
        let seconds = Math.round(time);
        if (seconds < 10) {
            //seconds = `0${seconds}`;
        }
        return `${seconds}`;
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
        return rawTimeFraction = timeLeft / TIME_LIMIT;
        //return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
        }

        function setCircleDasharray() {
        const circleDasharray = `${(
            calculateTimeFraction() * FULL_DASH_ARRAY
        ).toFixed(1)} 283`;
        document
            .getElementById("base-timer-path-remaining")
            .setAttribute("stroke-dasharray", circleDasharray);
        }
        }
            
    );



    // Quand tu click sur un bouton, il efface les boutons
    function quandTuVotes(){
        $buttonA.hide();
        $buttonB.hide();
        $totalA.show();
        $totalB.show();
        //$timerRond.hide();
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



    /// QUAND C'est la fin
socket.on('FIN', (data)=>{

    $waiting.hide();
    console.log('FIN');
    $results.show();
    const results = data.results;
    const choix = data.USERS[myIndex].choix;

    var decisions = [   ["de désarmer le méchant","de sauver Alice"],
                        ["d'ouvrir la porte", "de t'enfuir par la fenêtre"],
                        ["de la supplier d'arrêter","de te défendre"]];
    var text="";

   for(var i=0; i<3;i++){
       let choi = choix[i];
       let result = results[i];
       
       if(choi ===null || choi ==="null" || choi==undefined){
        text+="<p style='opacity:.4'> Tu n'as pas pris de décision, lâche </p><br>"; 
       } else {
        text+="<p style='opacity:";
        if(choi == result){
        text+= "1'>";    
        } else {
        text+= ".4'>";     
        }
        text+= "Tu as choisi " + decisions[i][choi] + "</p><br>";
       }
    $results.html(text);   
    }
});



socket.on("credits", (data) => {

    let results = data.results;
    let tri = data.tri;
    console.log('credits Yeah');
    $usernameSelection.hide();
    $choixPage.hide();
    $waitingPage.hide();

    const Remerciements = [$('.totalDecisif'),$('.totalPartiel'),$('.totalMauvais'), $('.totalNull') ];
    tri.forEach((place, i) => {
        place.forEach((username,j) => {
            Remerciements[i].append("<p class='typo'>"+ noHack(username) +'<p>');
        });
    if(place.length ==0) Remerciements[i].html('');    
    });
    $creditsPage.show();

});



socket.on("connected", (data) => {
    localStorage.setItem("sessionID", data.ID);
    myUsername = data.username;
    myIndex = data.index;
    console.log("Tu es bien connecté. Bienvenue ", data.username);
    showReady();
});


// Si le serveur redémarre on recommence TOUT
socket.on("disconnect", () => {
    window.location.reload(true);
});

// INITIALIZATION ON CONNECTION
function init() {
    let users = [];
    let usernameAlreadySelected = false;
    let connected = false;
    const sessionID = localStorage.getItem("sessionID");
    console.log("My local storage session id", sessionID);
    if (sessionID) {
        localStorage.removeItem("sessionID");
        // socket.auth, c'est les données échangée lors de la poignée de main initiale
        socket.auth = {sessionID};
        socket.connect();
    } else {

    }
}

$(".form").submit(function(e){
    e.preventDefault();
    var $username = $usernameInput.val();
        if($username.length <2 || $username.length >16){
            console.log("trop petit ou trop grand");
        } else {
            username = $username;
            socket.auth = {username};
            socket.connect();
            $waiting.show();
            $titre.hide();

        }
        console.log($username);
  });


document.addEventListener("DOMContentLoaded", init);

function noHack(html){
    return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
