function align(x) {
    var s = "";
    for(var i = 0; i < x; i++){
        s = s + "__";
    }
    return s;
}

class Node2 {
    constructor(_info) {
        this.info = _info;
        this.childs = [];
        this.parent = null;
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
        if(this.childs.length > 0){
            inside.className = "dir-info";
            inside.innerHTML = "<i class = \"fa fa-plus-square\"></i>" +
                "<i class = \"fa fa-folder\"></i>" + this.info;
        }
        else {
            inside.className = "file-info";
            inside.innerHTML = "<i class = \"fa fa-file\"></i>" + this.info;
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

class Tree2{
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

    var tree_root = new Node2(pre_root.info);
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
            var child_node = new Node2(child.info);
            current_node.addChild(child_node);
            t.push(child_node);
        }
    }
    return new Tree2(tree_root);
}

function element(node) {
    let element = document.createElement('div');
    element.className="element";

    let img = document.createElement('img');
    if(node!=null) {
        img.alt = node.childs.length > 0 ? "folder" : "file";
    }
    else{
        img.alt = "plus";
    }
    img.src = "./resources/images/" + img.alt + ".png";
    let name = document.createElement('p');
    name.innerText = node?node.info:"create folder";

    element.appendChild(img);
    element.appendChild(name);

    if(node!=null){
        element.onclick = ()=>{
            /*console.log("clicked: ");
            console.log(element);
            for (var ent of contentMap){
                console.log(ent);
            }
            console.log(contentMap.get(element));*/
            showNode(node);
        }
    }

    return element;
}

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

    if(node.childs.length === 0){
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
    content.appendChild(element(null));

    return content;
}

/*

function generateTreeFromJson(json){
    var pre_tree = JSON.parse(json);
    var root = pre_tree.root;

    var tree_root = new Node(root.info,null);
    var current_node = tree_root;
    var current_parent;
    var current_element;
    var queue = [];
    queue.push(root);

    while(queue.size() > 0){
        current_element = queue.shift();

        for(var i in current_element.childs){
            var child = current_element.childs[i];
            current_node.addChild(new Node2(child.info));
            queue.push(child);
        }
    }
}
*/
