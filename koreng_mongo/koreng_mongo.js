const {MongoClient} = require('mongodb');
const fs = require('fs')
const path = require('path')

indexTable = {}
motherJson = []
METADATA_PATH = "data"
TABLE_PATH = './'
PASSWORD = fs.readFileSync("./pw.txt", "utf8")

// 1 : find
// 0 : register
FLAG = 0

function setId(json){
    table = fs.readFileSync(path.join(__dirname, 'wordsetIndexTable.json'), "utf-8")

    // console.log('tableData : ', table)
    indexTable = JSON.parse(table)
    // console.log('json form : \n',indexTable)
    
    if(indexTable[json['_wordset']] === undefined){
        _id = Object.keys(indexTable).length
        // console.log(Object.keys(indexTable).length)
        indexTable[json['_wordset']]=_id
        json['_id'] = _id

        fs.writeFileSync(path.join(__dirname, 'wordsetIndexTable.json'), JSON.stringify(indexTable), "utf-8")
    } else {
        json['_id'] = indexTable[json['_wordset']]
    }
    console.log(`json['_id'] : ${json['_id']}, wordset : ${json['_wordset']}`)
}

function readMetadataAndRegister(folder){
    files = fs.readdirSync(path.join(__dirname, folder), "utf-8")

    files.forEach(function(filename){
        if (filename.split('.').pop() == 'json') {
            fileData = fs.readFileSync(path.join(__dirname, folder, filename), "utf-8")

            // console.log('file name : ', filename)
            json = JSON.parse(fileData)
            // console.log('json form : \n',json)
            setId(json)

            motherJson.push(json)
    
            fs.rename(path.join(__dirname, folder, filename), path.join(__dirname, 'archive', filename), (err)=>{
                if(err) throw err
            });
        }
    })
}

async function createListing(client, newListing){
    const result = await client.db("koreng_dictionary").collection("eng_dictionary").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}(${newListing['_wordset']})`);
}

async function createMultipleListings(client, newListings){
    const result = await client.db("koreng_dictionary").collection("eng_dictionary").insertMany(newListings);
 
    console.log(`${result.insertedCount} new listing(s) created with the following id(s):${result.insertedIds}`);
}

async function findOneListingById(client, idOfListing) {
    result = await client.db("koreng_dictionary").collection("eng_dictionary").findOne({ _id: idOfListing });
 
    if (result) {
        console.log(`Found a listing in the collection with the _id '${idOfListing}':${result['_wordset']}`);
        // console.log(result);
    } else {
        console.log(`No listings found with the _id '${idOfListing}'`);
    }
}

async function findListingBy(client) {
    const col = await client.db("koreng_dictionary").collection("eng_dictionary");
    col.find({
        "_data.0.__usage":{
            $elemMatch:{
                ___meaningPeace:{$exists:true}
            }
        }
    }).toArray(function(err, doc) {
        // console.log(doc)
        var list = ''
        var count = 0
        doc.forEach(function (item){
            list += item["_wordset"] + '\n'
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
    const cursor = client.db("koreng_dictionary").collection("eng_dictionary")
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

async function replaceListing(client, listing) {
    result = await client.db("koreng_dictionary").collection("eng_dictionary").replaceOne({
        _id : listing['_id']
    }, 
    {
        $set: listing
    });
    
    // console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`_id : ${listing['_id']}, for "${listing["_wordset"]}" replaced : matchedCount(${result.matchedCount}), modiefiedCount(${result.modifiedCount})`);
}

async function updateListingByName(client, nameOfListing, updatedListing) {
    result = await client.db("koreng_dictionary").collection("eng_dictionary")
                        .updateOne({ name: nameOfListing }, { $set: updatedListing });
 
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function upsertListingByName(client, nameOfListing, updatedListing) {
    result = await client.db("koreng_dictionary").collection("eng_dictionary")
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
    result = await client.db("koreng_dictionary").collection("eng_dictionary")
                        .updateMany({ property_type: { $exists: false } }, 
                                    { $set: { property_type: "Unknown" } });
    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

async function deleteAll(client) {
    result = await client.db("koreng_dictionary").collection("eng_dictionary").deleteMany({})
    console.log(`delete All result : ${result["result"]}`);
}

async function deleteListingByName(client, nameOfListing) {
    result = await client.db("koreng_dictionary").collection("eng_dictionary")
         .deleteOne({ name: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function deleteListingsScrapedBeforeDate(client, date) {
    result = await client.db("koreng_dictionary").collection("eng_dictionary")
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
            await readMetadataAndRegister(METADATA_PATH)

            // Replace data in the data folder to mongoDB or Create new
            for(let i = 0; i < motherJson.length; ++i){
                result = await client.db("koreng_dictionary").collection("eng_dictionary").findOne({ _id: motherJson[i]['_id'] });
            
                // console.log(motherJson[i])
                if (result) {
                    await replaceListing(client, motherJson[i])
                } else {
                    await createListing(client, motherJson[i])
                }
            }
        }
        else if (FLAG === 1){
            await findListingBy(client)
        }

        // caution!!! Delite All Query
        // await deleteAll(client)

    } catch (e) {
        console.error(e)
    } finally {
        if (FLAG === 0) {
            await client.close()
            
            fs.copyFile(path.join(__dirname, 'wordsetIndexTable.json'), path.join(__dirname, '..', 'wordsetIndexTable.json'), (err)=>{
                if(err) throw err
                console.log('table copied to ', path.join(__dirname, '..', 'koreng', 'wordsetIndexTable.json'))
            });
        }
    }
}

main().catch(console.error)