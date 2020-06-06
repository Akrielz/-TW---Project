function align(x) {
    var s = "";
    for(var i = 0; i < x; i++){
        s = s + "__";
    }
    return s;
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
}

function generateTree(json) {
    console.log("started to generate Tree");
    var pre_tree = JSON.parse(json);
    var pre_root = pre_tree.root;

    console.log("json read");

    var tree_root = new Node(pre_root.info);
    var s = [];
    var t = [];
    var current_node;
    var current_element;
    s.push(pre_root);
    t.push(tree_root);
    while(s.length > 0){
        current_element = s.pop();
        current_node = t.pop();
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
            element.onclick = () => {
                console.log("creating new " + node.type);
            }
        }
        else{
            element.onclick = () => createFolder(node);
        }
    }

    return element;
}

let createFolder = async function(node){
    let uid = localStorage.getItem("stol_owner_id");
    console.log(uid);
    console.log("creaza " + node.type + " in " + node.parent.info.name);
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
        const response = await fetch(url,options);
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

function content(node){
    let content = document.createElement('div');
    content.className = 'content flexContainer';

    if(node.info.type === "file"){
        let p = document.createElement('p');
        p.innerText = "TODO preview...";
        content.appendChild(p);
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
