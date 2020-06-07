APP_KEY = "guil0597ef4f5c3";
SECRET_KEY = "xt10z5r1i7rumdn";

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

async function getFromDatabase(){
    let userId = localStorage.getItem("stol_owner_id");

    let url = backAddress + userId + '/user/accounts';
    const response = await fetch(url);
    const myJson = await response.json();

    console.log(myJson);

    let accounts = myJson.accounts;
    for(let acc of accounts){
        if(acc.cloud === "gd") disable(1);
        if(acc.cloud === "db") disable(2);
        if(acc.cloud === "od") disable(3);
    }
}

function disable(index){
    let input = document.getElementById('code' + index);
    let button = document.getElementById('button' + index);
    let text = document.getElementById("status" + index);

    input.disabled = true;

    button.disabled = true;
    button.style.backgroundColor = "rgb(44, 44, 44)";
    button.style.cursor = "context-menu";
    button.innerHTML = "Already Submited";

    text.innerHTML = "STATUS: LINKED";

}

async function sendAuth(code,target){
    let owner_id = localStorage.getItem("stol_owner_id");
    if(code.length < 10){alert("The code provided is not valid!");}
    let url = backAddress + owner_id + "/accounts";
    let body=JSON.stringify({
        "owner_id":owner_id,
        "access_code":code,
        "target":target
    });
    let options = {
        method:"POST",
        headers: {
            'Content-Type':'application/json'
        },
        body:body
    };
    let response = await fetch(url,options);
    if(response){
        document.location.reload();
    }else{
        alert("Something went wrong!");
    }
}

async function sendGD(){
    let code = document.getElementById('code1').value;
    await sendAuth(code, 'gd');
}

async function sendDB(){
    let code = document.getElementById('code2').value;
    await sendAuth(code, 'db');
}

async function sendOD(){
    let code = document.getElementById('code3').value;
    await sendAuth(code, 'od');
}
