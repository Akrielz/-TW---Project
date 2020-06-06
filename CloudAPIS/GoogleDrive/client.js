/*function doSomething(){
    let url = new URL('http://localhost:1289/blabla');
    let params = {
        name:"stefy",
        month:"feb",
        year:"2000"
    };
    url.search = new URLSearchParams(params);
    console.log(url.toString());
    fetch(url).then(response=>{return response.json()}).then(data => console.log(data));
}

async function cors() {
    let url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    let response = await fetch(url,{
        method:'OPTIONS',
        headers:{
            'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'Content-Type,API-Key'
        }
    });
    console.log(response.json());
}*/

function getAuthURL(){
    let url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    let params = {
        client_id:"805095245840-9l20ad91leq7bjsmk2fe1ofgd3hodp6i.apps.googleusercontent.com",
        redirect_uri:"http://localhost:3000/auth/gd",
        response_type:"code",
        scope:"https://www.googleapis.com/auth/contacts.readonly " +
            "https://www.googleapis.com/auth/drive.appdata " +
            "https://www.googleapis.com/auth/drive.file",
        access_type:"offline",
        state:"123456",
    };
    url.search = new URLSearchParams(params);
    //fetch(url).then(response=>response.json()).then(data => console.log(data));
    let red = document.createElement('a');
    red.href = url.toString();
    red.innerText = "Auth";

    return red;

}
