let HTTP = require('http');
let URL = require('url');
const {DatabaseHandler} = require('./DBHandler/dbhandler');
const {GDUploads} = require('./GoogleDrive/GDUploads');
const {ODUploads} = require('./OneDrive/ODUploads');
const {DBUploads} = require('./DropBox/DBUploads');

const {Credentials} = require('./Credentials');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class Server {

    constructor(target) {
        this.credentials = new Credentials(target);
        this.type = target;
        switch (target) {
            case 'gd':{
                this.port = 6001;
                this.db = new DatabaseHandler("mongodb://localhost:27017", "Gapi");
                this.up = new GDUploads();
                break;
            }
            case 'od':{
                this.port = 6003;
                this.db = new DatabaseHandler("mongodb://localhost:27017", "Mapi");
                this.up = new ODUploads();
                //console.log(JSON.stringify(this.up));
                break;
            }
            case 'db':{
                this.port = 6002;
                this.db = new DatabaseHandler("mongodb://localhost:27017", "Dapi");
                this.up = new DBUploads();
                //console.log(JSON.stringify(this.up));
                break;
            }
        }
        this.db_on = 0;
        this.db.Init().then(()=>{this.db_on = 1;});
        //console.log("is db on? " + this.db_on);
    }


    async start() {
        let serv = this;

        let predefinedHead = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': 'http://localhost:3001'
        };

        let ok = 0;
        let k = 0;
        while(!ok && k < 20){
            if(this.credentials.clientId && this.db.Database) ok = 1;
            await sleep(100);
            k++;
        }

        await console.log(ok);
        if(!ok){
            console.log('Closing server');
            return "Server closed";
        }

        console.log("Starting server: Listening on port " + this.port);

        HTTP.createServer(async function (req, res) {
            let q = URL.parse(req.url, true).query;
            let path = URL.parse(req.url, true).pathname;

            let data = "";
            let obj = 0;
            req.on('data',d=>data += d);
            req.on('end',()=>obj = JSON.parse(data||'{}'));

            while(!obj) await sleep(100);
            obj.refresh = q.refresh;
            obj.code = q.code;
            //console.log(URL.parse(req.url, true));

            if(path === "/users"){
                console.log(JSON.stringify(obj));
                //body = JSON.parse(JSON);
                if(!obj.refresh){
                    if(obj.code){
                        console.log("found the code: " + obj.code);
                        let codes = await serv.up.getRefreshToken(obj.code,serv.credentials);
                        console.log(codes);
                        obj.refresh = codes.refresh;
                    }
                    else {
                        res.writeHead(400, predefinedHead);
                        res.write('{"message":"Bad request: refresh/code not provided"}');
                        res.end();
                        return;
                    }
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
                                res.write('{"message":"created","refresh":"' + obj.refresh + '"}');
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
                    res.write('{"message":"Deleted"}');
                    res.end();
                    return;
                }
                else{
                    res.writeHead(405,predefinedHead);
                    res.write('{"message":"Method not allowed!"}');
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
                            res.write('{"message":"Success"}');
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
                        let ok = await serv.deleteFile(obj.refresh,gid);
                        if(ok){
                            await serv.db.deleteFile(obj.refresh, fileName);
                            res.writeHead(200,predefinedHead);
                            res.write('{"message":"File deleted"}');
                            res.end();
                            return;
                        }else{
                            res.writeHead(500,predefinedHead);
                            res.write('{"message":"Error while deleting the file"}');
                            res.end();
                            return;
                        }
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
                        let content = await serv.downloadFile(obj.refresh,gid);
                        if(content){
                            res.writeHead(200,predefinedHead);
                            res.write('{"message":"Success","content":"' + content + '"}');
                            res.end();
                            return;
                        }else{
                            res.writeHead(500,predefinedHead);
                            res.write('{"message":"Error downloading the file"}');
                            res.end();
                            return;
                        }
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
        }).listen(this.port);

    }

    async refreshToken(refresh) {
        let access = await this.up.refreshToken(refresh,this.credentials);
        this.db.setToken(refresh,access,this.type==='db').then();
        return access;
    }

    async getToken(refresh){
        console.log("refresh: " + refresh);
        let token = await this.db.getToken(refresh);
        console.log("token from db: " + token);
        if(token === this.db.expired) return this.refreshToken(refresh);
        else{
            return token;
        }
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

    async deleteFile(refresh,gid){
        let token = await this.getToken(refresh);
        //console.log("got token: " + token);
        let obj = await this.up.deleteFile(token,gid);
        if(obj.ok) {return 1;}
        return 0;
    }

    async downloadFile(refresh,gid){
        let token = await this.getToken(refresh);
        //console.log("got token: " + token);
        let obj = await this.up.downloadText(token,gid);
        return obj.content||0;
    }

    async findUser(refresh) {
        //console.log(this.db);
        while (!this.db.Database) {
            await sleep(100);
            console.log('searching');
        }
        return this.db.find(refresh);
    }

    async createUser(refresh) {

        console.log("creating user: " + refresh);
        let user = await this.findUser(refresh);

        if (user != null) {
            console.log("user already exists!");
            return 0;
        }

        let token = await this.refreshToken(refresh);
        console.log('token: ' + token.substr(0,50));
        if(token === "not found") return -1;
        let root = await this.up.createFolder(token, 'stol_files');
        if(!root.id) return -1;
        user = {
            refresh: refresh,
            root: this.type==='db'?root.name:root.id,
            files: [],
            token: {
                value:token,
                created:this.type==='db'?1691538393:Math.floor(Date.now()/1000)
            }
        };
        while (!this.db_on) await sleep(100);
        this.db.insert(user).then(r => console.log(r));
        return 1;
    }
}

module.exports = {Server};
//server.createUser(REF).then();
