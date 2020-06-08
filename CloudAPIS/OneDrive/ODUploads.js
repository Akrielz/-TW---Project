const https = require('https');
const queryString = require('querystring');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class ODUploads{

    constructor() {
        this.connections = 0;
        this.max = 10;
        this.driveHost = "graph.microsoft.com";
        this.uploadHost = "consumer.microsoft.com";
        this.uploadPath = "/v1.0/me/drive/items/{item-id}/children";
        this.uploadPath2 = "/v1.0/me/drive/items/{parent-id}:/{filename}:/content";
        this.downloadPath = "/v1.0/me/drive/items/{item-id}/content";
        this.folderPath = "/v1.0/me/drive/root/children";
        this.otherPath = "/v1.0/me/drive/items";
        console.log("ODUPLOADS");
    }

    async waitConnection(){
        while(this.connections >= this.max) {
            await sleep(100);
            //console.log("connections  : " + this.connections);
        }
        this.connections++;
        console.log("connections++: " + this.connections);
    }

    async connectionReady(){
        this.connections--;
        console.log("connections--: " + this.connections);
    }

    async uploadText(token, content, name, parents = [], index = 0){
        let serv = this;
        await this.waitConnection();
        let path = this.uploadPath2.replace('{parent-id}',parents[0]||'root');
        name = name + ".stol";
        path = path.replace('{filename}',name);

        let options = {
            'method': 'PUT',
            'hostname': this.driveHost,
            'path': path,
            'headers': {
                'Authorization': 'Bearer ' + token,
                //'Content-Type': 'multipart/related; boundary: "' + boundary + '"'
                'Content-Type':'text/plain'
            },
            'maxRedirects': 20
        };

        let obj = 0;

        let req = https.request(options, function (res) {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function (chunk) {
                let body = Buffer.concat(chunks);
                //console.log(body.toString());
                obj = JSON.parse(body);
            });

            res.on("error", function (error) {
                console.log(error);
            });
        });

        req.on('error',async (err)=>{
            if(err.code === 'ETIMEDOUT' && index < 20) {
                //console.log(err);
                //console.log("file number: " + name);
                obj = await serv.uploadText(token, content, name, parents, index + 1);
                console.log("\t\t\t\tSUNT IN ERROR: " + index + " " + JSON.stringify({}));
            }
        });
        req.write(content);
        req.end();

        let ok = 0;
        while (!ok) {
            if (obj) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        await this.connectionReady();
        return obj;
    }

    async uploadText2(token, content, name, parents = [],index = 0){
        let serv = this;
        await this.waitConnection();
        let metadata = {
            "name": name + ".stol",
            "file": {},
            "@microsoft.graph.sourceUrl": "cid:content",
            "@microsoft.graph.conflictBehavior": "rename"
        };

        let path = this.uploadPath.replace('{item-id}',parents[0]||'root');

        //console.log("path: " + path);

        const boundary = '-----123581321222334@#$';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        let options = {
            'method': 'POST',
            'hostname': this.uploadHost,
            'path': path + '?uploadType=multipart',
            'headers': {
                'uploadType': 'multipart',
                'Authorization': 'Bearer ' + token,
                //'Content-Type': 'multipart/related; boundary: "' + boundary + '"'
                'Content-Type':'application/json'
            },
            'maxRedirects': 20
        };

        let postData = delimiter +
            'Content-ID: <metadata>\r\n' +
            "Content-Disposition: form-data; name=\"metadata\"\r\n" +
            "Content-Type: application/json\r\n" +
            "\r\n" +
            JSON.stringify(metadata) + "\r\n" +
            delimiter +
            "Content-ID: <content>\r\n" +
            "Content-Disposition: form-data; name=\"content\"\r\n" +
            "Content-Type: text/plain\r\n" +
            "\r\n" +
            content +
            "\r\n" +
            close_delim;

        let obj = 0;

        let req = https.request(options, function (res) {
            let chunks = [];

            res.on("data", function (chunk) {
                chunks.push(chunk);
            });

            res.on("end", function (chunk) {
                let body = Buffer.concat(chunks);
                //console.log(body.toString());
                obj = JSON.parse(body);
            });

            res.on("error", function (error) {
                console.error(error);
            });
        });
        req.on('error',async (err)=>{
            if(err.code === 'ETIMEDOUT' && index < 20) {
                obj = await serv.uploadText2(token, content, name, parents, index + 1);
                console.log("\t\t\t\tSUNT IN ERROR: " + index + " " + JSON.stringify({}));
            }
        });
        req.write(postData);
        req.end();

        let ok = 0;
        while (!ok) {
            if (obj) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        await this.connectionReady();
        return obj;
    }


    async createFolder(token, name, parents = [], index = 0) {
        let serv = this;
        await this.waitConnection();
        let fileMetadata = {
            "name": name,
            "folder": { },
            "@microsoft.graph.conflictBehavior": "rename"
        };

        let metadata = JSON.stringify(fileMetadata);

        let data = "";
        let obj = 0;

        console.log("ODU: making request create folder: " + metadata);

        let req = https.request(
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                },
                hostname: this.driveHost,
                path: this.folderPath,
                method: "POST",
                port: 443
            },
            res => {
                res.on('data', d => data += d);
                res.on('end', () => {
                    //console.log("ODU: data: " + data);
                    obj = JSON.parse(data);
                });
            }
        );
        req.write(metadata);
        req.on('error',async (err)=>{
            if(err.code === 'ETIMEDOUT' && index < 20) {
                //console.log(err);
                //console.log("file number: " + name);
                obj = await serv.createFolder(token, name, parents, index + 1);
                console.log("\t\t\t\tSUNT IN ERROR: " + index + " " + JSON.stringify({}));
            }
        });
        req.end();

        let ok = 0;
        while (!ok) {
            if (obj) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        await this.connectionReady();
        return obj;
    }

    async deleteFile(token,gid, index = 0){
        let serv = this;
        await this.waitConnection();
        let data = "";
        let obj = 0;
        let req = https.request(
            {
                headers: {
                    "Authorization": "Bearer " + token,
                },
                hostname: this.driveHost,
                path: this.otherPath + "/" + gid,
                method: "DELETE",
                port: 443
            },
            res => {
                res.on('data', d => data += d);
                res.on('end', () => {data=data||'{"ok":1}';obj = JSON.parse(data)});
            }
        );
        req.on('error',async (err)=>{
            if(err.code === 'ETIMEDOUT' && index < 20) {
                //console.log(err);
                //console.log("file number: " + name);
                obj = await serv.deleteFile(token, gid, index + 1);
                console.log("\t\t\t\tSUNT IN ERROR: " + index + " " + JSON.stringify({}));
            }
        });
        req.end();

        let ok = 0;
        while (!obj) {
            if (obj) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        await this.connectionReady();
        return obj;
    }

    async downloadText(token,gid, index = 0){
        let serv = this;
        await this.waitConnection();
        let data = "";
        let obj = 0;
        let addr = "";
        let path = this.downloadPath.replace('{item-id}',gid);
        //console.log("path: " + this.driveHost + path);
        let req = https.request(
            {
                headers: {
                    "Authorization": "Bearer " + token,
                    'Accept':'*/*',
                    'Accept-Encoding':'gzip, deflate, br'
                },
                hostname: this.driveHost,
                path: this.otherPath + "/" + gid + "/content",
                method: "GET",
                //port: 443
            },
            res => {
                //console.log(res);
                res.on('data', d => {
                    data += d;
                    //console.log("\n\n");
                    //console.log("data: " + data);
                    //console.log("\n\n");
                });
                res.on('end', () => {
                    //console.log(res.headers.location);
                    addr = res.headers.location;
                    //console.log("\n\nsomething\n\n");
                    try{
                        obj = JSON.parse(data).error;
                    }catch (e) {
                        obj = {content:data}
                    }
                });
            }
        );
        req.on('error',async (err)=>{
            if(err.code === 'ETIMEDOUT' && index < 20) {
                //console.log(err);
                //console.log("file number: " + name);
                obj = await serv.downloadText(token, gid, index + 1);
                console.log("\t\t\t\tSUNT IN ERROR: " + index + " " + JSON.stringify({}));
            }
        });
        req.end();

        let ok = 0;
        while (!obj) {
            if (obj) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        //console.log(obj);
        if(obj.content) {
            await this.connectionReady();
            return obj;
        }
        obj = await this.getText(addr);
        await this.connectionReady();
        //obj.addr = addr;
        return obj;
    }

    async getText(addr, index = 0){
        await this.waitConnection();
        let serv = this;
        console.log(addr);
        let obj = 0;
        let data = "";
        let request = https.request(addr,res=>{
            res.on('data', d => {
                data += d;
                //console.log("\n\n");
                //console.log("data: " + data);
                //console.log("\n\n");
            });
            res.on('end', () => {
                //console.log(res.headers.location);
                //addr = res.headers.location;
                //console.log("\n\nsomething\n\n");
                try{
                    obj = JSON.parse(data).error;
                }catch (e) {
                    obj = {content:data}
                }
            });
        });
        request.on('error',async (err)=>{
            if(err.code === 'ETIMEDOUT' && index < 20) {
                //console.log(err);
                //console.log("file number: " + name);
                obj = await serv.getText(addr, index + 1);
                console.log("\t\t\t\tSUNT IN ERROR: " + index + " " + JSON.stringify({}));
            }        });
        request.end();
        let ok = 0;
        obj = 0;
        while (!obj) {
            if (obj) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        //console.log(obj);
        await this.connectionReady();
        return obj;
    }

    async getRefreshToken(access_code,credentials, index = 0){
        let serv = this;
        await this.waitConnection();
        let form = {
            code: access_code,
            grant_type: "authorization_code",
            redirect_uri: "http://localhost:3000/linking",
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret
        };
        let formData = queryString.stringify(form);
        let data = "";
        let obj = 0;
        let req = await https.request(
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": formData.length
                },
                hostname: "login.microsoftonline.com",
                path: "/consumers/oauth2/v2.0/token",
                method: "POST",
                port: 443
            },
            res => {
                res.on('data', d => data += d);
                res.on('end', () => {
                    //console.log(data);
                    obj = {};
                    obj.access = JSON.parse(data)['access_token'];
                    obj.refresh = JSON.parse(data)['refresh_token'];
                });
            }
        );
        req.on('error',async (err)=>{
            if(err.code === 'ETIMEDOUT' && index < 20) {
                //console.log(err);
                //console.log("file number: " + name);
                obj = await serv.getRefreshToken(access_code,credentials, index + 1);
                console.log("\t\t\t\tSUNT IN ERROR: " + index + " " + JSON.stringify({}));
            }
        });
        await req.write(formData);
        await req.end();
        let ok = 0;
        while(!ok){
            if(obj){ok=1;}
            await sleep(100);
        }
        await this.connectionReady();
        return obj;
    }

    async refreshToken(refresh,credentials, index = 0) {
        let serv = this;
        await this.waitConnection();
        let form = {
            refresh_token: refresh,
            grant_type: "refresh_token",
            redirect_uri: "http://localhost:3000/linking",
            client_id: credentials.clientId,
            client_secret: credentials.clientSecret
        };
        let formData = queryString.stringify(form);
        let data = "";
        let access = "";
        let req = await https.request(
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": formData.length
                },
                hostname: "login.microsoftonline.com",
                path: "/consumers/oauth2/v2.0/token",
                method: "POST",
                port: 443
            },
            res => {
                res.on('data', d => data += d);
                res.on('end', () => {
                    access = JSON.parse(data)['access_token'] || "not found";
                    //console.log(access);
                });
            }
        );
        req.on('error',async (err)=>{
            if(err.code === 'ETIMEDOUT' && index < 20) {
                //console.log(err);
                //console.log("file number: " + name);
                access = await serv.refreshToken(refresh,credentials, index + 1);
                console.log("\t\t\t\tSUNT IN ERROR: " + index + " " + JSON.stringify({}));
            }
        });
        await req.write(formData);
        await req.end();
        let ok = 0;
        while (!ok) {
            if (access) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        await this.connectionReady();
        return access;
    }
}

module.exports = {ODUploads};

/*

let tok = "ya29.a0AfH6SMAiqLEi_ckxen3FEZFZLP0ca3AfWZ4SojFd-5iQZPbSfKYuVEP1vk_cI3JSUscKhDcgPOF06cGEaQGe2PXJAgWwkHHeRu9ZnKHVXuFozYbF8T1SdbNq7VcyxBt2Zo5OJR254pO1vI2WKVkr2MCSbItiVWCht463";

async function main() {
    let up = new GDUploads();
    let dir = await up.createFolder(tok, 'newOne');
    let file = await up.uploadText(tok, "ana banana", "ananas", [dir.id]);
    console.log("dir: " + dir);
    console.log("file: " + file);
}

main().then();
*/
