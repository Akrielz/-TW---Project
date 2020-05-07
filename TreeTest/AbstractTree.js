class Node {
    constructor(info) {
        this.info = info;
        this.childs = [];
        this.parent = null;
        //console.log("created node "+ info);
    }

    addChild(child){
        this.childs.push(child);
        child.parent = this;
    }
}

class Tree{
    constructor(root) {
        this.root = root;
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
        for (var i in current_element.childs){
            var child = current_element.childs[i];
            s.push(child);
            var child_node = new Node2(child.info);
            current_node.addChild(child_node);
            t.push(child_node);
        }
    }
    return new Tree(tree_root);
}