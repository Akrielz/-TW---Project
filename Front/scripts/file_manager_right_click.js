document.body.addEventListener("mousedown", e => {
    if (document.getElementsByClassName("rightClickMenu")[0] != undefined){
        document.body.removeChild(document.getElementById("myContextMenu"));
    }
})

