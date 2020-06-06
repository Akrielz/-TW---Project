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
        this.Client = await this.MongoClient.connect(this.databaseUrl, { useUnifiedTopology: true });
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

        const newValues = {$push: {chunks: chunkJSON}};
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

    async UpdateUserInDatabasePersonal(userID, fieldJSON)
    {
        let collection = this.Database.collection('Users');

        const newValues = {$set: {personal_info: fieldJSON}};
        await collection.updateOne({owner_id : userID}, newValues);
        return true;
    }

    async UpdateUserInDataBaseSecurity(userID, email, hashed_password)
    {
        let collection = this.Database.collection('Users');

        const newValues = {$set: {email: email, hashed_password: hashed_password}};
        await collection.updateOne({owner_id : userID}, newValues);
        return true;
    }

    async UpdateUserInDataBaseBandwidth(userID, fieldJson)
    {
        let collection = this.Database.collection('Users');

        const newValues = {$set: {bandwidth: fieldJson}};
        await collection.updateOne({owner_id : userID}, newValues);
        return true;
    }

    async UpdateUserInDataBaseCloudSettings(userID, fieldJson)
    {
        let collection = this.Database.collection('Users');

        const newValues = {$set: {cloud_settings: fieldJson}};
        await collection.updateOne({owner_id : userID}, newValues);
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

    async AddItemToFolder(folderID, itemJson)
    {
        let collection = this.Database.collection('Folders');

        let result = await this.GetFromFolderDataBase(folderID);

        let folderJson = result[0];

        folderJson['childs'].push(itemJson);

        console.log(folderJson);
        const newValues = {$set: {childs: folderJson['childs']}};
        await collection.updateOne({folder_id : folderID}, newValues);
        return true;
    }

    async RemoveFolderData(folderID)
    {
        let collection = this.Database.collection('Files');

        let result = await this.GetFromFolderDataBase(folderID);

        let folderJson = result[0];

        let listItems = [];

        let item;
        let counter;
        for (counter = 0; counter < folderJson['childs'].length; counter++)
        {
            item = folderJson['childs'][counter];
            if(item['type'] === "folder")
            {
                let temp = await this.RemoveFolderData(item['id']);
                let buff;
                for (buff in temp)
                {
                    listItems.push(buff);
                }
            }
            else
            {
                listItems.push(item);
                await this.RemoveFileFromFolder(item['id']);

                let fileTemp = await this.GetFromFilesDataBase(item['id']);
                let fileJSON = fileTemp[0];
                let fileChunk;
                console.log(fileJSON['chunks']);
                for (fileChunk = 0; fileChunk < fileJSON['chunks'].length; fileChunk++)
                {
                    console.log(fileJSON['chunks'][fileChunk]);
                    let path = ".\\temp\\" + fileJSON['chunks'][fileChunk]["name"] + ".stol";
                    await fs.unlinkSync(path);
                }
                await this.DeleteFromFilesDataBase(fileJSON['file_id']);
            }
        }
        await this.DeleteFromFolderDataBase(folderID);

        return listItems;
    }

    async RemoveFileFromFolder(folderID, fileID)
    {
        let collection = this.Database.collection('Folders');

        let result = await this.GetFromFolderDataBase(folderID);

        console.log(result);

        let folderJson = result[0];

        let filtered = await folderJson['childs'].filter(function(e) { return e['id'] !== fileID});

        const newValues = {$set: {childs: filtered}};
        await collection.updateOne({folder_id : folderID}, newValues);
        return true;
    }

    async GetFromFolderDataBase(folderID)
    {
        let collection = this.Database.collection('Folders');
        let result = await collection.find({folder_id : folderID});
        return result.toArray();
    }

    async InsertIntoActionsDataBase(userID)
    {
        let collection = this.Database.collection('Actions');

        let actionJSON = {};
        actionJSON['owner_id'] = userID;
        actionJSON['actions'] = [];

        await collection.insertOne(actionJSON);

        return true;
    }

    async AddToActionsDataBase(userID, actionJSON)
    {
        let collection = this.Database.collection('Actions');

        const newValues = {$push: {actions: actionJSON}};

        await collection.updateOne({owner_id : userID}, newValues);

        return true;
    }

    async GetFromActionsDataBase(userID)
    {
        let collection = this.Database.collection('Actions');

        let result = await collection.find({owner_id : userID});

        return result.toArray();
    }

    async RemoveFromActionsDataBase(userID, actionID)
    {
        let collection = this.Database.collection('Actions');

        let result = await this.GetFromActionsDataBase(userID);

        console.log(result);

        let actionsJSON = result[0];

        let filtered = await actionsJSON['actions'].filter(function(e) { return e['id'] !== actionID});

        const newValues = {$set: {actions: filtered}};
        await collection.updateOne({owner_id : userID}, newValues);
        return true;
    }

    async GetTree(folder_id){
        let folderTemp = await this.GetFromFolderDataBase(folder_id);
        let folder = folderTemp[0];
        let tree = {
            info:{
                name:folder.name,
                id:folder_id,
                type:"folder"
            },
            childs: []
        };
        console.log("DATABASE: " + JSON.stringify(folder.childs));
        for(let child of folder.childs){
            if(child.type === "folder"){
                let childTree = await this.GetTree(child.id);
                await tree.childs.push(childTree);
            } else{
                await tree.childs.push({"info":child});
            }
        }

        return tree;
    }

    async GetUserAccounts(owner_id) {
        let userTemp = await this.GetFromUsersDataBaseByUserID(owner_id);
        let user = userTemp[0];

        return user.accounts;
    }

    async InsertIntoUserAccounts(owner_id, account){
        console.log("DATABASE: id: " + owner_id);
        console.log("DATABASE: acc: " + JSON.stringify(account));
        let collection = this.Database.collection('Users');
        let newData = {$push:{accounts:account}};

        collection.updateOne({owner_id:owner_id},newData);

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
        console.log(users);

        handler.UnInit();
    }, 150);
}


module.exports = {DatabaseHandler};

//UnitTesting();
