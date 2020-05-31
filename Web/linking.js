APP_KEY = "guil0597ef4f5c3";
SECRET_KEY = "xt10z5r1i7rumdn"

let accessToken = ["", "", ""];
let loggedIn = [false, false, false];

BASE64_START = 23;

function getAccess(){
    window.open( `https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&response_type=code`, 
        "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=0,width=1920,height=1080");
}

function getToken(){
    if (loggedIn[1]){
        return;
    }

    let textBox = document.getElementById("code2");

    fetch("https://api.dropboxapi.com/oauth2/token", {
        method : "POST",
        body: "code=" + textBox.value + "&grant_type=authorization_code",
        headers: {
            Authorization: "Basic Z3VpbDA1OTdlZjRmNWMzOnh0MTB6NXIxaTdydW1kbg==",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    .then(response => response.json()).then(data => {
        accessToken[1] = data.access_token;
        loggedIn[1] = true;

        let button = document.getElementById('button2');
        button.disabled = true;
        button.style.backgroundColor = "rgb(44, 44, 44)";
        button.style.cursor = "context-menu";
        button.innerHTML = "Already Submited";

        let text = document.getElementById("status2");
        text.innerHTML = "Status: Linked";
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}