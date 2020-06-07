const fs = require('fs');

class ODCredentials{
    constructor(){
        this.clientSecret = "";
        this.clientId = "";
        this.init().then();
    }

    async init(){
        fs.readFile('./resources/credentials.json','utf-8',(err,data)=>{
            if(err){
                return console.log("Error: credentials.json missing");
            }
            //console.log(data);
            let json = JSON.parse(data);
            this.clientId = json.web.client_id;
            this.clientSecret = json.web.client_secret;
        });
    }
}

module.exports = {ODCredentials};
/*
let client = new Credentials();
setTimeout(()=>{
    console.log(JSON.stringify(client));
},200);
*/
