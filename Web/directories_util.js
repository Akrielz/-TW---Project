const treeButton = document.getElementById("showTree");
const tree_div = document.getElementById("tree_div");
let treeOk = 0;
let treeClicked = 0;
let json = "";
let tree;
let currentNode;

let navMap = new Map();
let contentMap = new Map();

async function initTree(){
    json = await getJsonTree();
    console.log(json);
    tree = await generateTree(JSON.stringify(json));
    showNode(tree.root);
}

initTree().then();

onShowTreeClicked = async function () {
    treeClicked = treeClicked + 1;
    console.log("ok: " + treeOk);

    let sideNav = document.getElementsByClassName("side_nav")[0];
    let full_content = document.getElementsByClassName("full_content")[0];

    if (treeOk === 0) {
        tree_div.appendChild(tree.generate());
        treeButton.innerText = "Hide Tree";
        treeOk = 1;

        sideNav.style.width = "15%";
        full_content.style.left = "15%";
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
    node = node?node:tree.root;
    contentMap = new Map();
    showContent(node);
    currentNode = node;
    console.log("current node: " + currentNode.info);
}


treeButton.onclick = onShowTreeClicked;
