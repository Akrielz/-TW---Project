const fs = require('fs');

class Credentials{
    constructor(target){
        this.clientSecret = "";
        this.clientId = "";
        this.init(target).then();
    }

    async init(target){
        let dir = "";
        switch (target) {
            case 'gd': dir = 'GoogleDrive'; break;
            case 'od': dir = 'OneDrive'; break;
        }
        fs.readFile('./' + dir + '/resources/credentials.json','utf-8',(err,data)=>{
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

module.exports = {Credentials};
/*
let client = new Credentials();
setTimeout(()=>{
    console.log(JSON.stringify(client));
},200);
*/
