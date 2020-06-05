let HTTP = require('http');
let URL = require('url');
const {DatabaseHandler} = require('./dbhandler');
const {GDUploads} = require('./GDUploads');
const {Credentials} = require('./Credentials');

const HTTPS = require('https');
const queryString = require('querystring');

const credentials = new Credentials();
setTimeout(()=>{
    if(credentials.clientId) console.log("Credentials read");
    else console.log("Error reading credentials");
},200);

const PORT = 6002;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class Server {

    constructor() {
        this.db_on = 0;
        this.db = new DatabaseHandler("mongodb://localhost:27017", "Gapi");
        this.db.Init().then(this.db_on = 1);
        console.log("is db on? " + this.db_on);
        this.up = new GDUploads();
    }


    async refreshToken(refresh) {
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
                    access = JSON.parse(data)['access_token']||"not found";
                    console.log(access);
                });
            }
        );
        await req.write(formData);
        await req.end();
        let ok = 0;
        while (!ok) {
            if (access) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        this.db.setToken(refresh,access).then();
        return access;
    }

    async getToken(refresh){
        console.log("refresh: " + refresh);
        let token = await this.db.getToken(refresh);
        console.log("token from db: " + token);
        if(token === this.db.expired) return this.refreshToken(refresh);
        return token;
    }

    async start(port) {
        let serv = this;

        let predefinedHead = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:1234'
        };

        while(!this.db.Database) await sleep(100);

        HTTP.createServer(async function (req, res) {

            let q = URL.parse(req.url, true).query;
            let path = URL.parse(req.url, true).pathname;

            let data = "";
            let obj = 0;
            req.on('data',d=>data += d);
            req.on('end',()=>obj = JSON.parse(data||'{}'));

            while(!obj) await sleep(100);
            obj.refresh = q.refresh;
            //console.log(URL.parse(req.url, true));

            if(path === "/users"){
                console.log(JSON.stringify(obj));
                //body = JSON.parse(JSON);
                if(!obj.refresh){
                    res.writeHead(400,predefinedHead);
                    res.write('{"message":"Bad request: refresh not provided"}');
                    res.end();
                    return;
                }
                if(req.method === "POST"){
                    serv.createUser(obj.refresh).then(x =>{
                        switch (x) {
                            case 0:
                                res.writeHead(409,predefinedHead);
                                res.write('{"message":"Already exists"}');
                                res.end();
                                break;
                            case 1:
                                res.writeHead(200,predefinedHead);
                                res.write('{"message":"created"}');
                                res.end();
                                break;
                            case -1:
                                res.writeHead(400,predefinedHead);
                                res.write('{"message":"something went wrong"}');
                                res.end();
                                break;
                            default:
                                res.writeHead(500,predefinedHead);
                                res.write('{"message":"dafuq"}');
                                res.end();
                        }

                    });
                    return;

                }else if(req.method === "DELETE"){
                    await serv.db.delete(obj.refresh);
                    res.writeHead(200,predefinedHead);
                    res.write('{"message":"deleted"}');
                    res.end();
                    return;
                }
                else{
                    res.writeHead(405,predefinedHead);
                    res.write({"message":"Method not allowed!"});
                    res.end();
                    return;
                }
            }else if(path.includes("/files")){
                let fileName = path.split("/")[2];
                if(!fileName){
                    res.writeHead(400,predefinedHead);
                    res.write('{"message":"Bad request: file id not provided"}');
                    res.end();
                    return;
                }
                if(!obj.refresh){
                    res.writeHead(400,predefinedHead);
                    res.write('{"message":"Bad request: refresh not provided"}');
                    res.end();
                    return;
                }
                let user = await serv.db.find(obj.refresh);
                if(!user){
                    res.writeHead(404,predefinedHead);
                    res.write('{"message":"Nonexistent user: POST /users first!"}');
                    res.end();
                    return;
                }
                let gid = await serv.findFile(user,fileName);
                switch (req.method) {
                    case "POST": {
                        if(gid !== "0"){
                            res.writeHead(409,predefinedHead);
                            res.write('{"message":"Already exists, try PUT"}');
                            res.end();
                            return;
                        }
                        let x = await serv.addFile(obj.refresh,fileName,obj.content);
                        if(x === 1){
                            res.writeHead(200,predefinedHead);
                            res.write('{"message":"uploaded"}');
                            res.end();
                            return;
                        }
                        res.writeHead(500,predefinedHead);
                        res.write('{"message":"Error while uploading file"}');
                        res.end();
                        return;
                    }
                    case "DELETE": {
                        if(gid === "0"){
                            res.writeHead(404,predefinedHead);
                            res.write('{"message":"Nonexistent file"}');
                            res.end();
                            return;
                        }
                        //TODO
                        break;
                    }
                    case "PUT": {
                        if(gid === "0"){
                            res.writeHead(404,predefinedHead);
                            res.write('{"message":"Nonexistent file"}');
                            res.end();
                            return;
                        }
                        //TODO
                        break;
                    }
                    case "GET": {
                        if(gid === "0"){
                            res.writeHead(404,predefinedHead);
                            res.write('{"message":"Nonexistent file"}');
                            res.end();
                            return;
                        }
                        //TODO
                        break;
                    }
                    default:{
                        break;
                    }
                }
                res.writeHead(405,predefinedHead);
                res.write({"message":"Method not allowed!"});
                res.end();
                return;
            }

            res.writeHead(200,predefinedHead);

            res.write('{"message":"Hello World!",' +
                '"url":"' + req.url + '",' +
                '"path":"' + path + '",' +
                '"year":"' + q.year + '",' +
                '"month":"' + q.month + '"}');
            res.end();
        }).listen(port);
    }

    async findFile(user,name){
        for(let file of user.files){
            if(file.name === name) return file.gid;
        }
        return "0";
    }

    async getRoot(refresh){
        let user = await this.db.find(refresh);
        if(!user) return this.db.notfound;
        return user.root;
    }

    async addFile(refresh,name,content){
        let token = await this.getToken(refresh);
        console.log("got token: " + token);
        let root = await this.getRoot(refresh);
        console.log("root: " + root);

        let file = await this.up.uploadText(token,content,name,[root]);
        if(!file.id) return -1;
        await this.db.insertFile(refresh, {name:name,gid:file.id});
        return 1;
    }

    async findUser(refresh) {
        //console.log(this.db);
        while (!this.db.Database) {
            await sleep(100);
            console.log('searching');
        }
        return this.db.find(refresh);
    }

//findUser().then();

    async createUser(refresh) {

        console.log("creating user: " + refresh);
        let user = await this.findUser(refresh);

        if (user != null) {
            console.log("user already exists!");
            return 0;
        }

        let token = await this.refreshToken(refresh);
        if(token === "not found") return -1;
        let root = await this.up.createFolder(token, 'stol_files');
        if(!root.id) return -1;
        user = {
            refresh: refresh,
            root: root.id,
            files: []
        };
        while (!this.db_on) await sleep(100);
        this.db.insert(user).then(r => console.log(r));
        return 1;
    }
}
let server = new Server();
server.start(PORT).then();
//server.createUser(REF).then();
