
async function digestMessage(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function registerFunction()
{
    let email = await document.getElementById("email").value;
    let username = await document.getElementById("username").value;
    let password = await document.getElementById("password").value;
    let confirm_password = await document.getElementById("confirm_password").value;

    if(password !== confirm_password)
    {
        console.log("Passwords don't match!");
        return;
    }

    const hashed_password = await digestMessage(password);

    console.log(email);
    console.log(username);
    console.log(password);
    console.log(hashed_password);

    let url = backAddress + 'create-user';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : '*'
        },
        body: JSON.stringify({email : email, username : username, hashed_password : hashed_password})
    });
    const myJson = await response.json();
    console.log(myJson);

}
