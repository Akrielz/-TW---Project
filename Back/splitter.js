function split(total_chunks,chunk_size,cloud_settings,bandwidth){
    let clouds = new Map();
    clouds.set('1',{
        name:'gd',
        available:(bandwidth.storage_google*1024/chunk_size) | 0,
        order:cloud_settings.order.indexOf('1') + 1
    });
    clouds.set('2',{
        name:'db',
        available:(bandwidth.storage_dropbox*1024/chunk_size) | 0,
        order:cloud_settings.order.indexOf('2') + 1
    });
    clouds.set('3',{
        name:'od',
        available:(bandwidth.storage_onedrive*1024/chunk_size) | 0,
        order:cloud_settings.order.indexOf('3') + 1
    });

    console.log(clouds);

    let response = new Map();
    response.set('gd',-1);
    response.set('db',-1);
    response.set('od',-1);

    let total_available = 0;
    for (let cloud of clouds.entries()) {
        console.log(cloud);
        total_available += cloud[1].available>0?cloud[1].available:0;
        console.log(total_available);
    }
    if(total_available<total_chunks){
        return response;
    }

    switch (cloud_settings.method) {
        case 1:{
            let order = cloud_settings.order;
            let i = 0;
            let chunks = total_chunks;
            while(chunks>0 && i <3){
                let index = order.substr(i,1);
                console.log("index: " + index);
                let pref = clouds.get(index);
                console.log("pref: " + JSON.stringify(pref));
                if(pref.available>=chunks){
                    response.set(pref.name,chunks);
                    return response;
                }
                response.set(pref.name,pref.available);
                chunks-=pref.available;
                i++;
            }

            break;
        }
        case 2:{
            let chunks = total_chunks;
            console.log("chunks: " + chunks);
            let avClouds = [];
            for(let [key,cloud] of clouds.entries()){
                if(cloud.available>0) {
                    cloud.part = 0;
                    avClouds.push(cloud);
                }
            }
            while (chunks > avClouds.length && avClouds.length>0){
                let part = chunks/avClouds.length | 0;
                for (let i = avClouds.length-1;i>=0;i--){
                    if(avClouds[i].available>=part){
                        avClouds[i].part += part;
                        avClouds[i].available -= part;
                        chunks -= part;
                    }
                    else{
                        avClouds[i].part += avClouds[i].available;
                        avClouds[i].available = 0;
                        chunks -= avClouds[i].available;
                        avClouds.splice(i,1);
                    }
                }
            }

            while(chunks>0){
                for(let [key,cloud] of clouds.entries()){
                    if(cloud.available > 0)
                        cloud.part ++;
                    cloud.available --;
                    chunks --;
                    if(chunks === 0) break;
                }
            }
            for(let [key,cloud] of clouds.entries()){
                response.set(cloud.name,cloud.part);
            }
            return response;
        }
        case 3:{
            let chunks = total_chunks;
            for(let [key,cloud] of clouds.entries()){
                cloud.part = total_chunks*cloud.available/total_available | 0;
                chunks -= cloud.part;
            }
            while(chunks>0){
                for(let [key,cloud] of clouds.entries()){
                    if(cloud.available > 0)
                    cloud.part ++;
                    cloud.available --;
                    chunks --;
                    if(chunks === 0) break;
                }
            }
            for(let [key,cloud] of clouds.entries()){
                response.set(cloud.name,cloud.part);
            }
            return response;
        }
    }
    response.set('gd',-1);
    response.set('db',-1);
    response.set('od',-1);
    return response;
}

let settings = {
    method:2,
    order:"321"
};
let bandwidth = {
    storage_google:100,
    storage_dropbox:1000,
    storage_onedrive:1000
};

let result = split(1550,1024,settings,bandwidth);
console.log(result);
