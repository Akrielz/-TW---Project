const https = require('https');
const queryString = require('querystring');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class ODUploads{

    constructor() {
        this.driveHost = "graph.microsoft.com";
        this.uploadPath = "/v1.0/me/drive/items/{item-id}/children";
        this.folderPath = "/v1.0/me/drive/root/children";
        console.log("ODUPLOADS");
    }


    async uploadText(token, content, name, parents = []){
        let metadata = {
            "name": name + ".stol",
            "file": {},
            "@microsoft.graph.sourceUrl": "cid:content",
            "@microsoft.graph.conflictBehavior": "rename"
        };

        let path = this.uploadPath.replace('{items-id}',parents[0]||'root');

        const boundary = '-----123581321222334@#$';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        let options = {
            'method': 'POST',
            'hostname': this.driveHost,
            'path': path + '?uploadType=multipart',
            'headers': {
                'uploadType': 'multipart',
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'multipart/related; boundary=' + boundary
            },
            'maxRedirects': 20
        };

        let postData = delimiter +
            'Content-ID: <metadata>\r\n' +
            "Content-Type: application/json\r\n" +
            "\r\n" +
            JSON.stringify(metadata) + "\r\n" +
            delimiter +
            "Content-ID: <content>\r\n" +
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
                console.log(body.toString());
                obj = JSON.parse(body);
            });

            res.on("error", function (error) {
                console.error(error);
            });
        });

        req.write(postData);
        req.end();

        let ok = 0;
        while (!ok) {
            if (obj) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        return obj;
    }


    async createFolder(token, name, parents = []) {
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
                    console.log("ODU: data: " + data);
                    obj = JSON.parse(data);
                });
            }
        );
        req.write(metadata);
        req.end();

        let ok = 0;
        while (!ok) {
            if (obj) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        return obj;
    }

    async deleteFile(token,gid){
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
        req.end();

        let ok = 0;
        while (!obj) {
            if (obj) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        return obj;
    }

    async downloadText(token,gid){
        let data = "";
        let obj = 0;
        let req = https.request(
            {
                headers: {
                    "Authorization": "Bearer " + token,
                },
                hostname: this.driveHost,
                path: this.otherPath + "/" + gid + "?alt=media",
                method: "GET",
                port: 443
            },
            res => {
                res.on('data', d => data += d);
                res.on('end', () => {
                    try{
                        obj = JSON.parse(data).error;
                    }catch (e) {
                        obj = {content:data}
                    }
                });
            }
        );
        req.end();

        let ok = 0;
        while (!obj) {
            if (obj) ok = 1;
            await sleep(100);
            //console.log('not yet');
        }
        return obj;
    }

    async getRefreshToken(access_code,credentials){
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
                    console.log(data);
                    obj = {};
                    obj.access = JSON.parse(data)['access_token'];
                    obj.refresh = JSON.parse(data)['refresh_token'];
                });
            }
        );
        await req.write(formData);
        await req.end();
        let ok = 0;
        while(!ok){
            if(obj){ok=1;}
            await sleep(100);
        }
        return obj;
    }

    async refreshToken(refresh,credentials) {
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
