const {Credentials} = require("./Credentials");

const HTTPS = require('https');
const queryString = require('querystring');
const REF = "1//09KNaGWAJW5pbCgYIARAAGAkSNwF-L9IrYH03SP4jgBR2eicUtif90ZjBOo0rjobe-2xv8MI3pGiqy-s2WA0qAKPKuF20zxRIOds";
const credentials = new Credentials();
setTimeout(()=>{
    if(credentials.clientId) console.log("Credentials read");
    else console.log("Error reading credentials");
},200);


class dataB{
    constructor(message) {
        this.message = message;
    }

    write(text){
        console.log(this.message + text);
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


//TODO: must be added to linking.html
async function getToken(access_code) {
    let database = new dataB("I am DATABASE: ");
    let form = {
        code: access_code,
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:1234/result",
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret
    };
    let formData = queryString.stringify(form);
    let data = "";
    let access = "";
    let refresh = "";
    let req = await HTTPS.request(
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": formData.length
            },
            hostname: "oauth2.googleapis.com",
            path: "/token",
            method: "POST",
            port: 443
        },
        res => {
            res.on('data', d => data += d);
            res.on('end', () => {
                console.log(data);
                access = JSON.parse(data)['access_token'];
                console.log(access);
                database.write(access);
                refresh = JSON.parse(data)['refresh_token'];
                console.log(refresh);
                database.write(refresh);
            });
        }
    );
    await req.write(formData);
    await req.end((data)=>{
        console.log("HERE IS MY DATA: " + data);
        console.log("ACCESS: " + access);
    });
    sleep(100);
    return access + "^^" + refresh;
}

async function refreshToken(refresh) {
    let database = new dataB("I am DATABASE: ");
    let form = {
        refresh_token: refresh,
        grant_type: "refresh_token",
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret
    };
    let formData = queryString.stringify(form);
    let data = "";
    let access = "";
    let req = await HTTPS.request(
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": formData.length
            },
            hostname: "oauth2.googleapis.com",
            path: "/token",
            method: "POST",
            port: 443
        },
        res => {
            res.on('data', d => data += d);
            res.on('end', () => {
                console.log(data);
                access = JSON.parse(data)['access_token'];
                console.log(access);
                database.write(access);
            });
        }
    );
    await req.write(formData);
    await req.end((data) => {
        console.log("HERE IS MY DATA: " + data);
        console.log("ACCESS: " + access);
    });
    let ok = 0;
    while (!ok) {
        if (access) ok = 1;
        await sleep(100);
        //console.log('not yet');
    }
    return access;
}

refreshToken(REF).then(r => console.log("response: " + r));


