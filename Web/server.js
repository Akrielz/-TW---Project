const HTTP = require('http');
const HOSTNAME = '127.0.0.1';
const PORT = 3000;

async function parsePostRequest(req, dbHandler) {
    let parsedURL = req.url.split("/");

    let data = ""
    let resultJSON = "";
    await new Promise((resolve, reject) => {
        req.on('data', chunk => {
            data = data + chunk;
        });
        req.on('end', () => {
            resolve();
        });
    }).then(async () => {
        let jsonObject = JSON.parse(data);

        if (parsedURL[1] === "create-user") {
            const {v4: uuidv4} = require('uuid');

            jsonObject.owner_id = uuidv4();
            jsonObject.root = uuidv4();

            // TODO: de verificat daca mail-ul nu este deja folosit, trebuie scisa o functie noua pentru DB

            dbHandler.InsertIntoUsersDataBase(jsonObject);

            resultJSON = JSON.stringify({Status: "OK", Message: "User created! Please login!"});
        }

        if (parsedURL[2] === "upload-request" && parsedURL[1] === jsonObject['owner_id']) {
            const {v4: uuidv4} = require('uuid');

            jsonObject.file_id = uuidv4();

            jsonObject.chunks = [];

            await dbHandler.InsertIntoFilesDataBase(jsonObject);

            resultJSON = JSON.stringify({Status: "OK", ID: jsonObject['file_id']});
        }

        if (parsedURL[2] === "upload-chunk" && parsedURL[1] === jsonObject['owner_id']) {
            const {v4: uuidv4} = require('uuid');
            const fs = require('fs');

            let fileTEMP = await dbHandler.GetFromFilesDataBase(jsonObject['file_id']);
            let fileJSON = fileTEMP[0];

            if (fileJSON['owner_id'] === jsonObject['owner_id'] && jsonObject['data'].length === jsonObject['data_size']) {

                // TODO: trebuie validat md5 si also la chunkJSON trebuie pus si un cloud service, cand va fi cazul
                let chunkJSON = {};
                chunkJSON['chunk_number'] = jsonObject['chunk_number'];
                chunkJSON['data_size'] = jsonObject['data_size'];
                chunkJSON['md5'] = jsonObject['md5']
                chunkJSON['name'] = uuidv4();

                let fileName = ".\\temp\\" + chunkJSON['name'] + ".stol";
                fs.writeFile(fileName, jsonObject['data'], (err) => {
                    if (err) {
                        console.log("Error writing file");
                    } else {
                        console.log('File written successfully.');
                    }
                });

                await dbHandler.AddChunkToFileDataBase(chunkJSON, jsonObject['owner_id'], jsonObject['file_id']);

                resultJSON = JSON.stringify({Status: "OK"});
            }
        }

        if (parsedURL[1] === "login") {
            let userTEMP;

            if (jsonObject['username'].length > 0)
                userTEMP = await dbHandler.GetFromUsersDataBaseByUsername(jsonObject['username']);
            else
                userTEMP = await dbHandler.GetFromUsersDataBaseByEmail(jsonObject['email']);

            let userData = userTEMP[0];

            if (userData['hashed_password'] === jsonObject['hashed_password'])
                resultJSON = JSON.stringify({Status: "OK", owner_id: userData['owner_id'], root: userData['root']});
            else
                resultJSON = JSON.stringify({Status: "Incorrect password"});
        }

        if (parsedURL[2] === "download-request" && parsedURL[1] === jsonObject['owner_id']) {

            let fileTEMP = await dbHandler.GetFromFilesDataBase(jsonObject['file_id']);
            let fileJSON = fileTEMP[0];

            let fileResult = {};
            fileResult['name'] = fileJSON['name'];
            fileResult['file_size'] = fileJSON['file_size'];
            fileResult['number_of_chunks'] = fileJSON['number_of_chunks'];
            fileResult['chunks'] = fileJSON['chunks'];

            resultJSON = JSON.stringify(fileResult);

        }

        if (parsedURL[2] === "download-chunk" && parsedURL[1] === jsonObject['owner_id']) {
            const fs = require('fs');

            // TODO: de verificat MD5-ul fisierului pentru integritate
            // TODO: de facut o verificare ca user-ul care face request-ul chiar detine fisierul, chestia asta nu ar trebui sa afecteze in cloud, ca daca nu e al lui, nu va exista in cloud-ul lui, tho
            // TODO: putem interoga baza de date, dar devine tideous la fisiere cu multe chunks, efectiv sa luam json-ul din db si sa vedem ca ce cer ei e al lor si e din acel fisier

            let filePath = ".\\temp\\" + jsonObject['name'] + ".stol";
            let fileData = "temp";
            await new Promise((resolve, reject) => {
                fs.readFile(filePath, (err, data) => {
                    fileData = data.toString();
                    resolve();
                });
            }).then(
                () => {
                    resultJSON = JSON.stringify({Status: "OK", name: jsonObject['name'], data: fileData});
                });
        }

    });

    if (resultJSON === "") {
        resultJSON = JSON.stringify({Status: "Failed", Error: "Incorrect command"});
    }
    return resultJSON;
}

async function main() {
    const {DatabaseHandler} = require('./database.js');

    let dbHandler = new DatabaseHandler("mongodb://localhost:27017", "TW");

    await dbHandler.Init();

    setTimeout(async () => {
        HTTP.createServer((req, res) => {

            if (req.url) {

                if (req.method === 'GET') {

                }
                // TODO: trebuie mutate din POST toate comenzile, nu sunt toate in POST evident
                // TODO: trebuie facut suportul pentru download si pentru foldere, momentan nu e facut nimic :( Im only human
                // TODO: odata facut suportul pentru foldere, trebuie aplicat si la fisiere
                if (req.method === 'POST') {
                    parsePostRequest(req, dbHandler).then(resultJSON => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        console.log("Result: " + resultJSON);
                        res.end(resultJSON);
                    });
                }

                if (req.method === 'DELETE') {

                }

                if (req.method === 'PUT') {

                }
            }

        }).listen(PORT, HOSTNAME, () => {
            console.log('Server running!');
        });
    }, 150);
}

main().then();