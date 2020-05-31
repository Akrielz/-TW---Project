function resizeBar(idNr, type){
    let bar = document.getElementById("loadedBar" + idNr);
    let intValue = parseInt(bar.innerHTML);

    if (type == 0){
        colorMapBackGround = ["green", "#fb3", "rgb(162,6,6)"];
    }
    else{
        colorMapBackGround = ["red", "#fb3", "green"];
    }

    let index = parseInt(intValue/33.34);

    bar.style.width = bar.innerHTML;
    bar.style.backgroundColor = colorMapBackGround[index];
    if (index == 1){
        bar.style.color = "black"
    }

    if (intValue > 95){
        bar.style.borderTopRightRadius = "20px";
        bar.style.borderBottomRightRadius = "20px";
    }
}

let indexBars = [0, 3, 4, 6, 7, 8];
let types     = [0, 1, 1, 0, 0, 0];

for (let i = 0; i < indexBars.length; i++){
    resizeBar(indexBars[i], types[i]);
}

function pieChartPutText(text, procent){
    let widthPie = document.getElementById("pie").offsetWidth;
    let radius = widthPie/2;
    let projection = radius/1.8;

    let startPoint = Math.PI/2;
    let degree = 2*Math.PI/(100/procent)
    let putPoint = degree - startPoint;

    let x = radius-30 + projection*Math.cos(putPoint);
    let y = radius-40 + projection*Math.sin(putPoint);

    let p = document.createElement("p");
    p.innerHTML = text;

    p.style.position = "absolute";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.transform = "rotate(" + putPoint + "rad)";

    document.getElementById("pie").appendChild(p);
}

function pieChartSlice(frequence, names){
    let pie = document.getElementById("pie");

    let sum = 0;
    for (let i = 0; i < frequence.length; i++){
        sum += frequence[i];
    }

    let procents = new Array();
    let continousSum = new Array();
    let last = 0;
    for (let i = 0; i < frequence.length; i++){
        procents.push(frequence[i]/sum*100);
        continousSum.push(last + procents[i]);
        last = continousSum[i];
    }

    gradient = "conic-gradient(";
    for (let i = 0; i < frequence.length; i++){
        let r = Math.random()*80+130;
        let g = Math.random()*80+130;
        let b = Math.random()*80+130;

        if (i != 0){
            gradient += "rgb(" + r + "," + g + "," + b + ") 0,";
        }
        gradient += "rgb(" + r + "," + g + "," + b + ") " + continousSum[i] + "%";
        if (i != frequence.length-1){
            gradient += ", ";
        }
        else{
            gradient += ")";
        }
    }

    pie.style.background = gradient;

    last = 0;
    for (let i = 0; i < frequence.length; i++){
        middle = (last + continousSum[i])/2;
        pieChartPutText(names[i], middle);
        last = continousSum[i];
    }
}


/*let frequence = [30, 20, 10, 15, 10, 15]*/

let frequence = [1500, 412, 2127, 1245, 720, 825, 1000];
let names = [".png", ".exe", ".cpp", ".jpg", ".rar", ".html", ".ruben"];

pieChartSlice(frequence, names);