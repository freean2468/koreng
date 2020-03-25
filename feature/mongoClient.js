module.exports = mongoClient

//
//  connects to MongoDB then performs transactions
//

const fs = require('fs')
const path = require('path')
const {MongoClient} = require('mongodb')
const PASSWORD = fs.readFileSync("./koreng_mongo/pw.txt", "utf8")
const DATABASE_NAME = "sensebe_dictionary"
const DICTIONARY_COLLECTION = "eng_dictionary"
const VIDEO_COLLECTION = "video_collection"
const REDIRECTION_TABLE_FILE = "redirectionTable.json"
const DB_INDEX_TABLE_FILE = 'rootIndexTable.json'

function mongoClient() {
    this.uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true })

    // indexTable has indexies for speeding up the query time of search request.
    // this is not yet fully developed. This needs to be updated in real time on the service server
    // when the lists are added on the local server
    this.indexTable = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'koreng_mongo', DB_INDEX_TABLE_FILE), "utf-8"))
    this.redirectionTable = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'koreng_mongo', REDIRECTION_TABLE_FILE), "utf-8"))
    this.presearchTable = []
    this.status = {
        volumes:0,
        videos:0,
        usages:0
    }

    this.init = async function() {
        for(key in this.indexTable) {
            this.presearchTable.push(key)
        }
        for(key in this.redirectionTable) {
            this.presearchTable.push(key)
        }

        this.setStatus()
    }

    this.addIndexTable = function (res, id, root) {
        this.indexTable[root] = Number(id)
        this.presearchTable.push(root)
        fs.writeFile(path.join(__dirname, '..', 'koreng_mongo', DB_INDEX_TABLE_FILE), JSON.stringify(this.indexTable), "utf-8", (e) => {
            res.send('400')
        })
    }
    
    this.addRedirectionTable = function (res, root, redirection) {
        this.redirectionTable[root] = redirection
        this.presearchTable.push(root)
        fs.writeFile(path.join(__dirname, '..', 'koreng_mongo', REDIRECTION_TABLE_FILE), JSON.stringify(this.redirectionTable), "utf-8",  (e) => {
            res.send('400')
        })
    }

    this.delRedirectionTable = function (res, root) {
        delete this.redirectionTable[root]
        delete this.presearchTable[root]
        fs.writeFile(path.join(__dirname, '..', 'koreng_mongo', REDIRECTION_TABLE_FILE), JSON.stringify(this.redirectionTable), "utf-8",  (e) => {
            res.send('400')
        })
    }

    this.setStatus = async function () {
        this.status["volumes"] = await this.scanListings(DICTIONARY_COLLECTION)
        this.status["videos"] = await this.scanListings(VIDEO_COLLECTION)
        this.status["usages"] = await this.scanUsages()
        return this.status
    }

    this.getStatus = function () {
        return this.status
    }

    this.scanListings = async function (collection) {
        return await this.client.db(DATABASE_NAME).collection(collection).count();
    }

    this.scanUsages = async function () {
        const col = await this.client.db(DATABASE_NAME).collection(DICTIONARY_COLLECTION);
        var count = 0;

        const docs = await col.find({
            "data":{
                $elemMatch:{
                    _usage:{$exists:true}
                }
            }
        }).toArray()

        docs.forEach(function (elem){
            count += elem["data"].length
        })

        return count
    }

    this.findOneListingById = async function(root){
        if (this.redirectionTable[root] !== undefined){
            root = this.redirectionTable[root]
        } 

        _id = this.indexTable[root]

        result = await this.client.db(DATABASE_NAME).collection(DICTIONARY_COLLECTION).findOne({ _id: _id });
     
        if (result) {
            console.log(`in MongoClient: Found a listing in the collection with the _id '${_id}':${result['root']}`);
            // console.log(result);
        } else {
            console.log(`in MongoClient: No listings found with the _id '${_id}' : ${this.indexTable[root]}`);
        }
        return result
    }
    
    this.findVideoListingById = async function(id){
        result = await this.client.db("sensebe_dictionary").collection(VIDEO_COLLECTION).findOne({ _id: id });
     
        if (result) {
            console.log(`in MongoClient: Found a video in the collection with the _id '${_id}':${result['text'][0]}`);
            // console.log(result);
        } else {
            console.log(`in MongoClient: No video found with the _id '${_id}'`);
        }
        return result
    }

    this.connect = async () => { 
        that = this
        await this.client.connect()
                .then(function (db) {
                    that.init()
                })
        console.log('in MongoClient: connected to mongoDB successfully!')
    }
    this.close = async () => await this.client.close()

    this.connect()
}