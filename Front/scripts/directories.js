function align(x) {
    var s = "";
    for(var i = 0; i < x; i++){
        s = s + "__";
    }
    return s;
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

let type_info = {
    "name": "string",
    "id": "string",
    "type": "file/folder"
};

let newFile = {
    type:"new_file"
};
let newFolder = {
    type:"new_folder"
};

class Node {
    constructor(_info) {
        this.info = _info;
        this.info.real_name = this.info.name;
        if(this.info.name.length > 20)
        {
            this.info.name = this.info.name.substr(0, 17) + "...";
        }

        this.childs = [];
        this.parent = null;
        this.type = null;
        console.log("created node "+ _info);
    }

    addChild(child){
        this.childs.push(child);
        child.parent = this;
    }

    generate(depth){
        var div = document.createElement('div');
        var inside = document.createElement('div');
        var pic = document.createElement('img');
        if(this.info.type === "folder"){
            inside.className = "dir-info";
            inside.innerHTML = "<i class = \"fa fa-plus-square\"></i>" +
                "<i class = \"fa fa-folder\"></i>" + this.info.name;
        }
        else {
            inside.className = "file-info";
            inside.innerHTML = "<i class = \"fa fa-file\"></i>" + this.info.name;
        }
        //inside.innerText = align(depth) + this.info;
        navMap.set(inside,this);

        inside.onclick=()=>{
            //console.log(navMap.get(inside));
            showNode(navMap.get(inside));
        };
        div.appendChild(inside);
        if(depth === 0){
            div.className = 'tree-root';
        }
        else{
            div.className = 'tree-node';
        }
        for(let child of this.childs){
            div.appendChild(child.generate(depth+1));
        }



        return div;
    }

    getNodeById(id){
        if(this.info.id === id) return this;
        for(let child of this.childs){
            let rez = child.getNodeById(id);
            if(rez) return rez;
        }
        return null;
    }
}

class Tree{
    constructor(root) {
        this.root = root;
    }

    generate(){
        var div = document.createElement('div');
        div.className = 'tree';
        div.appendChild(this.root.generate(0));
        for (let x of navMap){
            console.log(x);
        }
        return div;
    }

    getNodeById(id){
        return this.root.getNodeById(id);
    }
}

async function generateTree(json) {
    console.log("started to generate Tree");
    var pre_tree = JSON.parse(json);
    var pre_root = pre_tree.root;

    console.log("json read");

    var tree_root = new Node(pre_root.info);
    var s = [];
    var t = [];
    var current_node;
    var current_element;
    await s.push(pre_root);
    await t.push(tree_root);
    while(s.length > 0){
        current_element = await s.pop();
        current_node = await t.pop();
        if("childs" in current_element)
            for (var child of current_element.childs){
                s.push(child);
                var child_node = new Node(child.info);
                current_node.addChild(child_node);
                t.push(child_node);
            }
    }
    return new Tree(tree_root);
}

function element(node) {
    let element = document.createElement('div');
    element.className="element";

    let img = document.createElement('img');
    let name = document.createElement('p');
    if(!node.type) {
        img.alt = node.info.type;
        name.innerText = node.info.name;
    }
    else{
        img.alt = node.type;
        if(node.type === "new_file"){
            name.innerText = "Upload new file";
        }
        else{
            name.innerText = "Create new folder";
        }
    }
    img.src = "./images/file_manager/" + img.alt + "1.svg";

    element.appendChild(img);
    element.appendChild(name);

    if(!node.type){
        element.onclick = ()=>{

            showNode(node);
        }
    }
    else{
        if(node.type==="new_file") {
            element.onclick = () => uploadFile(node);
        }
        else{
            element.onclick = () => createFolder(node);
        }
    }

    let nav = document.createElement("nav");
    nav.id = "myContextMenu";
    nav.className = "navigationSettings";
    nav.style.position = "absolute";
    nav.style.width = "120px";
    nav.style.height = "auto";

    let div = document.createElement("div");
    nav.appendChild(div);

    let ul = document.createElement("ul");
    div.appendChild(ul);

    let o1 = document.createElement("li");
    ul.appendChild(o1);

    let a1 = document.createElement("a");
    a1.innerHTML = "Delete";
    o1.appendChild(a1);

    let o2 = document.createElement("li");
    ul.appendChild(o2);

    let a2 = document.createElement("a");
    a2.innerHTML = "Rename";
    o2.appendChild(a2);

    if (node.info && node.info.type === "file"){

        let o3 = document.createElement("li");
        ul.appendChild(o3);

        let a3 = document.createElement("a");
        a3.innerHTML = "Download";
        o3.appendChild(a3);

        o3.addEventListener("mousedown", e => {
            console.log("Descarcam");
            downloadItem(node).then();
        });
    }

    o1.addEventListener("mousedown", e => {
        console.log("Stergem");
        removeItem(node).then();
    });

    o2.addEventListener("mousedown", e => {
        console.log("Redenumim");
        renameItem(node).then();

    });



    document.body.addEventListener("mousedown", e => {
        if (document.getElementsByClassName("navigationSettings")[0] !== undefined){
            document.body.removeChild(document.getElementById("myContextMenu"));
        }
    });

    if (node.type===null){
        element.addEventListener('contextmenu', e => {
            e.preventDefault();
            document.body.appendChild(nav);

            nav.style.left = e.x + "px";
            nav.style.top = e.y + "px";
        });
    }

    return element;
}

async function renameItem(node)
{
    console.log(node);

    let uid = localStorage.getItem("stol_owner_id");

    let newName = prompt("Enter new name:", "New name");
    if (newName == null || newName === "") {
        alert("Rename action cancelled");
    } else {
        if(node.info.type === "file") {
            let url = backAddress + uid + "/rename-file";

            let response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({owner_id : uid, file_id : node.info.id, folder_id : node.parent.info.id, new_name: newName})
            });
            const myJson = await response.json();

            console.log(myJson);
            //alert(myJson.Status);
            if(myJson.Status==="OK"){window.location.reload();}
        }
        else {
            let url = backAddress + uid + "/rename-folder";

            let response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({owner_id : uid, folder_id : node.info.id, parent_folder_id : node.parent.info.id, new_name: newName})
            });
            const myJson = await response.json();

            console.log(myJson);
            //alert(myJson.Status);
            if(myJson.Status==="OK"){window.location.reload();}
        }
    }

}

function stele(count,max,length){
    let res = "";
    let stele = length*count/max | 0;
    for(let i = 0; i < length; i++){
        if(i <= stele) res += '*';
        else res += '_';
    }
    return res;
}

function _arrayBufferToBase64( buffer ) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

let uploadChunks = async function(file, folderID, readerEvent)
{
    let chunkSize = 1024 * 512;
    let content = readerEvent.target.result; // this is the content!
    console.log(content);
    content = _arrayBufferToBase64(content);


    let fileSizeInBytes = content.length;
    console.log("Size in bytes: " + fileSizeInBytes + " " + file.size);


    let fileName = file.name;
    console.log("File name: " + fileName);

    let fileChunks = (fileSizeInBytes / chunkSize) + (fileSizeInBytes % chunkSize !== 0);
    fileChunks = fileChunks - fileChunks % 1;
    console.log("File chunks: " + fileChunks);

    let userID = localStorage.getItem("stol_owner_id");
    let uploadRequestUrl = backAddress + userID + '/upload-request';

    const response = await fetch(uploadRequestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({owner_id : userID, folder_id : folderID, name : fileName, file_size : fileSizeInBytes, number_of_chunks : fileChunks, chunk_size:chunkSize})
    });
    let requestResponse = await response.json();

    let uploaded = 0;

    for(let counter = 0; counter < fileChunks; counter++)
    {
        let x = counter * chunkSize;
        let y = counter * chunkSize + chunkSize;
        if(y >= fileSizeInBytes)
            y = fileSizeInBytes;

        let buffer = content.slice(x, y);

        let uploadRequestUrl = backAddress + userID + '/upload-chunk';
        fetch(uploadRequestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({owner_id : userID, file_id: requestResponse['ID'], chunk_number : counter, data : buffer, data_size : buffer.length, md5 : "dummy"})
        }).then(r=>r.json()).then(r=>{
            if(r.Status === "OK") {
                uploaded++;
                console.log(uploaded);
            }
        });
        /*const response = await fetch(uploadRequestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({owner_id : userID, file_id: requestResponse['ID'], chunk_number : counter, data : buffer, data_size : buffer.length, md5 : "dummy"})
        });
        let result = await response.json();
        //console.log(result);
        //alert(result.Status);
        if(result.Status === "OK") uploaded++;*/
    }
    let loading = document.getElementsByClassName('file-loader')[0];
    loading.style.display = 'block';
    let stelute = document.getElementById('stelute');
    stelute.innerText = stele(0,fileChunks,40);
    while(uploaded < fileChunks){
        await sleep(100);
        console.log("uploaded " + uploaded + "/" + fileChunks);
        stelute.innerText = stele(uploaded,fileChunks,40);
    }
    window.location.reload();

};

let uploadFile = async function(node) {
    console.log("creating new " + node.type);
    const input = document.createElement('input');
    input.type = 'file';

    input.onchange = async e => {
        const file = e.target.files[0];
        console.log(file);

        const reader = new FileReader();
        await reader.readAsArrayBuffer(file);
        reader.onload = (readerEvent) => uploadChunks(file, node.parent.info.id, readerEvent);
    };

    input.click();
};


let createFolder = async function(node){
    let uid = localStorage.getItem("stol_owner_id");
    console.log(uid);
    console.log("creaza " + node.type + " in " + node.parent.info.real_name);
    let folder = prompt("Enter folder name:", "New folder");
    if (folder == null || folder === "") {
        alert("Folder creation cancelled");
    } else {
        let url = backAddress + uid + "/create-dir";
        let options = {
            method: "POST",
            headers: {
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                name:folder,
                owner_id:uid,
                parent_folder_id: node.parent.info.id
            })
        };
        const response = await fetch(url,options).then(r=>r.json()).then(r=>{
            console.log(r);
            if(r.Status === "OK"){
                window.location.reload();
            }
        });


    }
};

function showContent(node){
    hideContent();
    let cont = document.getElementById("content_show");
    cont.appendChild(content(node));
}

function hideContent(){
    let cont = document.getElementById("content_show");
    cont.innerHTML = "";
}

function downloadPopUp(filename, text) {

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;base64,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);

}

async function downloadItem(node)
{
    console.log(node);
    console.log("Download pornit pe nodul " + node.info.real_name);

    let userID = localStorage.getItem("stol_owner_id");
    let fileID = node.info.id;


    let uploadRequestUrl = backAddress + userID + '/download-request/' + fileID;
    const response = await fetch(uploadRequestUrl, {
        method: 'GET'
    });
    let requestResponseBuff = await response.json();

    let requestResponse = requestResponseBuff['data'];
    console.log(requestResponseBuff);
    let numberOfChunks = requestResponse['number_of_chunks'];

    let fileData = "";

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
        let uploadRequestUrl = backAddress + userID + '/download-chunk/' + chunkData['name'];

        const response = await fetch(uploadRequestUrl, {
            method: 'GET'
        });

        let result = await response.json();
        fileData = fileData + result['data'];
    }
    //console.log(fileData);
    downloadPopUp(node.info.real_name, fileData);

}

async function removeItem(node)
{
    console.log(node);
    let returnId = node.parent.info.id;
    localStorage.setItem("stol_current_folder",returnId);

    let uid = localStorage.getItem("stol_owner_id");

    if(node.info.type === "file") {
        let url = backAddress + uid + "/remove-file";

        let response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({owner_id : uid, file_id : node.info.id, folder_id : node.parent.info.id})
        });
        const myJson = await response.json();

        console.log(myJson);
        //alert(myJson.Status);
        if(myJson.Status==="OK"){window.location.reload();}
    }
    else {
        let url = backAddress + uid + "/remove-dir";

        let response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({owner_id : uid, folder_id : node.info.id, parent_folder_id : node.parent.info.id})
        });
        const myJson = await response.json();

        console.log(myJson);
        //alert(myJson.Status);
        if(myJson.Status==="OK"){window.location.reload();}
    }


}




function content(node){
    let content = document.createElement('div');
    content.className = 'content flexContainer';

    if(node.info.type === "file"){

        content.appendChild(document.createElement('br'));

        let btnRemove = document.createElement("BUTTON");   // Create a <button> element
        btnRemove.innerHTML = " Remove Item ";
        btnRemove.onclick = () => removeItem(node);
        content.appendChild(btnRemove);

        content.appendChild(document.createElement('br'));

        let btnDownload = document.createElement("BUTTON");   // Create a <button> element
        btnDownload.innerHTML = "Download Item";
        btnDownload.onclick = () => downloadItem(node);
        content.appendChild(btnDownload);

        return content;
    }

    for(let child of node.childs) {
        let elem = element(child);
        contentMap.set(elem,child);
        content.appendChild(elem);
    }
    content.appendChild(element({
        type:"new_folder",
        parent: node
    }));
    content.appendChild(element({
        type:"new_file",
        parent: node
    }));
    return content;
}

async function getJsonTree(){
    let uid = localStorage.getItem("stol_owner_id");
    let url = backAddress + uid + "/tree";
    let response = await fetch(url);
    return response.json();
}
