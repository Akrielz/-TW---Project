
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


    var url = backAddress + userID + '/user/2';
    const response = await fetch(url, {
        method: 'GET'
    });
    const myJson = await response.json();

    console.log(myJson);

    // here it must be modified to use the result json

    document.getElementById("email").value = myJson["email"];

}

async function applyValues()
{
    let email = document.getElementById("email").value;
    let newPassword = document.getElementById("newPassword").value;
    let oldPassword = document.getElementById("oldPassword").value;

    let userID = localStorage.getItem("stol_owner_id");

    const hashed_old_password = await digestMessage(oldPassword);
    const hashed_new_password = await digestMessage(newPassword);


    var url = backAddress + userID + '/user/2';
    console.log(url);
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email : email, hashed_old_password : hashed_old_password, hashed_new_password : hashed_new_password})
    });
    const myJson = await response.json();

    console.log(myJson);

}
