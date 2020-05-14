APP_KEY = "guil0597ef4f5c3";
SECRET_KEY = "xt10z5r1i7rumdn"

accessToken = "";
loggedIn = false;

BASE64_START = 23;

function getAccess(){
    window.location.href = `https://www.dropbox.com/oauth2/authorize?client_id=${APP_KEY}&response_type=code`;
}

function getToken(){
    let textBox = document.getElementById("code");
    console.log(textBox.value);

    fetch("https://api.dropboxapi.com/oauth2/token", {
        method : "POST",
        body: "code=" + textBox.value + "&grant_type=authorization_code",
        headers: {
            Authorization: "Basic Z3VpbDA1OTdlZjRmNWMzOnh0MTB6NXIxaTdydW1kbg==",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }).then(response => response.json()).then(data => {
        accessToken = data.access_token;
        loggedIn = true;
    });
}

function uploadFile(){
    if (!loggedIn){
        console.log("Not logged in");
        return;
    }

    let file = document.getElementById("inputfile").files[0];
    let fileReader = new FileReader(); 

    fileReader.onload = function() {
        console.log("Trying to upload: " + file.name);
        //console.log(fr.result);
        encode64 = fileReader.result.substring(BASE64_START, fileReader.result.length);

        fetch("https://content.dropboxapi.com/2/files/upload", {
            method : "POST",
            body: encode64,
            headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'application/octet-stream',
                'Dropbox-API-Arg' : "{\"path\": \"/" + file.name + "\",\"mode\": \"add\",\"autorename\": true,\"mute\": false,\"strict_conflict\": false}"
            }
        }).then(response => response.json()).then(data => {
            console.log("Uploaded succesfully!");
            console.log(data.id);
            console.log(data.path_lower);
        });
    }
    
    fileReader.readAsDataURL(file);
}

function getFile(){
    if(!loggedIn){
        console.log("Not logged in");
        return;
    } 

    let textBoxFileName = document.getElementById("fileName")
    let fileName = textBoxFileName.value;

    console.log(fileName);

    fetch("https://content.dropboxapi.com/2/files/download", {
        headers: {
            Authorization: "Bearer " + accessToken,
            "Dropbox-Api-Arg": "{\"path\": \"/" + fileName + "\"}"
        },
        method: "POST"
    }).then(data => {
        let reader = data.body.getReader();
        reader.read().then(({done, value}) => {
            var string = new TextDecoder("utf-8").decode(value)
            console.log(string);

            var data = new Blob([string], {type: 'text/plain'});

            
            var url = window.URL.createObjectURL(data);
            document.getElementById('download_link').href = url;

            let a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        })
    });
}