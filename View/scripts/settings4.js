
async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function getValuesFromDatabase()
{
    // aici se vor seta field-urile din aceasta pagina, flower power

    let userID = localStorage.getItem("stol_owner_id");


    var url = backAddress + userID + '/user/4';
    const response = await fetch(url, {
        method: 'GET'
    });
    const myJson = await response.json();

    console.log(myJson);

    // here it must be modified to use the result json

    document.getElementById("preference1").value = myJson["bandwidth"]["storage_google"];
    document.getElementById("preference2").value = myJson["bandwidth"]["storage_dropbox"];
    document.getElementById("preference3").value = myJson["bandwidth"]["storage_onedrive"];

    document.getElementById("download").value = myJson["bandwidth"]["max_download"];
    document.getElementById("upload").value = myJson["bandwidth"]["max_upload"];


}

async function applyValues()
{
    let userID = localStorage.getItem("stol_owner_id");

    let google = document.getElementById("preference1").value;
    let dropbox = document.getElementById("preference2").value;
    let onedrive = document.getElementById("preference3").value;

    let download = document.getElementById("download").value;
    let upload = document.getElementById("upload").value;

    var url = backAddress + userID + '/user/4';
    console.log(url);
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({storage_google : google, storage_dropbox : dropbox, storage_onedrive: onedrive, max_download: download, max_upload: upload})
    });
    const myJson = await response.json();

    if(myJson.Status === "OK"){
        alert("Changes applied");
        window.location.reload();
    }
    else{
        alert(myJson.Status);
    }
}
