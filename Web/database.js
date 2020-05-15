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

    databaseUrl;
    databaseName;

    constructor(databaseUrl, databaseName)
    {
        this.databaseUrl = databaseUrl;
        this.databaseName = databaseName;
    }

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
        this.Client = await this.MongoClient.connect(this.databaseUrl, { useUnifiedTopology: true })
        setTimeout(() => {
            this.Database = this.Client.db(this.databaseName);
        }, 50);
        return true;
    }

    async DeleteFromFilesDataBase(fileID)
    {
        this.Database.collection('Files', function (err, collection) {
            collection.deleteOne({file_id : fileID});
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

    async AddChunkToFileDataBase(chunkJSON, OwnerID, FileID)
    {
        let collection = this.Database.collection('Files');

        let result = await this.GetFromFilesDataBase(FileID);
        let fileJSON = result[0];
        fileJSON['chunks'].push(chunkJSON);

        const newValues = {$set: {chunks: fileJSON['chunks']}};
        await collection.updateOne({owner_id : OwnerID, file_id : FileID}, newValues);
        return true;
    }

    async GetFromFilesDataBase(fileID)
    {
        let collection = this.Database.collection('Files');
        let result = await collection.find({file_id : fileID});
        return result.toArray();
    }

    async DeleteFromUsersDataBase(userID)
    {
        this.Database.collection('Users', function (err, collection) {
            collection.deleteOne({owner_id : userID});
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

    async GetFromUsersDataBaseByUserID(userID)
    {
        let collection = this.Database.collection('Users');
        let result = await collection.find({owner_id : userID});
        return result.toArray();
    }

    async GetFromUsersDataBaseByUsername(username)
    {
        let collection = this.Database.collection('Users');
        let result = await collection.find({username : username});
        return result.toArray();
    }

    async GetFromUsersDataBaseByEmail(email)
    {
        let collection = this.Database.collection('Users');
        let result = await collection.find({email : email});
        return result.toArray();
    }

    async GetAllUsers()
    {
        let collection = this.Database.collection('Users');
        let result = await collection.find();
        return result.toArray();
    }

    async DeleteFromFolderDataBase(folderID)
    {
        this.Database.collection('Folders', function (err, collection) {
            collection.deleteOne({folder_id : folderID});
        });
        return true;
    }

    async InsertIntoFolderDataBase(folderJson)
    {
        this.Database.collection('Folders', function (err, collection) {
            collection.insertOne(folderJson);
        });
        return true;
    }

    async GetFromFolderDataBase(folderID)
    {
        let collection = this.Database.collection('Folders');
        let result = await collection.find({folder_id : folderID});
        return result.toArray();
    }

}

async function UnitTesting()
{
    let handler = new DatabaseHandler("mongodb://localhost:27017", "TW");

    await handler.Init();


    setTimeout(async () => {
        await handler.InsertIntoFilesDataBase({file_id : 1, name : "poza_la_mare.png.exe"});
        await handler.InsertIntoFilesDataBase({file_id : 2, name : "poza_la_mare.jpeg.vbs"});

        let file = await handler.GetFromFilesDataBase(2);
        console.log(file);
        await handler.DeleteFromFilesDataBase(1);

        await handler.InsertIntoUsersDataBase({username : "Aky",   owner_id : 1, hashed_password : "magdn3ibn382104r893tf245gg"});
        await handler.InsertIntoUsersDataBase({username : "Ruben", owner_id : 111, hashed_password : "gqjengv5"});
        await handler.InsertIntoUsersDataBase({username : "Stefy", owner_id : 12, hashed_password : "d4809rfn5gb904ug"});

        await handler.InsertIntoFolderDataBase({name : "teme", folder_id : "1234567890", owner_id : 1, childs : [{name : "tema1", type : "pdf"}]});
        await handler.InsertIntoFolderDataBase({name : "proiect", folder_id : "90", owner_id : 111, childs : [{name : "tema", type : "xlsx"}]});


        let user = await handler.GetFromUsersDataBaseByUserID(1);
        console.log(user);
        await handler.DeleteFromUsersDataBase(3);

        let users = await handler.GetAllUsers();
        console.log(users)

        handler.UnInit();
    }, 150);
}


module.exports = {DatabaseHandler};

//UnitTesting();