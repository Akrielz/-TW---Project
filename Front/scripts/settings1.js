async function getValuesFromDatabase()
{
    // aici se vor seta field-urile din aceasta pagina, flower power

    let userID = localStorage.getItem("stol_owner_id");


    var url = backAddress + userID + '/user/1';
    const response = await fetch(url, {
        method: 'GET'
    });
    const myJson = await response.json();

    console.log(myJson);

    // here it must be modified to use the result json

    document.getElementById("firstName").value = myJson["personal_info"]["first_name"];
    document.getElementById("lastName").value = myJson["personal_info"]["last_name"];
    document.getElementById("gender").value = myJson["personal_info"]["gender"];
    document.getElementById("country").value = myJson["personal_info"]["country"];
    document.getElementById("birthday").value = myJson["personal_info"]["birthday"];
}

async function applyValues()
{
    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let gender = document.getElementById("gender").value;
    let country = document.getElementById("country").value;
    let birthday = document.getElementById("birthday").value;

    let userID = localStorage.getItem("stol_owner_id");


    var url = backAddress + userID + '/user/1';
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({first_name : firstName, last_name : lastName, gender : gender, country : country, birthday : birthday})
    });
    const myJson = await response.json();


}
