module.exports = mongoClient

const fs = require('fs')
const path = require('path')
const {MongoClient} = require('mongodb')
const PASSWORD = fs.readFileSync("./koreng_mongo/pw.txt", "utf8")

function mongoClient() {
    this.uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true })
    this.indexTable = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'koreng_mongo', 'rootIndexTable.json'), "utf-8"))
    this.presearchTable = []
    this.redirectionTable = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'koreng_mongo', 'redirectionTable.json'), "utf-8"))

    this.init = function() {
        for(key in this.indexTable) {
            this.presearchTable.push(key)
        }
    }

    this.findOneListingById = async function(root){
        if (this.redirectionTable[root] !== undefined){
            root = this.redirectionTable[root]
        } 

        _id = this.indexTable[root]

        result = await this.client.db("sensebe_dictionary").collection("eng_dictionary").findOne({ _id: _id });
     
        if (result) {
            console.log(`Found a listing in the collection with the _id '${_id}':${result['root']}`);
            // console.log(result);
        } else {
            console.log(`No listings found with the _id '${_id}' : ${this.indexTable[root]}`);
        }
        return result
    }
    
    this.findVideoListingById = async function(id){
        result = await this.client.db("sensebe_dictionary").collection("video_collection").findOne({ _id: id });
     
        if (result) {
            console.log(`Found a video in the collection with the _id '${_id}':${result['text'][0]}`);
            // console.log(result);
        } else {
            console.log(`No video found with the _id '${_id}'`);
        }
        return result
    }

    this.connect = async () => { 
        await this.client.connect()
        console.log('connected to mongoDB successfully!')
    }
    this.close = async () => await this.client.close()

    this.connect()

    this.init()
}