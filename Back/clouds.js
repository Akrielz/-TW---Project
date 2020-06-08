const http = require('http');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class clouds{
    constructor(type){
        this.type = type;
        this.base = "http://localhost:";
        this.host = "localhost";
        console.log(type);
        switch (type) {
            case "gd":{
                this.port = 6001;
                break;
            }
            case "od":{
                this.port = 6003;
                break;
            }
            case "db":{
                this.port = 6002;
                break;
            }
            default:{
                break;
            }
        }
        //console.log("port: " + this.port);
        this.url = this.base + this.port;
    }

    async createUserByCode(code){
        let path = "/users?code=" + code;
        //console.log(this.url + path);
        let data = "";
        let obj = 0;
        http.request(
            {
                method:"POST",
                hostname: this.host,
                path: path,
                port:this.port
            },
            res =>{
                res.on('data', d => data += d);
                res.on('end', () => {
                    console.log(data);
                    obj = JSON.parse(data);
                });
            }
        ).end();
        let ok = 0;
        while(!ok){
            if(obj) ok = 1;
            await sleep(100);
        }
        if(obj.message === "created") return obj.refresh;
        return 0;
    }

    async uploadText(refresh,name,content){
        let path = "/files/" + name + "?refresh=" + refresh;
        console.log(this.url + path);
        let data = "";
        let obj = 0;
        let req = http.request(
            {
                method:"POST",
                hostname: this.host,
                path: path,
                port:this.port
            },
            res =>{
                res.on('data', d => data += d);
                res.on('end', () => {
                    console.log(data);
                    obj = JSON.parse(data);
                });
            }
        );
        req.write(JSON.stringify({
            content:content
        }));
        req.end();
        let ok = 0;
        while(!ok){
            if(obj) ok = 1;
            await sleep(100);
        }
        if(obj.message === "Success") return 1;
        return 0;
    }

    async downloadText(refresh,name){
        console.log("I AM CLOUD");
        let path = "/files/" + name + "?refresh=" + refresh;
        //console.log(this.url + path);
        let data = "";
        let obj = 0;
        let req = http.request(
            {
                method:"GET",
                hostname: this.host,
                path: path,
                port:this.port
            },
            res =>{
                res.on('data', d => data += d);
                res.on('end', () => {
                    data = data.replace(/\s/g, "");
                    console.log(data);
                    obj = JSON.parse(data);
                });
            }
        );
        req.end();
        let ok = 0;
        while(!ok){
            if(obj) ok = 1;
            await sleep(100);
        }
        console.log("cloud " + this.type + ": " + JSON.stringify(obj));
        if(obj.message === "Success") return obj.content;
        return 0;
    }

    async deleteText(refresh,name){
        let path = "/files/" + name + "?refresh=" + refresh;
        console.log(this.url + path);
        let data = "";
        let obj = 0;
        let req = http.request(
            {
                method:"DELETE",
                hostname: this.host,
                path: path,
                port:this.port
            },
            res =>{
                res.on('data', d => data += d);
                res.on('end', () => {
                    console.log(data);
                    obj = JSON.parse(data);
                });
            }
        );
        req.end();
        let ok = 0;
        while(!ok){
            if(obj) ok = 1;
            await sleep(100);
        }
        if(obj.message === "File deleted") return 1;
        return 0;
    }
}

module.exports = {clouds};
