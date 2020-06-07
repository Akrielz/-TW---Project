
let secret_key = "DoruCascaDoru"

async function exportData(filePath)  {
    const fetch = require('node-fetch');
    const fs = require('fs');
    let url = "http://127.0.0.1:3001/" + secret_key + '/export';
    const response = await fetch(url);

    let data = await response.json();

    console.log("Ma apuc de scris");

    await fs.open(filePath + '\\export.json', 'w+', async (err, fd) => {
        if(err)
        {
            console.log(err);
        }
        console.log("Am inceput sa scriu");
        fs.write(fd, data['json'], 0, 0, (err, written, buffer) => {
            console.log("Exported!");
        });

        fs.close(fd, (err) => {});
    });
}

async function eraseData() {
    const fetch = require('node-fetch');

    let url = "http://127.0.0.1:3001/" + secret_key + '/erase-database';
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    let data = await response.json();
    console.log(data);
}

async function importData(filePath)  {
    const fetch = require('node-fetch');
    const fs = require('fs');


    fs.readFile(filePath, async (err, data) => {

        let url = "http://127.0.0.1:3001/" + secret_key + '/import';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({json: data.toString()})
        });
        let responseJSON = await response.json();
        console.log(responseJSON);
    });
}

//exportData("C:\\Users\\rsimion\\Desktop").then(r => {});
//eraseData().then(r => {});
importData("C:\\Users\\rsimion\\Desktop\\export.json").then(r => {});


