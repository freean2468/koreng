const {MongoClient} = require('mongodb');
const fs = require('fs')
const path = require('path')

last_index = 0
indexTable = {}
motherJson = []
videoJson = []

METADATA_PATH = "dictionary_data"
ARCHIVE_PATH = "dictionary_archive"
VIDEO_DATA_PATH = "video_data"
VIDEO_ARCHIVE_PATH = "video_archive"

TABLE_PATH = './'
PASSWORD = fs.readFileSync("./pw.txt", "utf8")

DATABASE_NAME = "sensebe_dictionary"
DICTIONARY_COLLECTION = "eng_dictionary"
VIDEO_COLLECTION = "video_collection"

REDIRECTION_TABLE_FILE = "redirectionTable.json"
DB_INDEX_TABLE_FILE = 'rootIndexTable.json'


// 1 : find
// 0 : register
FLAG = 0

function registerRedirectionTable(json){
    table = fs.readFileSync(path.join(__dirname, REDIRECTION_TABLE_FILE), "utf-8")
    redirectionTableJson = JSON.parse(table)

    root = json['root']
    redirection = json['redirection']

    if(redirection !== "") {
        if(redirectionTableJson[root] === undefined) {
            redirectionTableJson[root] = redirection
            fs.writeFileSync(path.join(__dirname, REDIRECTION_TABLE_FILE), JSON.stringify(redirectionTableJson), "utf-8")
            console.log(`${root} registered as ${redirection}`)
        } 
        return true
    }
    return false
}

function setId(json){
    table = fs.readFileSync(path.join(__dirname, DB_INDEX_TABLE_FILE), "utf-8")

    // console.log('tableData : ', table)
    rootTableJson = JSON.parse(table)
    // console.log('json form : \n',indexTable)
    redirectionResult = registerRedirectionTable(json)
    root = json["root"]

    if(redirectionResult === false) {
        if(rootTableJson[root] === undefined){
            _id = Object.keys(rootTableJson).length
            // console.log(Object.keys(rootTableJson).length)
            rootTableJson[root]=_id
            json['_id'] = _id

            fs.writeFileSync(path.join(__dirname, DB_INDEX_TABLE_FILE), JSON.stringify(rootTableJson), "utf-8")
        } else {
            json['_id'] = rootTableJson[root]
        }
        console.log(`json['_id'] : ${json['_id']}, root : ${root}`)

        motherJson.push(json)
    }
}

function readMetadataAndRegister(folder){
    // dictionary
    files = fs.readdirSync(path.join(__dirname, folder), "utf-8")

    files.forEach(function(filename){
        if (filename.split('.').pop() == 'json') {
            fileData = fs.readFileSync(path.join(__dirname, folder, filename), "utf-8")

            // console.log('file name : ', filename)
            json = JSON.parse(fileData)
            // console.log('json form : \n',json)

            setId(json)
    
            fs.rename(path.join(__dirname, folder, filename), path.join(__dirname, ARCHIVE_PATH, filename), (err)=>{
                if(err) throw err
            });
        }
    })
}

function registerVideo (client) {
    // video
    files = fs.readdirSync(path.join(__dirname, VIDEO_DATA_PATH), "utf-8")

    files.forEach(function(filename){
        if (filename.split('.').pop() == 'json') {
            fileData = fs.readFileSync(path.join(__dirname, VIDEO_DATA_PATH, filename), "utf-8")

            // console.log('file name : ', filename)
            json = JSON.parse(fileData)
            // console.log('json form : \n',json)

            json['_id'] = filename.split('.')[0]
            source = json["source"]

            if (source == 1) json["source"] = "The Witcher III : Wild Hunter"

            videoJson.push(json)
    
            fs.rename(path.join(__dirname, VIDEO_DATA_PATH, filename), path.join(__dirname, VIDEO_ARCHIVE_PATH, filename), (err)=>{
                if(err) throw err
            });
        }
    })
}

async function createListing(client, newListing, collection){
    const result = await client.db(DATABASE_NAME).collection(collection).insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}(${newListing['root']})`);
}

async function createMultipleListings(client, newListings){
    const result = await client.db(DATABASE_NAME).collection("eng_dictionary").insertMany(newListings);
 
    console.log(`${result.insertedCount} new listing(s) created with the following id(s):${result.insertedIds}`);
}

async function findOneListingById(client, idOfListing) {
    result = await client.db(DATABASE_NAME).collection("eng_dictionary").findOne({ _id: idOfListing });
 
    if (result) {
        console.log(`Found a listing in the collection with the _id '${idOfListing}':${result['root']}`);
        // console.log(result);
    } else {
        console.log(`No listings found with the _id '${idOfListing}'`);
    }
}

async function findListingBy(client, collection) {
    const col = await client.db(DATABASE_NAME).collection(collection);
    col.find({
        "_data.0.__usage":{
            $elemMatch:{
                ___videos:{$exists:true}
            }
        }
    }).toArray(function(err, doc) {
        // console.log(doc)
        var list = ''
        var count = 0
        doc.forEach(function (item){
            list += item["root"] + '\n'
            count++
        })

        fs.writeFile('temp_list.txt', list, (err) => {
            if (err) throw err;
            console.log(`Count : ${count} The file has been saved!`);
        });
        client.close()
    })
}

async function findListingsWithMinimumBedroomsBathroomsAndMostRecentReviews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms = 0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {
    const cursor = client.db(DATABASE_NAME).collection("eng_dictionary")
        .find({
            bedrooms: { $gte: minimumNumberOfBedrooms },
            bathrooms: { $gte: minimumNumberOfBathrooms }
        }
        )
        .sort({ last_review: -1 })
        .limit(maximumNumberOfResults);
 
    const results = await cursor.toArray();
 
    if (results.length > 0) {
        console.log(`Found listing(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();
 
            console.log();
            console.log(`${i + 1}. name: ${result.name}`);
            console.log(`   _id: ${result._id}`);
            console.log(`   bedrooms: ${result.bedrooms}`);
            console.log(`   bathrooms: ${result.bathrooms}`);
            console.log(`   most recent review date: ${new Date(result.last_review).toDateString()}`);
        });
    } else {
        console.log(`No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}

async function replaceListing(client, listing, collection) {
    result = await client.db(DATABASE_NAME).collection(collection).replaceOne({
        _id : listing['_id']
    }, 
    {
        $set: listing
    });
    
    // console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`_id : ${listing['_id']}, for "${listing["root"]}" replaced : matchedCount(${result.matchedCount}), modiefiedCount(${result.modifiedCount})`);
}

async function updateListingByName(client, nameOfListing, updatedListing) {
    result = await client.db(DATABASE_NAME).collection("eng_dictionary")
                        .updateOne({ name: nameOfListing }, { $set: updatedListing });
 
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function upsertListingByName(client, nameOfListing, updatedListing) {
    result = await client.db(DATABASE_NAME).collection("eng_dictionary")
                        .updateOne({ name: nameOfListing }, 
                                   { $set: updatedListing }, 
                                   { upsert: true });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
 
    if (result.upsertedCount > 0) {
        console.log(`One document was inserted with the id ${result.upsertedId._id}`);
    } else {
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    }
}

async function updateAllListingsToHavePropertyType(client) {
    result = await client.db(DATABASE_NAME).collection("eng_dictionary")
                        .updateMany({ property_type: { $exists: false } }, 
                                    { $set: { property_type: "Unknown" } });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function deleteAll(client) {
    result = await client.db(DATABASE_NAME).collection("eng_dictionary").deleteMany({})
    console.log(`delete All result : ${result["result"]}`);
}

async function deleteListingByName(client, nameOfListing) {
    result = await client.db(DATABASE_NAME).collection("eng_dictionary")
         .deleteOne({ name: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function deleteListingsScrapedBeforeDate(client, date) {
    result = await client.db(DATABASE_NAME).collection("eng_dictionary")
        .deleteMany({ "last_scraped": { $lt: date } });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function main(){
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
 
    try {
        // Connect to the MongoDB cluster
        await client.connect()

        if (FLAG === 0){
            readMetadataAndRegister(METADATA_PATH)

            // Replace data in the data folder to mongoDB or Create new
            for(let i = 0; i < motherJson.length; ++i){
                result = await client.db(DATABASE_NAME).collection(DICTIONARY_COLLECTION).findOne({ _id: motherJson[i]['_id'] });
            
                // console.log(motherJson[i])
                if (result) {
                    await replaceListing(client, motherJson[i], DICTIONARY_COLLECTION)
                } else {
                    await createListing(client, motherJson[i], DICTIONARY_COLLECTION)
                }
            }

            registerVideo(client)

            for(let i = 0; i < videoJson.length; ++i){
                result = await client.db(DATABASE_NAME).collection(VIDEO_COLLECTION).findOne({ _id: videoJson[i]['_id'] });
                // console.log(result)
                if (result) {
                    await replaceListing(client, videoJson[i], VIDEO_COLLECTION)
                } else {
                    await createListing(client, videoJson[i], VIDEO_COLLECTION)
                }
            }
        }
        else if (FLAG === 1){
            await findListingBy(client, DICTIONARY_COLLECTION)
        }

        // caution!!! Delite All Query
        // await deleteAll(client)

    } catch (e) {
        console.error(e)
    } finally {
        if (FLAG === 0) {
            await client.close()
        }
    }
}

main().catch(console.error)