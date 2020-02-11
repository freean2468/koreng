module.exports = mongoClient

const fs = require('fs')
const path = require('path')
const {MongoClient} = require('mongodb')
const PASSWORD = fs.readFileSync("./koreng_mongo/pw.txt", "utf8")

function mongoClient() {
    this.uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true })
    this.indexTable = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'koreng_mongo', 'wordsetIndexTable.json'), "utf-8"))
    this.redirectionTable = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'koreng_mongo', 'redirectionTable.json'), "utf-8"))

    this.findOneListingById = async function(wordset){
        if (this.redirectionTable[wordset] !== undefined){
            wordset = this.redirectionTable[wordset]
        } 

        _id = this.indexTable[wordset]

        result = await this.client.db("koreng_dictionary").collection("eng_dictionary").findOne({ _id: _id });
     
        if (result) {
            console.log(`Found a listing in the collection with the _id '${_id}':${result['_wordset']}`);
            // console.log(result);
        } else {
            console.log(`No listings found with the _id '${_id}' : ${this.indexTable[wordset]}`);
        }
        return result
    }

    this.connect = async () => { 
        await this.client.connect()
        console.log('connected to mongoDB successfully!')
    }
    this.close = async () => await this.client.close()

    this.connect()
}