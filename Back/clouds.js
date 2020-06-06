const http = require('http');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

class clouds{
    constructor(type){
        this.base = "http://localhost:";
        this.host = "localhost";
        console.log(type);
        switch (type) {
            case "gd":{
                this.port = 6002;
                break;
            }
            case "od":{
                this.port = 6003;
                break;
            }
            case "db":{
                this.port = 6001;
                break;
            }
            default:{
                break;
            }
        }
        console.log("port: " + this.port);
    }

    async createUserByCode(code){
        let url = this.base + this.port;
        let path = "/users?code=" + code;
        console.log(url + path);
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
}

module.exports = {clouds};
