const https = require('https');
const queryString = require('querystring');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class DBUploads{

    constructor() {
        this.driveHost = "content.dropboxapi.com";
        this.apiHost = "api.dropboxapi.com";
        this.uploadPath = "/2/files/upload";
        this.deletePath = "/2/files/delete_v2";
        this.downloadPath = "/2/files/download";
        this.folderPath = "/2/files/create_folder_v2";
        this.otherPath = "";
    }

/*
{
    "path": "/Homework/math/Matrices.txt",
    "mode": "add",
    "autorename": true,
    "mute": false,
    "strict_conflict": false
}
 */

    async uploadText(token, content, name, parents = ['stol_files']){
        let metadata = {
            path: "/" + parents[0] + "/" + name + '.stol',
            mode: "add",
            autorename: false,
            mute: false,
            strict_conflict: false
        };

        let options = {
            'method': 'POST',
            'hostname': this.driveHost,
            'path': this.uploadPath,
            'headers': {
                'Dropbox-API-Arg': JSON.stringify(metadata),
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/octet-stream'
            },
            'maxRedirects': 20
        };

        let postData = content;

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

    /*
    curl -X POST https://api.dropboxapi.com/2/files/create_folder_v2 \
    --header "Authorization: Bearer <access token>" \
    --header "Content-Type: application/json" \
    --data "{\"path\": \"/Homework/math\",\"autorename\": false}"
     */

    async createFolder(token, name, parents = []) {
        let fileMetadata = {
            "path": '/' + name,
            "autorename": true
        };

        let metadata = JSON.stringify(fileMetadata);

        let data = "";
        let obj = 0;

        console.log("DBU: making request create folder: " + metadata);

        let req = https.request(
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                },
                hostname: this.apiHost,
                path: this.folderPath,
                method: "POST",
                port: 443
            },
            res => {
                res.on('data', d => data += d);
                res.on('end', () => {
                    console.log("DBU: data: " + data);
                    obj = JSON.parse(data).metadata;
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

    /*
    curl -X POST https://api.dropboxapi.com/2/files/delete_v2 \
    --header "Authorization: Bearer <token>" \
    --header "Content-Type: application/json" \
    --data "{\"path\": \"/Homework/math/Prime_Numbers.txt\"}"
     */

    async deleteFile(token,gid){
        let data = "";
        let obj = 0;
        let body = JSON.stringify({
            path:"id:" + gid
        });
        let req = https.request(
            {
                headers: {
                    "Authorization": "Bearer " + token,
                    'Content-Type': 'application/json'
                },
                hostname: this.apiHost,
                path: this.deletePath,
                method: "POST",
                port: 443
            },
            res => {
                res.on('data', d => data += d);
                res.on('end', () => {obj = data.substr(0,1) === '{'?{ok:1}:{ok:0}});
            }
        );
        req.write(body);
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
        let args = {
            path:"id:" + gid
        };
        let jsonArgs = JSON.stringify(args);
        console.log(jsonArgs);
        let req = https.request(
            {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Dropbox-Api-Arg":JSON.stringify(args)
                },
                hostname: this.driveHost,
                path: this.downloadPath,
                method: "POST",
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
        };
        let formData = queryString.stringify(form);
        let data = "";
        let obj = 0;
        let req = await https.request(
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Content-Length": formData.length,
                    "Authorization": "Basic " + credentials.clientSecret,
                },
                hostname: "api.dropboxapi.com",
                path: "/oauth2/token",
                method: "POST",
                port: 443
            },
            res => {
                res.on('data', d => data += d);
                res.on('end', () => {
                    console.log(data);
                    obj = {};
                    obj.access = JSON.parse(data)['access_token'];
                    obj.refresh = obj.access;
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
        return refresh;
    }
}

module.exports = {DBUploads};

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
/*

let tokens = {
    access: 'jaHwRWBZe-AAAAAAAAAAE0lHx42gq6Q84DmQ3C_G9LsMqqavLOgI7q058ilykMoc',
    refresh: 'jaHwRWBZe-AAAAAAAAAAE0lHx42gq6Q84DmQ3C_G9LsMqqavLOgI7q058ilykMoc'
};

let id = "l32Op0T0NPAAAAAAAAAAEA"

let code = "jaHwRWBZe-AAAAAAAAAAEn6bOxSdVlIMK2bQ1RVgElY";
let up = new GDUploads();
//up.createFolder(tokens.access,"stol_files",[]).then(r=>console.log(r));
//up.uploadText(tokens.access,"blabla","12345",["stol_files"]);
//up.downloadText(tokens.access,id).then(r=>console.log(r));
up.deleteFile(tokens.access,id).then(r=>console.log(r));
*/
