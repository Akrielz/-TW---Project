const http = require('http');
const fs = require('fs');
let URL = require('url');
const PORT = 3000;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function readFile(path){
    let content = "";
    path = "." + path;
    await fs.readFile(path,async (err,data)=>{
        content = data;
    });
    let ok = 0;
    while(!ok){
        if(content) ok = 1;
        await sleep(20);
    }
    return content;
}

async function replace(data,attributes){
    for(let k in attributes){
        console.log(k);
        data = await data.replace('#{' + k + '}',attributes[k])
    }
    return data;
}

async function parse(source,attributes){
    let html = "";
    let path = "./pages/" + source + ".html";
    await fs.readFile(path,async (err,data)=>{
        let raw = await data.toString();
        html = await replace(raw,attributes);
    });
    let ok = 0;
    while(!ok){
        if(html) ok = 1;
        await sleep(50);
    }
    return html;
}

let htmlHead = {
    'Content-Type':'text/html'
};
let scriptHead = {
    'Content-Type':'application/javascript'
};
let cssHead = {
    'Content-Type':'text/css'
};
let notFoundHead = {
    'Content-Type':'text/plain'
};

let routes = new Map();
routes.set("home","home");
routes.set("file_manager","file_manager");
routes.set("linking","linking");
routes.set("prehome","prehome");
routes.set("","start");
routes.set("login","login_page");
routes.set("register","register_page");
routes.set("wait","waiting");
routes.set("settings_1","settings_1");
routes.set("settings_2","settings_2");
routes.set("settings_3","settings_3");
routes.set("settings_4","settings_4");
routes.set("history","user_history");

function start(){
    http.createServer(async function (req,res) {
        //console.log("Request");
        let q = URL.parse(req.url, true).query;
        let path = URL.parse(req.url, true).pathname;
        let parsedPath = path.split("/");

        let data = "";
        let obj = 0;
        req.on('data',d=>data += d);
        req.on('end',()=>obj = JSON.parse(data||'{}'));

        while(!obj) await sleep(100);

        //console.log("[REQUEST " + req.method + "]: " + JSON.stringify(req.headers));
        console.log("path: " + path);
        if(req.method === "GET") {
            if(routes.has(parsedPath[1])){
                let html = await parse(routes.get(parsedPath[1]),{"target_cloud":"GD"});
                res.writeHead(200,htmlHead);
                res.write(html);
                res.end();
                return;
            }
            switch (parsedPath[1]) {
                case 'scripts':{
                    let script = await readFile(path);
                    res.writeHead(200,scriptHead);
                    res.write(script);
                    res.end();
                    return;
                }
                case 'styles':{
                    let css = await readFile(path);
                    res.writeHead(200,cssHead);
                    res.write(css);
                    res.end();
                    return;
                }
                case 'images':{
                    //console.log(req.headers['if-none-match']);
                    if(req.headers['if-none-match'] === "123"+path){
                        res.writeHead(304);
                        res.end();
                        return;
                    }

                    let img = await readFile(path);
                    let ext = path.split('.')[1];
                    if(ext==="svg") ext = "svg+xml";
                    res.writeHead(200,{
                        'Content-Type':'image/'+ext,
                        'Cache-Control':'public; max-age=10000',
                        'ETag':"123" + path
                    });
                    res.write(img);
                    res.end();
                    return;
                }
            }
        }
        res.writeHead(404,notFoundHead);
        res.write("Not found");
        res.end();

    }).listen(PORT);
    console.log("Listening on port " + PORT);
}

start(PORT);

/*async function main() {
    let blabla = await parse("waiting",{"target_cloud":"GD"});
    console.log(blabla);
}

main().then();*/
