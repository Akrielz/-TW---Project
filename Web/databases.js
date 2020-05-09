class MongoHandler
{
    MongoClient;
    Database;

    constructor() {
        this.MongoClient = undefined;
        this.Database = undefined;
    }

    setClient(client) {
        this.MongoClient = client;
    }

    setDatabase(database) {
        this.Database = database;
    }

    getClient() {
        return this.MongoClient;
    }

    getDatabase() {
        return this.Database;
    }
}

class DatabaseHandler
{
    MongoClient;
    Database;

    async Init()
    {
        try {
            this.SetMongo().then(result => {
                console.log("Initialization successful!");
                return true;
            });
        }
        catch(err) {
            console.log(err);
            return false;
        }
    }

    async SetMongo()
    {
        this.MongoClient = require('mongodb').MongoClient;
        let client = await this.MongoClient.connect("mongodb://localhost:27017", { useUnifiedTopology: true });
        this.Database = client.db('TW');
    }

    async DeleteFromFilesDataBase(fileID)
    {
        this.Database.collection('Files', function (err, collection) {
            collection.remove({id : fileID});
        });
        return true;
    }

    async InsertIntoFilesDataBase(fileJson)
    {
        this.Database.collection('Files', function (err, collection) {
            collection.insertOne(fileJson);
        });
        return true;
    }

    async GetFromFilesDataBase(fileID)
    {
        let collection = this.Database.collection('Files');
        let result = await collection.find({id : fileID});
        return result.toArray();
    }

}

async function UnitTesting()
{
    let handler = new DatabaseHandler();

    await handler.Init();

    setTimeout(() => {
        handler.InsertIntoFilesDataBase({id : 1, name : "poza_la_mare.png.exe"});
        handler.InsertIntoFilesDataBase({id : 2, name : "poza_la_mare.jpeg.vbs"});
    }, 100);
}



UnitTesting();








