const https = require('https');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class GDUploads{

    constructor() {
        this.driveHost = "www.googleapis.com";
        this.uploadPath = "/upload/drive/v3/files";
        this.otherPath = "/drive/v3/files";
    }


    async uploadText(token, content, name, parents = []){
        let metadata = {
            mimeType:'text/plain',
            name:name + '.stol',
            title:name + '.stol',
            parents:parents
        };

        const boundary = '-----123581321222334@#$';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        let options = {
            'method': 'POST',
            'hostname': 'www.googleapis.com',
            'path': this.uploadPath + '?uploadType=multipart',
            'headers': {
                'uploadType': 'multipart',
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'multipart/form-data; boundary=' + boundary
            },
            'maxRedirects': 20
        };

        let postData = delimiter +
            "Content-Disposition: form-data; name=\"resource\"\r\n" +
            "Content-Type: application/json\r\n" +
            "\r\n" +
            JSON.stringify(metadata) + "\r\n" +
            delimiter +
            "Content-Disposition: form-data; name=\"media\"\r\n" +
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
            "mimeType": "application/vnd.google-apps.folder",
            "name": name,
            "title": name,
            "parents": parents
        };
        let media = {
            mimeType: "application/vnd.google-apps.folder",
            body: ""
        };

        let metadata = JSON.stringify(fileMetadata);

        let boundary = '-----123581321222334--';

        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        let multipartRequestBody =
            delimiter +
            'Content-Type: application/json; name="resource"\r\n\r\n' +
            metadata +
            delimiter +
            'Content-Type: text/plain\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            close_delim;

        console.log("multipartBody:");
        console.log(multipartRequestBody);

        let data = "";
        let obj = 0;

        let req = https.request(
            {
                headers: {
                    "Content-Type": "multipart/related; boundary='" + boundary + "'",
                    "Authorization": "Bearer " + token,
                },
                params: {'uploadType': 'multipart'},
                hostname: this.driveHost,
                path: this.uploadPath,
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
        req.write(multipartRequestBody);
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
                res.on('end', () => {data=data||{};obj = JSON.parse(data)});
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

module.exports = {GDUploads};

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
