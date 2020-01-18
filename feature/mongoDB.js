module.exports = mongoClient

function mongoClient() {
    this.fs = require('fs')
    this.MongoClient = require('mongodb')
    this.uri = "mongodb+srv://sensebe:QwII48pVSEI5E1tr@agjakmdb-j9ghj.azure.mongodb.net/test"
    this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    this.indexTable = JSON.parse(this.fs.readFileSync(path.join(__dirname, 'wordsetIndexTable.json'), "utf-8"))

    this.findOneListingById = async function(wordset){
        _id = this.indexTabe['wordset']

        result = await client.db("koreng_dictionary").collection("eng_dictionary").findOne({ _id: _id });
     
        if (result) {
            console.log(`Found a listing in the collection with the _id '${_id}':${result['_wordset']}`);
            // console.log(result);
        } else {
            console.log(`No listings found with the _id '${_id}' : ${this.indexTabe['wordset']}`);
        }
    }
}