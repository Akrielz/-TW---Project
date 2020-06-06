const HTTP = require('http');
const HOSTNAME = '127.0.0.1';
const PORT = 3001;

async function parseGetRequest(req, dbHandler) {
    const {v4: uuidv4} = require('uuid');

    let parsedURL = req.url.split("/");

    let resultJSON = "";
    await new Promise( async (resolve, reject) => {

        if(parsedURL[2] === "tree"){
            let userTemp = await dbHandler.GetFromUsersDataBaseByUserID(parsedURL[1]);
            let userJson = userTemp[0];
            let treeJson = await dbHandler.GetTree(userJson.root);
            let responseJson = {root:treeJson};
            resultJSON = JSON.stringify(responseJson);
            resolve();
        }

        if (parsedURL[2] === "download-request") {

            let fileTEMP = await dbHandler.GetFromFilesDataBase(parsedURL[3]);
            let fileJSON = fileTEMP[0];

            let fileResult = {};
            fileResult['name'] = fileJSON['name'];
            fileResult['file_size'] = fileJSON['file_size'];
            fileResult['number_of_chunks'] = fileJSON['number_of_chunks'];
            fileResult['chunks'] = fileJSON['chunks'];

            let actionJson = {};
            actionJson['time'] = Date.now();
            actionJson['type'] = "Download file";
            actionJson['id'] = uuidv4();
            actionJson['name'] = fileJSON['name'];

            await dbHandler.AddToActionsDataBase(parsedURL[1], actionJson);

            resultJSON = JSON.stringify({Status: "OK", data: fileResult});

            resolve();
        }

        if (parsedURL[2] === "download-chunk") {
            const fs = require('fs');

            let filePath = ".\\temp\\" + parsedURL[3] + ".stol";
            let fileData = "temp";

            await new Promise((resolve, reject) => {
                fs.readFile(filePath, (err, data) => {
                    fileData = data.toString();
                    resolve();
                });
            }).then(
                () => {
                    resultJSON = JSON.stringify({Status: "OK", name: parsedURL[3], data: fileData});
                });

            resolve();
        }

        if (parsedURL[2] === "list-dir") {

            let dirTEMP = await dbHandler.GetFromFolderDataBase(parsedURL[3]);
            let dirJSON = dirTEMP[0];

            if (dirJSON['owner_id'] === parsedURL[1]) {
                resultJSON = JSON.stringify({Status: "OK", list: dirJSON['childs']});
            }

            resolve();
        }

        if(parsedURL[2] === "user" && parsedURL[3] === "1") {
            console.log(parsedURL[1]);
            let userTEMP = await dbHandler.GetFromUsersDataBaseByUserID(parsedURL[1]);
            let userJSON = userTEMP[0];
            console.log(userJSON);
            console.log(userJSON["personal_info"]);
            resultJSON = JSON.stringify({Status: "OK", personal_info : userJSON["personal_info"]});

            resolve();
        }

        if(parsedURL[2] === "user" && parsedURL[3] === "2") {
            let userTEMP = await dbHandler.GetFromUsersDataBaseByUserID(parsedURL[1]);
            let userJSON = userTEMP[0];

            resultJSON = JSON.stringify({Status: "OK", email : userJSON["email"]});

            resolve();
        }

        if(parsedURL[2] === "user" && parsedURL[3] === "3") {
            let userTEMP = await dbHandler.GetFromUsersDataBaseByUserID(parsedURL[1]);
            let userJSON = userTEMP[0];

            resultJSON = JSON.stringify({Status: "OK", cloud_settings : userJSON["cloud_settings"]});

            resolve();
        }

        if(parsedURL[2] === "user" && parsedURL[3] === "4") {
            let userTEMP = await dbHandler.GetFromUsersDataBaseByUserID(parsedURL[1]);
            let userJSON = userTEMP[0];

            resultJSON = JSON.stringify({Status: "OK", bandwidth : userJSON["bandwidth"]});

            resolve();
        }

        if(parsedURL[2] === "user" && parsedURL[3] === "home") {
            let userTEMP = await dbHandler.GetFromUsersDataBaseByUserID(parsedURL[1]);
            let userJSON = userTEMP[0];

            resultJSON = JSON.stringify({Status: "OK", statistics: userJSON["statistics"], bandwidth: userJSON["bandwidth"], name : userJSON["personal_info"]["last_name"]});

            resolve();
        }

    }).then( async () => {

        if (resultJSON === "") {
            resultJSON = JSON.stringify({Status: "Failed", Error: "Incorrect command"});
        }
    });

    return resultJSON;
}

async function parsePostRequest(req, dbHandler) {
    let parsedURL = req.url.split("/");

    let data = "";
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

            jsonObject.personal_info = {};
            jsonObject["personal_info"].first_name = "Doe";
            jsonObject["personal_info"].last_name = "John";
            jsonObject["personal_info"].gender = "Apache helicopter";
            jsonObject["personal_info"].country = "Kurlanda de Est";
            jsonObject["personal_info"].birthday = "1900-01-01";

            jsonObject.cloud_settings = {};
            jsonObject["cloud_settings"].method = 1;
            jsonObject["cloud_settings"].order = "123";

            jsonObject.bandwidth = {};
            jsonObject["bandwidth"].storage_google = 1024;
            jsonObject["bandwidth"].storage_dropbox = 1024;
            jsonObject["bandwidth"].storage_onedrive = 1024;
            jsonObject["bandwidth"].max_upload = 1024;
            jsonObject["bandwidth"].max_download = 1024;

            jsonObject.statistics = {};
            jsonObject["statistics"].total_upload = 0;
            jsonObject["statistics"].total_download = 0;
            jsonObject["statistics"].total_google = 0;
            jsonObject["statistics"].total_onedrive = 0;
            jsonObject["statistics"].total_dropbox = 0;


            // TODO: de verificat daca mail-ul nu este deja folosit, trebuie scrisa o functie noua pentru DB

            await dbHandler.InsertIntoUsersDataBase(jsonObject);
            await dbHandler.InsertIntoActionsDataBase(jsonObject.owner_id);

            let folderJSON = {};
            folderJSON.name = "root";
            folderJSON.folder_id = jsonObject.root;
            folderJSON.owner_id = jsonObject.owner_id;
            folderJSON.childs = [];

            await dbHandler.InsertIntoFolderDataBase(folderJSON);

            resultJSON = JSON.stringify({Status: "OK", Message: "User created! Please login!"});
        }

        if (parsedURL[2] === "upload-request" && parsedURL[1] === jsonObject['owner_id']) {
            const {v4: uuidv4} = require('uuid');

            //TODO : update current folder with new file, add folder to file json <DONE>

            jsonObject.file_id = uuidv4();

            jsonObject.chunks = [];

            await dbHandler.InsertIntoFilesDataBase(jsonObject);

            let actionJson = {};
            actionJson['time'] = Date.now();
            actionJson['type'] = "Upload file";
            actionJson['id'] = uuidv4();
            actionJson['name'] = jsonObject.name;

            await dbHandler.AddToActionsDataBase(parsedURL[1], actionJson);

            let dirItem = {};
            dirItem.type = "file";
            dirItem.name = jsonObject.name;
            dirItem.id = jsonObject.file_id;
            await dbHandler.AddItemToFolder(jsonObject['folder_id'], dirItem);

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
                chunkJSON['md5'] = jsonObject['md5'];
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

        if (parsedURL[2] === "create-dir" && parsedURL[1] === jsonObject['owner_id']) {
            const {v4: uuidv4} = require('uuid');
            // TODO: insert folder to database, update current folder, return current folder updated <DONE>

            jsonObject.folder_id = uuidv4();
            jsonObject.childs = [];
            await dbHandler.InsertIntoFolderDataBase(jsonObject);

            let actionJson = {};
            actionJson['time'] = Date.now();
            actionJson['type'] = "Create Directory";
            actionJson['id'] = uuidv4();
            actionJson['name'] = jsonObject.name;

            await dbHandler.AddToActionsDataBase(parsedURL[1], actionJson);

            let dirItem = {};
            dirItem.type = "folder";
            dirItem.name = jsonObject['name'];
            dirItem.id = jsonObject.folder_id;
            await dbHandler.AddItemToFolder(jsonObject['parent_folder_id'], dirItem);

            resultJSON = JSON.stringify({Status: "OK"});

        }
    });

    if (resultJSON === "") {
        resultJSON = JSON.stringify({Status: "Failed", Error: "Incorrect command"});
    }
    return resultJSON;
}

async function parsePutRequest(req, dbHandler) {
    let parsedURL = req.url.split("/");

    let data = "";
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

        // update data

        if (parsedURL[2] === "user" && parsedURL[3] === "1") {
            await dbHandler.UpdateUserInDatabasePersonal(parsedURL[1], jsonObject);

            resultJSON = JSON.stringify({Status: "OK"});
        }

        if (parsedURL[2] === "user" && parsedURL[3] === "2") {

            let userTEMP = await dbHandler.GetFromUsersDataBaseByUserID(parsedURL[1]);
            let userJson = userTEMP[0];

            if(userJson["hashed_password"] === jsonObject["hashed_old_password"])
            {
                await dbHandler.UpdateUserInDataBaseSecurity(parsedURL[1], jsonObject["email"], jsonObject["hashed_new_password"]);
                resultJSON = JSON.stringify({Status: "OK"});
            }
            else
            {
                resultJSON = JSON.stringify({Status: "Wrong password"});
            }
        }

        if (parsedURL[2] === "user" && parsedURL[3] === "3") {
            await dbHandler.UpdateUserInDataBaseCloudSettings(parsedURL[1], jsonObject);

            resultJSON = JSON.stringify({Status: "OK"});
        }

        if (parsedURL[2] === "user" && parsedURL[3] === "4") {
            await dbHandler.UpdateUserInDataBaseBandwidth(parsedURL[1], jsonObject);

            resultJSON = JSON.stringify({Status: "OK"});
        }


    });

    if (resultJSON === "") {
        resultJSON = JSON.stringify({Status: "Failed", Error: "Incorrect command"});
    }
    return resultJSON;
}

async function parseDeleteRequest(req, dbHandler) {
    let parsedURL = req.url.split("/");

    let data = "";
    let resultJSON = "";
    await new Promise((resolve, reject) => {
        req.on('data', chunk => {
            data = data + chunk;
        });
        req.on('end', () => {
            resolve();
        });
    }).then(async () => {
        const {v4: uuidv4} = require('uuid');

        let jsonObject = JSON.parse(data);

        if (parsedURL[2] === "remove-file" && parsedURL[1] === jsonObject['owner_id']) {
            const fs = require('fs');
            // TODO: remove file from folder, update current folder, return OK <DONE>

            await dbHandler.RemoveFileFromFolder(jsonObject['folder_id'], jsonObject['file_id']);
            let fileTemp = await dbHandler.GetFromFilesDataBase(jsonObject['file_id']);
            let fileJSON = fileTemp[0];
            let fileChunk;
            console.log(fileJSON['chunks']);
            for (fileChunk = 0; fileChunk < fileJSON['chunks'].length; fileChunk++)
            {
                console.log(fileJSON['chunks'][fileChunk]);
                let path = ".\\temp\\" + fileJSON['chunks'][fileChunk]["name"] + ".stol";
                await fs.unlinkSync(path);
            }
            await dbHandler.DeleteFromFilesDataBase(fileJSON['file_id']);

            let actionJson = {};
            actionJson['time'] = Date.now();
            actionJson['id'] = uuidv4();
            actionJson['type'] = "Remove file";
            actionJson['name'] = fileJSON.name;

            await dbHandler.AddToActionsDataBase(parsedURL[1], actionJson);


            resultJSON = JSON.stringify({Status: "OK"});
        }

        if (parsedURL[2] === "remove-dir" && parsedURL[1] === jsonObject['owner_id']) {
            // TODO: remove folder, remove all files recursively
            // TODO: add function that already implemented, but not tested(alpha version)
        }

    });

    if (resultJSON === "") {
        resultJSON = JSON.stringify({Status: "Failed", Error: "Incorrect command"});
    }
    return resultJSON;
}


async function main() {

    const {DatabaseHandler} = require('./repository/database.js');

    let dbHandler = new DatabaseHandler("mongodb://localhost:27017", "TW");

    await dbHandler.Init();

    setTimeout(async () => {
        HTTP.createServer((req, res) => {

            if (req.url) {
                console.log("Mare request incoming");
                console.log("=============================================================================");
                if (req.method === 'GET') {
                    parseGetRequest(req, dbHandler).then(resultJSON => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Headers', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
                        //console.log("Result: " + resultJSON);
                        res.end(resultJSON);
                    });
                }
                if (req.method === 'POST') {
                    console.log("Am primit un post command");
                    parsePostRequest(req, dbHandler).then(resultJSON => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Headers', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
                        console.log("Result: " + resultJSON);
                        res.end(resultJSON);
                    });
                }

                if (req.method === 'DELETE') {
                    parseDeleteRequest(req, dbHandler).then(resultJSON => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Headers', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
                        //console.log("Result: " + resultJSON);
                        res.end(resultJSON);
                    });
                }

                if (req.method === 'PUT') {
                    parsePutRequest(req, dbHandler).then(resultJSON => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Headers', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
                        //console.log("Result: " + resultJSON);
                        res.end(resultJSON);
                    });
                }

                if(req.method === 'OPTIONS') {
                    res.statusCode = 200;
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Headers', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
                    res.end();
                }
            }

        }).listen(PORT, HOSTNAME, () => {
            console.log('Server running!');
        });
    }, 150);
}

main().then();
