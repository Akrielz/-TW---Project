const treeButton = document.getElementById("showTree");
const tree_div = document.getElementById("tree_div");
let treeOk = 0;
let treeClicked = 0;
let dataTree = 0;
let tree;
let currentNode;

let navMap = new Map();
let contentMap = new Map();


async function initTree(){

    //resizeBar(50);
    dataTree = await getJsonTree();
    console.log(dataTree.accounts);
    if(dataTree.accounts.length === 0){
        alert("No cloud accounts linked! Please go to linking page!");
        window.location.href = "/linking";
    }

    tree = await generateTree(JSON.stringify(dataTree));
    let current = localStorage.getItem("stol_current_folder");
    if(current){
        let curr = tree.getNodeById(current);
        if(curr){
            showNode(curr);
            return;
        }
    }

    showNode(tree.root);
}

//initTree().then();

onShowTreeClicked = async function () {
    treeClicked = treeClicked + 1;
    console.log("ok: " + treeOk);

    let sideNav = document.getElementsByClassName("side_nav")[0];
    let full_content = document.getElementsByClassName("full_content")[0];

    if (treeOk === 0) {
        tree_div.appendChild(tree.generate());
        treeButton.innerText = "Hide Tree";
        treeOk = 1;

        sideNav.style.width = "25%";
        full_content.style.left = "25%";
        full_content.style.width = "83%";
    } else {
        tree_div.innerHTML = "";
        treeButton.innerText = "Show Tree";
        treeOk = 0;

        sideNav.style.width = "0px";
        full_content.style.left = "0px";
        full_content.style.width = "98%";
    }
};

function showNode(node){
    localStorage.setItem("stol_current_folder",node.info.id);
    node = node?node:tree.root;
    contentMap = new Map();
    showContent(node);
    currentNode = node;
    console.log("current node: " + currentNode.info);
}


treeButton.onclick = onShowTreeClicked;
