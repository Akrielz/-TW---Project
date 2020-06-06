
let defaultUrl = 'http://127.0.0.1:3000';

async function sendLogin(email, username, hashed_password)
{
    const fetch = require('node-fetch');

    let url = defaultUrl + '/login';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email : email, username : username, hashed_password : hashed_password})
    });

    return await response.json();
}

async function createUser(email, username, hashed_password)
{
    const fetch = require('node-fetch');

    let url = defaultUrl + '/create-user';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email : email, username : username, hashed_password : hashed_password})
    });

    return await response.json();
}

async function uploadFile(userID, folderID, filePath)
{
    let fs = require("fs");
    const fetch = require('node-fetch');

    let pathParts = filePath.split("\\");
    let fileName = pathParts[pathParts.length - 1];

    let fileStats = fs.statSync(filePath);
    let fileSizeInBytes = fileStats["size"];

    let fileChunks = (fileSizeInBytes / 1024) + (fileSizeInBytes % 1024 !== 0);
    fileChunks = fileChunks - fileChunks % 1;

    console.log("File chunks: " + fileChunks);
    console.log("File Size: " + fileSizeInBytes);

    let uploadRequestUrl = defaultUrl + '/' + userID + '/upload-request';
    const response = await fetch(uploadRequestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({owner_id : userID, folder_id : folderID, name : fileName, file_size : fileSizeInBytes, number_of_chunks : fileChunks})
    });
    let requestResponse = await response.json();

    console.log(requestResponse);

    fs.readFile(filePath, async (err, data) => {
        for(let counter = 0; counter < fileChunks; counter++)
        {
            console.log(data.length)
            let x = counter * 1024;
            let y = counter * 1024 + 1024;
            if(y >= fileSizeInBytes)
                y = fileSizeInBytes;

            let buffer = data.slice(x, y);

            let dataToUpload = buffer.toString('base64');

            let uploadRequestUrl = defaultUrl + '/' + userID + '/upload-chunk';
            const response = await fetch(uploadRequestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({owner_id : userID, file_id: requestResponse['ID'], chunk_number : counter, data : dataToUpload, data_size : dataToUpload.length, md5 : "dummy"})
            });
            let result = await response.json();
        }
    });

    return requestResponse['ID'];
}

async function downloadFile(userID, fileID, filePath)
{
    const fetch = require('node-fetch');
    let fs = require("fs");

    let uploadRequestUrl = defaultUrl + '/' + userID + '/download-request/' + fileID;
    const response = await fetch(uploadRequestUrl, {
        method: 'GET'
    });
    let requestResponseBuff = await response.json();

    let requestResponse = requestResponseBuff['data'];
    console.log(requestResponseBuff);
    let numberOfChunks = requestResponse['number_of_chunks'];

    await fs.open(filePath + '\\' + requestResponse['name'], 'w+', async (err, fd) => {
        console.log("Am creat fisierul " + requestResponse['name']);
        for(let counter = 0; counter < numberOfChunks; counter++)
        {
            let chunkData;

            for(let counter2 = 0; counter2 < numberOfChunks; counter2++)
            {
                if(counter === requestResponse['chunks'][counter2]['chunk_number'])
                {
                    chunkData = requestResponse['chunks'][counter2];
                }
            }

            console.log(chunkData);
            let uploadRequestUrl = defaultUrl + '/' + userID + '/download-chunk/' + chunkData['name'];
            const response = await fetch(uploadRequestUrl, {
                method: 'GET'
            });

            let result = await response.json();
            console.log(result);
            let dataBuffer = Buffer.from(result['data'], 'base64');
            fs.write(fd, dataBuffer, 0, dataBuffer.length, counter * 1024, (err, written, buffer) => {
                console.log("Written chunk " + counter + " to file");
            })
        }

        fs.close(fd, (err) => {});
    })
}

async function removeFile(fileID, userID, folderID)
{
    const fetch = require('node-fetch');

    let uploadRequestUrl = defaultUrl + '/' + userID + '/remove-file';
    await fetch(uploadRequestUrl, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({owner_id : userID, file_id : fileID, folder_id : folderID})
    });

    return true;
}

async function listDirector(userID, folderID)
{
    const fetch = require('node-fetch');

    let uploadRequestUrl = def-aultUrl + '/' + userID + '/remove-item';
    const response = await fetch(uploadRequestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({owner_id : userID, folder_id : folderID})
    });
    let requestResponse = await response.json();

    return true;
}

async function createDirector(userID, parentFolderID, folderName)
{
    const fetch = require('node-fetch');

    let uploadRequestUrl = defaultUrl + '/' + userID + '/create-dir';
    const response = await fetch(uploadRequestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({owner_id : userID, parent_folder_id : parentFolderID, name : folderName})
    });
    let requestResponse = await response.json();

    return true;
}

async function UnitTester()
{
    const fs = require("fs");
    const fetch = require('node-fetch');

    //await createUser("test@gmail.com", "ruben23", "b04e95d0b09d1c3846dc2c1df871b44c780a47844534e36cfee5212f181660ae");
    let result = await sendLogin("", "ruben23", "b04e95d0b09d1c3846dc2c1df871b44c780a47844534e36cfee5212f181660ae");

    console.log(result);

    let fileUploadResult = await uploadFile(result['owner_id'], result['root'], "C:\\Users\\rsimion\\Desktop\\proof2.png");

    console.log(fileUploadResult);

    //await fs.unlinkSync("C:\\Users\\rsimion\\Desktop\\proof2.png");

    setTimeout(async () => {
        //await downloadFile(result['owner_id'], fileUploadResult, "C:\\Users\\rsimion\\Desktop\\target");

        setTimeout(async () => {
            //await removeFile(fileUploadResult, result['owner_id'], result['root']);
        }, 3000);

    }, 3000);

    return true;
}


UnitTester().then();