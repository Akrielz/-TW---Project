class DatabaseHandler
{
    MongoClient;
    Client;
    Database;

    databaseUrl;
    databaseName;

    constructor(databaseUrl, databaseName)
    {
        this.databaseUrl = databaseUrl;
        this.databaseName = databaseName;
        this.exists = 0;
        this.notfound = -1;
        this.invalid = -2;
        this.expired = -3;
    }

    async Init()
    {
        try {
            this.SetMongo().then(result => {
                console.log("Database Initialization successful!");
            })
                .catch(error => {
                    console.log(error.message);
                });
        }
        catch(err) {
            console.log(err);
            return false;
        }
        return true;
    }

    UnInit()
    {
        this.Client.close();
    }

    async SetMongo()
    {
        this.MongoClient = require('mongodb').MongoClient;
        this.Client = await this.MongoClient.connect(this.databaseUrl, { useUnifiedTopology: true });
        setTimeout(() => {
            this.Database = this.Client.db(this.databaseName);
        }, 100);
        return true;
    }

    async insert(userJson) {
        console.log(userJson);
        this.Database.collection('users', function (err, collection) {
            collection.insertOne(userJson);
        });
        return true;
    }

    async find(refresh){
        let collection = this.Database.collection('users');
        return await collection.findOne({refresh: refresh});
    }

    async getToken(refresh){
        this.debug("refresh: " + refresh);
        let user = await this.find(refresh);
        this.debug(JSON.stringify(user));
        if(user==null) return this.notfound;
        if(!user.token || (Date.now()/1000 - user.token.created)>3600) return this.expired;
        return user.token.value;
    }

    async setToken(refresh,token,infinite = false){
        let user = await this.find(refresh);
        if(user==null) return this.notfound;

        let collection = this.Database.collection('users');

        let newValues = {$set:{token:{
            value:token,
            created: infinite?1691538393:Math.floor(Date.now()/1000)
        }}};

        collection.updateOne(user,newValues);
    }

    async delete(refresh){
        this.Database.collection('users').deleteOne({refresh:refresh});
    }

    async insertFile(refresh,file){
        let collection = this.Database.collection('users');
        let user = await collection.findOne({refresh:refresh});
        if(!user) return this.notfound;
        if(user.files.includes(file)) return this.exists;

        let newData = {$push:{files:file}};
        collection.updateOne({refresh:refresh},newData);
    }

    async getFile(refresh,name){
        let collection = this.Database.collection('users');
        let user = await collection.findOne({refresh:refresh});
        if(!user) return this.notfound;
        for (let file of user.files){
            if(file.name === name){
                return file;
            }
        }
        return {name:"0",gid:"0"};
    }

    async deleteFile(refresh, name)
    {
        let collection = this.Database.collection('users');
        let user = await this.find(refresh);

        let filtered = await user.files.filter(function(e) { return e.name !== name});

        const newValues = {$set: {files: filtered}};
        await collection.updateOne({refresh : user.refresh}, newValues);
        return true;
    }

    debug(text){
        //console.log("DBHANDLER:" + text);
    }
}

module.exports = {DatabaseHandler};
