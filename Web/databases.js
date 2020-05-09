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
    Client;
    Database;

    async Init()
    {
        try {
            this.SetMongo().then(result => {
                console.log("Initialization successful!");
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
        this.Client = await this.MongoClient.connect("mongodb://localhost:27017", { useUnifiedTopology: true })
        setTimeout(() => {
            this.Database = this.Client.db('TW');
        }, 50);
        return true;
    }

    async DeleteFromFilesDataBase(fileID)
    {
        this.Database.collection('Files', function (err, collection) {
            collection.deleteOne({id : fileID});
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

    async DeleteFromUsersDataBase(userID)
    {
        this.Database.collection('Users', function (err, collection) {
            collection.deleteOne({user_id : userID});
        });
        return true;
    }

    async InsertIntoUsersDataBase(userJson)
    {
        this.Database.collection('Users', function (err, collection) {
            collection.insertOne(userJson);
        });
        return true;
    }

    async GetFromUsersDataBase(userID)
    {
        let collection = this.Database.collection('Users');
        let result = await collection.find({user_id : userID});
        return result.toArray();
    }

}

async function UnitTesting()
{
    let handler = new DatabaseHandler();

    await handler.Init();


    setTimeout(async () => {
        await handler.InsertIntoFilesDataBase({id : 1, name : "poza_la_mare.png.exe"});
        await handler.InsertIntoFilesDataBase({id : 2, name : "poza_la_mare.jpeg.vbs"});

        let file = await handler.GetFromFilesDataBase(2);
        console.log(file);
        await handler.DeleteFromFilesDataBase(1);

        await handler.InsertIntoUsersDataBase({username : "Aky", owner_id : 1, user_id : 1, hashed_password : "magdn3ibn382104r893tf245gg"});
        await handler.InsertIntoUsersDataBase({username : "Ruben", owner_id : 111, user_id : 2, hashed_password : "gqjengv5"});
        await handler.InsertIntoUsersDataBase({username : "Stefy", owner_id : 12, user_id : 3, hashed_password : "d4809rfn5gb904ug"});

        let user = await handler.GetFromUsersDataBase(1);
        console.log(user);
        await handler.DeleteFromUsersDataBase(3);

        handler.UnInit();
    }, 150);
}



UnitTesting();








