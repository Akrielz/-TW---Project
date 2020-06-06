
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


    var url = backAddress + userID + '/user/3';
    const response = await fetch(url, {
        method: 'GET'
    });
    const myJson = await response.json();

    console.log(myJson);

    // here it must be modified to use the result json
    document.getElementById("checked1").checked = false;
    document.getElementById("checked2").checked = false;
    document.getElementById("checked3").checked = false;

    document.getElementById("preference1").value = myJson["cloud_settings"]["order"][0];
    document.getElementById("preference2").value = myJson["cloud_settings"]["order"][1];
    document.getElementById("preference3").value = myJson["cloud_settings"]["order"][2];


    document.getElementById("checked" + myJson["cloud_settings"]["method"]).checked = true;

}

async function applyValues()
{
    let method = "";
    if(document.getElementById("checked1").checked === true)
    {
        method = "1";
    }
    else if(document.getElementById("checked2").checked === true)
    {
        method = "2";
    }
    else
    {
        method = "3";
    }

    let userID = localStorage.getItem("stol_owner_id");

    let order = document.getElementById("preference1").value + document.getElementById("preference2").value + document.getElementById("preference3").value;


    var url = backAddress + userID + '/user/3';
    console.log(url);
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({method : method, order : order})
    });
    const myJson = await response.json();

    console.log(myJson);

}
