function getAuthURL(target){
    if(target === "gd") {
        let url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        let params = {
            client_id: "805095245840-9l20ad91leq7bjsmk2fe1ofgd3hodp6i.apps.googleusercontent.com",
            redirect_uri: "http://localhost:3000/linking?target=gd",
            response_type: "code",
            scope: "https://www.googleapis.com/auth/contacts.readonly " +
                "https://www.googleapis.com/auth/drive.appdata " +
                "https://www.googleapis.com/auth/drive.file",
            access_type: "offline",
            prompt: "consent",
            state: "123456",
        };
        url.search = new URLSearchParams(params);
        //fetch(url).then(response=>response.json()).then(data => console.log(data));
        let red = document.createElement('a');
        red.href = url.toString();
        red.innerText = "Auth";

        return red;
    }
    if(target === "od"){
        let url = new URL("https://login.live.com/oauth20_authorize.srf");
        let params = {
            client_id:"b729bdbc-6fad-4071-811d-bc8b3e63f41e",
            redirect_uri:"http://localhost:3000/linking",
            response_type:"code",
            prompt: "select_account",
            scope:"User.Read " +
                "Files.ReadWrite " +
                "offline_access"
        };
        url.search = new URLSearchParams(params);
        //fetch(url).then(response=>response.json()).then(data => console.log(data));
        let red = document.createElement('a');
        red.href = url.toString();
        red.innerText = "Auth";

        return red.href;
    }
}

function redirect(target) {
    window.location.href = getAuthURL(target);
}

function getQueryVariable(variable)
{
    let query = window.location.search.substring(1);
    let vars = query.split("&");
    for (let varr of vars) {
        let pair = varr.split("=");
        if(pair[0] === variable){return pair[1];}
    }
    return false;
}

function addInput(){
    let target = getQueryVariable("target")||"od";
    let code = getQueryVariable("code");

    console.log("target: " + target);
    console.log("code: " + code);

    if(target&&code){
        if(target === "gd"){
            let input = document.getElementById("code1");
            console.log(input);
            input.value = code;
        }
        if(target === "od"){
            let input = document.getElementById("code3");
            input.value = code;
        }
    }
}

setTimeout(addInput(),100);
