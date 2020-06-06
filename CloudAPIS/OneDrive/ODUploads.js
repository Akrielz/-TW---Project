const https = require('https');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class ODUploads{

    constructor() {
        this.driveHost = "graph.microsoft.com/v1.0";
        this.uploadPath = "/me/drive/items/{item-id}/children";
        this.folderPath = "/me/drive/root/children";
        this.otherPath = "/drive/v3/files";
    }


    async uploadText(token, content, name, parents = []){
        let metadata = {
            "name": name + ".stol",
            "file": {},
            "@microsoft.graph.sourceUrl": "cid:content",
            "@microsoft.graph.conflictBehavior": "rename"
        };

        const boundary = '-----123581321222334@#$';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        let options = {
            'method': 'POST',
            'hostname': this.driveHost,
            'path': this.uploadPath + '?uploadType=multipart',
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
                    //console.log(data);
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

        //return waitFor(obj);

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
