

//Variable Socket pour les commandes socket.io
const URL = window.location.hostname;

//const URL = "192.168.1.44:5000";
const socket = io(URL, { autoConnect: false });


// Variables Page Username
var $usernameSelection = $(".home-mobile-content");
var $usernameInput = $(".usernameInput");
var $buttonReady = $(".buttonReady");
var $minmax = $(".minMax");

// Variables Page Waiting
var $waitingPage = $('.waiting');
var $iAmReady = $(".iAmReady");

// Variables Page Choix
var $choixPage = $('.page-choix-content');
var $buttonA = $(".buttonA");
var $buttonB = $(".buttonB");
var $question = $(".question");
var $totalA = $(".totalA");
var $totalB = $(".totalB");
var $timerRond = $('.timerRond');

// Variables Page Credits
var $creditsPage = $('.credits');

// Variables Page Results
var $results = $('.results');


var myIndex = -1;
var nbrQuestion = 0;
var questions = [
    {
        txt_choixA: "Désarmer l'homme",
        txt_choixB: "Faire confiance à Alice"
    },
    {
        txt_choixA: "S'enfuir par la fenêtre",
        txt_choixB: "Ouvrir la porte"
    },
    {
        txt_choixA: "Se défendre",
        txt_choixB: "La supplier d'arrêter"
    }
];


function showReady() {
    $usernameSelection.hide();
    $waitingPage.show();
    $iAmReady.show();
}

socket.on('startMovie', () => {
    console.log('start');
    $usernameSelection.hide();
    $iAmReady.hide();
    $waitingPage.show();

});

// Afficher les boutons en fin de vidéo
socket.on('video-is-finished', (data) => {
    console.log('caca');

    nbrQuestion = data.question;

    $timerRond.show();
    $waitingPage.hide();
    $choixPage.show();
    $buttonA.show();
    $buttonB.show();
    $buttonA.html(questions[nbrQuestion].txt_choixA);
    $buttonB.html(questions[nbrQuestion].txt_choixB);
    $totalA.hide();
    $totalB.hide();
    $question.show();
    $usernameSelection.hide();

    if (data.voted >= 0) {
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

    const TIME_LIMIT = 19;
    let timePassed = data.passed;
    let timeLeft = TIME_LIMIT - timePassed;
    let timerInterval = null;
    let remainingPathColor = COLOR_CODES.info.color;


    function updateTimer(passed) {
        timeLeft = TIME_LIMIT - passed;
        timePassed = passed;
        document.getElementById("base-timer-label").innerHTML = formatTime(
            timeLeft
        );
        setCircleDasharray();
        setRemainingPathColor(timeLeft);
    }

    updateTimer(timePassed);


    socket.on('timeUpdate', (data) => {
        console.log(data.timePassed);
        updateTimer(data.timePassed);
    });

    function formatTime(time) {
        let seconds = Math.round(time);
        return `${seconds}`;
    }

    function setRemainingPathColor(timeLeft) {
        const { alert, warning, info } = COLOR_CODES;
        if (timeLeft > warning.threshold) {
            document
                .getElementById("base-timer-path-remaining")
                .classList.remove(alert.color);
        } else if (timeLeft <= alert.threshold) {
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
        return rawTimeFraction = (timeLeft - 1) / (TIME_LIMIT + 1);
    }

    function setCircleDasharray() {
        const circleDasharray = `${(
            calculateTimeFraction() * FULL_DASH_ARRAY
        ).toFixed(1)} 283`;
        document
            .getElementById("base-timer-path-remaining")
            .setAttribute("stroke-dasharray", circleDasharray);
    }
});



// Quand tu click sur un bouton, il efface les boutons
function quandTuVotes() {
    $buttonA.hide();
    $buttonB.hide();
    $totalA.show();
    $totalB.show();
    console.log('VOTE');
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
socket.on('envoi-choix', (data) => {
    choixA = (data[0] / (data[0] + data[1])) * 100;
    choixB = (data[1] / (data[0] + data[1])) * 100;
    console.log('choix A : ' + choixA);
    console.log('choix B : ' + choixB);

    if (choixA > choixB) {
        $totalA.html(questions[nbrQuestion].txt_choixA + ' <br> <span class="totalHigh">' + Math.round(choixA) + "% </span>");
        $totalB.html(questions[nbrQuestion].txt_choixB + ' <br> ' + Math.round(choixB) + "%");
    } else if (choixB > choixA) {
        $totalA.html(questions[nbrQuestion].txt_choixA + ' <br> ' + Math.round(choixA) + "%");
        $totalB.html(questions[nbrQuestion].txt_choixB + ' <br> <span class="totalHigh">' + Math.round(choixB) + "% </span>");
    } else {
        $totalA.html(questions[nbrQuestion].txt_choixA + ' <br> ' + Math.round(choixA) + "%");
        $totalB.html(questions[nbrQuestion].txt_choixB + ' <br> ' + Math.round(choixB) + "%");
    }
});


// Quand time is over, on retire TOUT
socket.on('timeup', () => {
    console.log("Le temps est écoulé");
    $choixPage.hide();
    $timerRond.hide();
    $waitingPage.show();
    $iAmReady.hide();
    document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", 283);
    document.getElementById("base-timer-path-remaining").classList.remove('red');
});



/// QUAND C'est la fin
socket.on('FIN', (data) => {

    $waitingPage.hide();
    $creditsPage.hide();
    $results.show();

    if (myIndex == -1) myIndex = data.index;
    const results = data.results;
    const choix = data.USERS[myIndex].choix;

    var decisions = [["de désarmer l'homme", "de faire confiance à Alice"],
    ["de t'enfuir par la fenêtre", "d'ouvrir la porte"],
    ["de te défendre", "de la supplier d'arrêter"]];
    var text = "";

    for (var i = 0; i < 3; i++) {
        let choi = choix[i];
        let result = results[i];

        if (choi === null || choi === "null" || choi == undefined) {
            text += "<p class='typo' style='opacity:.4'> Tu n'as pas pris de décision, lâche </p><br>";
        } else {
            text += "<p class='typo' style='opacity:";
            if (choi == result) {
                text += "1'>";
            } else {
                text += ".4'>";
            }
            text += "Tu as choisi " + decisions[i][choi] + "</p><br>";
        }
        $results.html(text);
    }
});



socket.on("credits", (data) => {

    let results = data.results;
    let tri = data.tri;

    $waitingPage.hide();

    const Remerciements = [$('.totalDecisif'), $('.totalPartiel'), $('.totalMauvais'), $('.totalNull')];
    const $titles = [$('.totalDecisifTitle'), $('.totalPartielTitle'), $('.totalMauvaisTitle'), $('.totalNullTitle')];
    tri.forEach((place, i) => {
        place.forEach((username, j) => {
            Remerciements[i].append("<p class='typo'>" + noHack(username) + '</p>');
        });
        if (place.length == 0) $titles[i].hide();
    });
    $creditsPage.show();

    $creditsCont = $('.creditsCont');
    $creditsCont.css({ scrollTop: $creditsCont.height() });

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
        socket.auth = { sessionID };
        socket.connect();
    } else {
        $usernameSelection.show();

        //caca({index : 0, results:[1,0,0], USERS:[{choix:[0,0,0]}] });
        //caca({results:[1,0,1],tri:[[],["Patrick Bruel","Henry","Générique","Dirk Desmadryl","Fabien Olicard","Pignon de Pin","poijonjkgvbxck","WWWWWWWWWWWWWWWW","DownToEarth0609","Pumba","Phillipe Catherine"],["Thomas","Ta mère","Christian Clavier"],["Alain","Nathan Herrman", "Lilo et Stitch"]]});
    }


}

$(".form").submit(function (e) {
    e.preventDefault();
    var $username = $usernameInput.val();
    if ($username.length < 2 || $username.length > 16) {
        $minmax.css({ opacity: .5 });
    } else {
        username = $username;
        socket.auth = { username };
        socket.connect();
        $waitingPage.show();
    }
    console.log($username);
});

socket.on('error', () => {
    console.log('error');
    $usernameSelection.show();
});




document.addEventListener("DOMContentLoaded", init);

function noHack(html) {
    return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
