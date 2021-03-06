$(function() {

    //Variable Socket pour les commandes socket.io
    const URL = window.location.hostname;
    
    //const URL = "192.168.1.44:5000";
    const socket = io(URL,{auth: {admin : true}});
   
     // Variables d'elements HTML
    var $ready = $('.ready');
    var $connected = $('.connected');
    var $users = $('.users');
    var $start = $('.start');
    var $totalA = $(".totalA");
    var $totalB = $(".totalB");

    $start.prop('disabled', true);


    socket.on('updateUsers', (data) => {
        const USERS = data.USERS;
        var liste ="";
        var readies = 0;
        $.each(USERS, function(index, user){
            if(user.connected){
                liste += "<li style='color:green'";
                readies ++;
            } else {
                liste += "<li style='color:red'"; 
            }
           liste += "class='adminUser'>" + noHack(user.username) + "  -  " + user.choix[0] + " - "+ user.choix[1] + " - "+ user.choix[2] + "</li>";
        });
        $ready.html(readies);
        $connected.html(USERS.length);
        $users.html(liste);
    });


    $start.click(() => {
        socket.emit('start');  
        console.log('start'); 
        $start.prop('disabled', true);  
        $start.html('Déjà en Lecture');
    });

    socket.on("clickVideo", ()=>{
        console.log('clicked');    
    $start.prop('disabled', false);
    $start.html('START THE TFE !!');
    });

    socket.on('videoDisconnected', () => {
        console.log('caca');
        window.location.reload(true);
    });

    socket.on('startMovie', () =>{
        console.log('already in Play');
        $start.prop('disabled', true);  
        $start.html('Déjà en Lecture');
    });

/*


    // Affichage % par choix
    socket.on('envoi-choix', (data)=>{
        choixA = (data[0] / (data[0] + data[1])) *100;
        choixB = (data[1] / (data[0] + data[1])) *100;
        console.log('choix A : ' + choixA);
        console.log('choix B : ' + choixB);

        $totalA.html('choix A : ' + Math.round(choixA) + "%");
        $totalB.html('choix B : ' + Math.round(choixB) + "%");
    });*/

    socket.on('disconnect', (data) => {
        window.location.reload(true);
    });
   


    function noHack(html){
        return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }


  });
 