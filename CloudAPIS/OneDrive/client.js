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

/*
GET https://login.live.com/oauth20_authorize.srf?client_id={client_id}&scope={scope}
  &response_type=code&redirect_uri={redirect_uri}
 */
function getAuthURL(){
    let url = new URL("https://login.live.com/oauth20_authorize.srf");
    let params = {
        client_id:"b729bdbc-6fad-4071-811d-bc8b3e63f41e",
        redirect_uri:"http://localhost:3000/auth/od",
        response_type:"code",
        scope:"User.Read " +
            "Files.ReadWrite " +
            "offline_access"
        };
    url.search = new URLSearchParams(params);
    //fetch(url).then(response=>response.json()).then(data => console.log(data));
    let red = document.createElement('a');
    red.href = url.toString();
    red.innerText = "Auth";

    return red;

}
