function toDateTime(miliSecs) {
    var t = new Date(1970, 0, 1);
    t.setMilliseconds(miliSecs);
    return t;
}

function createTimeDivider(title, historyElements){
    let historyPanel = document.getElementsByClassName("historyPanel")[0];
    let timeDivider = document.createElement("div");
    timeDivider.classList.add("timeDivider");
    
    let label = document.createElement("label");
    label.innerHTML = title;
    timeDivider.appendChild(label);

    let elements = [];
    let contor = 0;
    for (let i = 0; i < historyElements.length; i++){
        let historyElement = document.createElement("div");
        historyElement.classList.add("historyElement");

        let elementType = document.createElement("div");
        elementType.classList.add("elementType");
        elementType.innerHTML = "<p>" + historyElements[i].type + "</p>";

        let elementName = document.createElement("div");
        elementName.classList.add("elementName");
        elementName.innerHTML = "<p>" + historyElements[i].name + "</p>";

        let elementTime = document.createElement("div");
        elementTime.classList.add("elementTime");

        let postMeridian = parseInt(historyElements[i].time.getHours/12);
        
        let date = toDateTime(historyElements[i].time);
        let timeFormated;
        if (postMeridian){
            timeFormated = (date.getHours()-12) + ":";
            timeFormated += date.getMinutes();
            timeFormated += " PM";
        }
        else{
            timeFormated = (date.getHours()-12) + ":";
            timeFormated += date.getMinutes();
            timeFormated += " AM";
        }
        elementTime.innerHTML = "<p>" + timeFormated + "</p>";

        let elementButtons = document.createElement("div");
        elementButtons.classList.add("elementButtons");
        
        let aClose = document.createElement("a");
        aClose.href = "#";

        let closeImg = document.createElement("img");
        closeImg.src = "./images/history/close.svg";
        closeImg.classList.add("ico");
        closeImg.classList.add("close");
        closeImg.alt = "close";
        
        aClose.appendChild(closeImg);
        aClose.addEventListener('click', () => {
            timeDivider.removeChild(elements[i]);
            contor++;

            elements[i] = undefined;

            if (contor == historyElements.length){
                historyPanel.removeChild(timeDivider);
            }
        });

        elementButtons.appendChild(aClose);

        historyElement.appendChild(elementType);
        historyElement.appendChild(elementName);
        historyElement.appendChild(elementTime);
        historyElement.appendChild(elementButtons);

        elements.push(historyElement);
        timeDivider.appendChild(elements[i]);
    }

    historyPanel.appendChild(timeDivider);
}

function splitOnTimeDividers(historyElements){
    historyElements.sort((a,b) => {
        return b.time - a.time;
    });

    let map = {};
    for (let i = 0; i < historyElements.length; i++){
        date = toDateTime(historyElements[i].time).toDateString();
        if (map[date] === undefined){
            map[date] = [];
        }
        map[date].push(historyElements[i]);
    }

    for (let key in map){
        createTimeDivider(key, map[key]);
    }
}

//Astea vor fi datele preluate de la server
let historyElements = [
    {type : "T1", name : "N1", time : 1590936937383},
    {type : "T2", name : "N2", time : 1590934939383},
    {type : "T3", name : "N3", time : 1590954934383},
    {type : "T4", name : "N4", time : 1590534934383}
];

splitOnTimeDividers(historyElements);
