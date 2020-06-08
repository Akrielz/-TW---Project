
async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function loginFunction()
{
    let username = await document.getElementById("username").value;
    let password = await document.getElementById("password").value;

    const hashed_password = await digestMessage(password);

    await console.log(username);
    await console.log(password);
    await console.log(hashed_password);

    let url = backAddress + 'login';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : '*'
        },
        body: JSON.stringify({email : "", username : username, hashed_password : hashed_password})
    });
    const myJson = await response.json();

    console.log(myJson);
    if(myJson['Status'] === "OK")
    {
        setTimeout(() => {
            localStorage.setItem('stol_owner_id', myJson["owner_id"]);
            localStorage.setItem('stol_user_root', myJson["root"]);
            localStorage.setItem('stol_current_folder', myJson["root"]);

            window.location.href = "/home";
        }, 300);
    }

}
