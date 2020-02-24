// expres
const express = require('express')
const app = express()

// third-party
const compression = require('compression')
const bodyParser = require('body-parser')
const helmet = require('helmet')

// built-in
const fs = require('fs')
const {MongoClient} = require('mongodb');
const path = require('path')

// custom
// const dataLoader = require('../feature/dataLoader.js')
// const dataLoaderInst = new dataLoader()
// const mongoClient = require('../feature/mongoClient.js')
// const mongoClientInst = new mongoClient()

// heroku
const PORT = process.env.PORT || 5100

// middlewares
app.use(express.static('public'))
app.use(helmet())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}))
app.use(compression())

last_index = 0
indexTable = {}

METADATA_PATH = "dictionary_data"
ARCHIVE_PATH = "dictionary_archive"

TABLE_PATH = './'
PASSWORD = fs.readFileSync("./pw.txt", "utf8")

DATABASE_NAME = "sensebe_dictionary"
DICTIONARY_COLLECTION = "eng_dictionary"

REDIRECTION_TABLE_FILE = "redirectionTable.json"
DB_INDEX_TABLE_FILE = 'rootIndexTable.json'

function speechTemplate(idx) {
    return `
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="verb">verb</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="auxiliary verb">auxiliary verb</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="phrasal verb">phrasal verb</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="modal verb">modal verb</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="adjective">adjective</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="adverb">adverb</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="conjunction">conjunction</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="noun">noun</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="pronoun">pronoun</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="preposition">preposition</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="determiner">determiner</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="phrase">phrase</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="idiom">idiom</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="exclamation">exclamation</label>`
}

function preSearch(req, res) {
    const searchTarget = req.query.target
    filelist = fs.readdirSync('./dictionary_archive')
    var responseData = []
    const exp = new RegExp(searchTarget)

    filelist.forEach(element => {
        fileName = element.split('.')[0]
        if (fileName.match(exp))
            responseData.push({
                "search" : fileName
            })
    });

    res.json(responseData);
}

function search(req, res) {
    const searchTarget = req.query.target
    const autocomplete = fs.readFileSync("./metadata/script_autocomplete.js", 'utf8')
    const filelist = fs.readdirSync(ARCHIVE_PATH)
    var file, json
    for (let idx = 0; idx < filelist.length; ++idx){
        fileName = filelist[idx].split('.')[0]
        if (fileName === searchTarget) {
            file = fileName
            break
        }
    }

    if (file) {
        file = fs.readFileSync('./dictionary_archive/'+searchTarget.split('.')[0]+'.json', 'utf8')
        json = JSON.parse(file)
    }

    var template = ''

    template += `
  <!doctype html>
  <html>
    <head>
      <title>Data Management Tool</title>
      <meta charset="utf-8">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
      <script src="https://unpkg.com/@trevoreyre/autocomplete-js"></script>
      <script src="./js/search.js"></script>
      <script src="./js/general.js"></script>
      <script src="./js/serializeObject.js"></script>
      <link rel="stylesheet" type="text/css" href="./style/autocomplete.css">
    </head>
    <body>
        <nav id="search_group">
            <div class="sgroup">
                <form class="search" action="/search" style="overflow:visible;display:inline-flex" data-submitfalse="q" method="GET" role="search">
                    <div id="autocomplete" class="autocomplete" >
                        <input class="autocomplete-input" name="target" maxlength="2048" type="text" aria-autocomplete="both" aria-haspopup="false" autocapitalize="off" autocomplete="off" autocorrect="off" role="combobox" spellcheck="false" title="검색" aria-label="검색"/>
                        <ul class="autocomplete-result-list"></ul>
                    </div>

                    <div class="item_btn">
                        <input class="btn search_btn" value="Agjak 검색" aria-label="Agjak 검색" name="btnK" type="submit">
                    </div>
                </form>
            </div>
        </nav> <!-- search_group -->
        <div>
            <form class="insert" id="insert" action="/insert" style="overflow:visible;display:block" data-submitfalse="q" method="GET" role="search">
                <br>
                <div id="root">`
    if (file) {
        template +=`
                    root : <input name="root" type="text" value="${json["root"]}"/>`
    } else {
        template +=`
                    root : <input name="root" type="text"/>`
    }

    template += `
                </div>
                <div id="from">`

    if (file) {
        json["from"].forEach(function (elm, idx) {
            template += `
                    <div id="from_${idx}">
                        from : <input name="from[${idx}]" type="text" value="${elm}"/>
                    </div>
            `
        })
    } else {
        template += `
                    <div id="from_0">
                        <!-- from : <input name="from[0]" type="text"/> -->
                    </div>`
    }
    template +=`
                </div>
                <button type="button" class="btn" id="btn_add_from" onclick="onClickAddFrom()">add from</button>
                <button type="button" class="btn" id="btn_del_from" onclick="onClickDelFrom()">del from</button>
                <div id="redirection">`
    if (file) {
        template +=`
                    redirection : <input name="redirection" type="text" value="${json["redirection"]}"/>`
    } else {
        template +=`
                    redirection : <input name="redirection" type="text"/>`
    }
    template += `
                </div>
                <div id=data>`
    if (file) {
        json["data"].forEach(function (data, idx) {
            template += `
                    <div id=data_${idx}>
                        <div> data_${idx}_usage : <input name="data[${idx}][_usage]" type="text" value="${data["_usage"]}"/> </div>
                        <div> data_${idx}_speech : `
            template += speechTemplate(idx)
            template += `
                            <script>`

            data["_speech"].forEach(function (speech, _idx) {
                template += `
                                    $("input:checkbox[name='data[${idx}][_speech][]']:checkbox[value='${speech}']").prop('checked', true)`
            })

            template += `
                            </script>
                        </div>
                        <div id=data_${idx}_chunk>`
            data["_chunks"].forEach(function (chunk, _idx) {
                template += `
                            <div id=data_${idx}_chunk_${_idx}> data_${idx}_chunk : <input name="data[${idx}][_chunks][${_idx}]" type="text" value="${chunk}"/> </div>`
            })
            template += `
                        </div>
                        <button type="button" class="btn" id="btn_add_chunk" onclick="onClickAddChunk(this)" value="${idx}">add chunk</button>
                        <button type="button" class="btn" id="btn_del_chunk" onclick="onClickDelChunk(this)" value="${idx}">del chunk</button>
                        <div>data_${idx}_video : <input name="data[${idx}][_video]" type="text" value="${data["_video"]}"/></div>
                    </div>
                </div>`
        })
    } else {
        template += `
                    <div id=data_0>
                        <div> data_0_usage : <input name="data[0][_usage]" type="text"/> </div>
                        <div> data_0_speech : `
        template += speechTemplate(0)
        template += `
                        </div>
                        <div id=data_0_chunk>
                            <!--<div id=data_0_chunk_0> data_0_chunk : <input name="data[0][_chunks][0]" type="text"/> </div>-->
                        </div>
                        <button type="button" class="btn" id="btn_add_chunk" onclick="onClickAddChunk(this)" value="0">add chunk</button>
                        <button type="button" class="btn" id="btn_del_chunk" onclick="onClickDelChunk(this)" value="0">del chunk</button>
                        <div>data_0_video : <input name="data[0][_video]" type="text"/></div>
                    </div>
                </div>`
    }

        template += `
                <button type="button" class="btn" id="btn_add_data" onclick="onClickAddData()">add data</button>
                <button type="button" class="btn" id="btn_del_data" onclick="onClickDelData()">del data</button>
                <div class="item_btn">
                    <input class="btn" id="insert_btn" value="insert" type="submit">
                    <button type="button" class="btn" id="btn_home" onclick="onClickHome()">Home</button>
                </div>
            </form>
        </div>
    </body>
    <script>
        function onClickAddFrom(){
            from = document.getElementById('from')
            len = from.children.length

            let div = document.createElement('div')
            div.setAttribute('id', 'from_'+len)
            div.innerHTML = 'from : <input name="from[]" type="text"/>'
            from.appendChild(div);
        }

        function onClickDelFrom(){
            from = document.getElementById('from')
            len = from.children.length - 1
            child = document.getElementById('from_'+len)
            from.removeChild(child);
        }

        function onClickAddChunk(elm){
            idx = elm.getAttribute("value")
            chunk = document.getElementById('data_'+idx+'_chunk')
            len = chunk.children.length

            let div = document.createElement('div')
            div.setAttribute("id", "data_"+idx+"_chunk_"+len)
            div.innerHTML = 'data_'+idx+'_chunk : <input name="data['+idx+'][_chunks]['+len+']" type="text"/>'
            chunk.appendChild(div)
        }

        function onClickDelChunk(elm){
            idx = elm.getAttribute("value")
            chunk = document.getElementById('data_'+idx+'_chunk')
            len = chunk.children.length -1

            child = document.getElementById('data_'+idx+'_chunk_'+len)
            chunk.removeChild(child);
        }

        function onClickAddData(){
            data = document.getElementById('data')
            len = $("#data > div").length
            let div = document.createElement('div')
            div.setAttribute("id","data_"+len);
            div.innerHTML += '<div> data_'+len+'_usage : <input name="data['+len+'][_usage]" type="text"/> </div>'
            div.innerHTML += '<div> data_'+len+'_speech : </div>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="verb">verb</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="auxiliary verb">auxiliary verb</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="phrasal verb">phrasal verb</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="modal verb">modal verb</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="adjective">adjective</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="adverb">adverb</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="conjunction">conjunction</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="noun">noun</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="pronoun">pronoun</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="preposition">preposition</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="determiner">determiner</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="phrase">phrase</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="idiom">idiom</label>'
            div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="exclamation">exclamation</label>'
            div.innerHTML += '</div>'
            div.innerHTML += '<div id="data_'+len+'_chunk"> </div>'
            // div.innerHTML += '<div id="data_'+len+'_chunk"> <div id="data_'+len+'_chunk_0"> data_'+len+'_chunk : <input name="data['+len+'][_chunks][]" type="text"/> </div></div>'
            div.innerHTML += '<button type="button" class="btn" id="btn_add_chunk" onclick="onClickAddChunk(this)">add chunk</button>'
            div.innerHTML += '<button type="button" class="btn" id="btn_del_chunk" onclick="onClickDelChunk(this)">del chunk</button>'
            div.innerHTML += '<div>data_'+len+'_video : <input name="data['+len+'][_video]" type="text"/></div>'
            btn_add_chunk = div.querySelector("#btn_add_chunk")
            btn_add_chunk.setAttribute("value",len)
            btn_del_chunk = div.querySelector("#btn_del_chunk")
            btn_del_chunk.setAttribute("value",len)
            data.appendChild(div);
        }

        function onClickDelData(){
            data = document.getElementById('data')
            len = $("#data > div").length - 1

            child = document.getElementById('data_'+len)
            data.removeChild(child);
        }

        function onClickHome(){
            location.href = '/'
        }

        var test = $('form#insert').serializeObject()
        //=> {user: {email: "jsmith@example.com", pets: ["cat", "dog"]}}
        ${autocomplete}
    </script>
</html>`

    res.send(template)
}

async function insert(req, res) {
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

    autocomplete = fs.readFileSync("./metadata/script_autocomplete.js", 'utf8')
    const query = req.query

    if (query["from"] === undefined)
        query["from"] = []

    data = query["data"]
    data.forEach(function (_data, idx) {
        if (_data["_chunks"] === undefined)
            query["data"][idx]["_chunks"] = []
    })

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        fs.writeFileSync(path.join(__dirname, ARCHIVE_PATH, query["root"]+'.json'), JSON.stringify(query, null, "\t"), "utf-8")
        setId(query)

        result = await client.db(DATABASE_NAME).collection(DICTIONARY_COLLECTION).findOne({ _id: query['_id'] });
    
        if (result) await replaceListing(client, query, DICTIONARY_COLLECTION)
        else await createListing(client, query, DICTIONARY_COLLECTION)

        // await findListingBy(client, DICTIONARY_COLLECTION)

        // caution!!! Delite All Query
        // await deleteAll(client)

    } catch (e) {
        console.error(e)
    } finally {
        await client.close()

        var template = `
        <!doctype html>
        <html>
        <head>
            <title>Data Management Tool</title>
            <meta charset="utf-8">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
            <script src="https://unpkg.com/@trevoreyre/autocomplete-js"></script>
            <script src="./js/search.js"></script>
            <script src="./js/general.js"></script>
            <link rel="stylesheet" type="text/css" href="./style/autocomplete.css">
        </head>
        <body>
            <nav id="search_group">
                <div class="sgroup">
                    <form class="search" action="/search" style="overflow:visible;display:inline-flex" data-submitfalse="q" method="GET" role="search">
                        <div id="autocomplete" class="autocomplete" >
                            <input class="autocomplete-input" name="target" maxlength="2048" type="text" aria-autocomplete="both" aria-haspopup="false" autocapitalize="off" autocomplete="off" autocorrect="off" role="combobox" spellcheck="false" title="검색" aria-label="검색"/>
                            <ul class="autocomplete-result-list"></ul>
                        </div>
    
                        <div class="item_btn">
                            <input class="btn" id="search_btn" value="Agjak 검색" aria-label="Agjak 검색" name="btnK" type="submit">
                            <button type="button" class="btn" id="btn_home" onclick="onClickHome()">Home</button>
                        </div>
                    </form>
                </div>
            </nav> <!-- search_group -->
        </body>
        <script>
            ${autocomplete}
        
            function onClickHome(){
                location.href = '/'
            }
        </script>
    </html>`
    
        res.send(template)
    }
}

app.get('/preSearch', (req, res) => preSearch(req, res))
app.get('/search', (req, res) => search(req, res))
app.get('/insert', (req, res) => insert(req, res)) 

// Home
app.get('/', function(req, res) {
    autocomplete = fs.readFileSync("./metadata/script_autocomplete.js", 'utf8')
    var template = `
  <!doctype html>
  <html>
    <head>
      <title>Data Management Tool</title>
      <meta charset="utf-8">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
      <script src="https://unpkg.com/@trevoreyre/autocomplete-js"></script>
      <script src="./js/search.js"></script>
      <script src="./js/general.js"></script>
      <link rel="stylesheet" type="text/css" href="./style/autocomplete.css">
    </head>
    <body>
        <nav id="search_group">
            <div class="sgroup">
                <form class="search" action="/search" style="overflow:visible;display:inline-flex" data-submitfalse="q" method="GET" role="search">
                    <div id="autocomplete" class="autocomplete" >
                        <input class="autocomplete-input" name="target" maxlength="2048" type="text" aria-autocomplete="both" aria-haspopup="false" autocapitalize="off" autocomplete="off" autocorrect="off" role="combobox" spellcheck="false" title="검색" aria-label="검색"/>
                        <ul class="autocomplete-result-list"></ul>
                    </div>

                    <div class="item_btn">
                        <input class="btn" id="search_btn" value="Agjak 검색" aria-label="Agjak 검색" name="btnK" type="submit">
                        <button type="button" class="btn" id="btn_home" onclick="onClickHome()">Home</button>
                    </div>
                </form>
            </div>
        </nav> <!-- search_group -->
    </body>
    <script>
        ${autocomplete}
        
        function onClickHome(){
            location.href = '/'
        }
    </script>
</html>`

    res.send(template)
})

app.use(function(req, res, next) {
    res.status(404)
    res.send("something wrong!")

    console.log("something wrong! req.url : " + req.url)
});

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

try {
    app.listen(PORT, () => console.log(`agjac on port ${PORT}!`))
} catch (e) {
    console.error(e)
} finally {
    // mongoClientInst.close()
}

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
    }
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