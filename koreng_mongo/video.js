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
const PORT = process.env.PORT || 5200

// middlewares
app.use(express.static('public'))
app.use(helmet())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}))
app.use(compression())

last_index = 0
indexTable = {}
videoJson = []

VIDEO_DATA_PATH = "video_data"
VIDEO_ARCHIVE_PATH = "video_archive"

TABLE_PATH = './'
PASSWORD = fs.readFileSync("./pw.txt", "utf8")

DATABASE_NAME = "sensebe_dictionary"
VIDEO_COLLECTION = "video_collection"

function preSearch(req, res) {
    const searchTarget = req.query.target
    filelist = fs.readdirSync(VIDEO_ARCHIVE_PATH)
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

function baseTemplate() {
    const autocomplete = fs.readFileSync("./metadata/script_autocomplete.js", 'utf8')
    var base = `
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
        <div class="container">
            <header id="search_group">
                <div class="sgroup">
                    <form class="search" action="/search" style="overflow:visible;display:inline-flex" data-submitfalse="q" method="GET" role="search">
                        <div id="autocomplete" class="autocomplete" >
                            <input class="autocomplete-input" name="target" maxlength="2048" type="text" aria-autocomplete="both" aria-haspopup="false" autocapitalize="off" autocomplete="off" autocorrect="off" role="combobox" spellcheck="false" title="검색" aria-label="검색"/>
                            <ul class="autocomplete-result-list"></ul>
                        </div>

                        <div class="item_btn">
                            <input class="btn" id="search_btn" value="검색" aria-label="검색" name="btnK" type="submit">
                            <button type="button" class="btn" id="btn_home" onclick="onClickHome()">Home</button>
                        </div>
                    </form>
                </div>
            </header><!-- search_group -->
            <section class="content">
                <nav>
                    <!-- NAV -->
                </nav>
                <main>
                    <!-- SEARCH -->
                </main>
            </section
        </div>
    </body>
    <script>
        ${autocomplete}
    </script>
    </html>
    `

    base = base.replace('<!-- NAV -->', navTemplate())

    return base
}

function navTemplate() {
    const list = fs.readdirSync('video_archive')
    var nav = `<ul>`

    for(let item in list) {
        let filename = list[item].split('.')[0]
        nav += `<li><a href="http://localhost:${PORT}/search?target=${filename}">${filename}</a></li>`
    }
    nav += `
    </ul>
    `
    return nav
}

function search(req, res) {
    const searchTarget = req.query.target
    const autocomplete = fs.readFileSync("./metadata/script_vid_autocomplete.js", 'utf8')
    const filelist = fs.readdirSync(VIDEO_ARCHIVE_PATH)
    var file, json
    for (let idx = 0; idx < filelist.length; ++idx){
        fileName = filelist[idx].split('.')[0]
        if (fileName === searchTarget) {
            file = fileName
            break
        }
    }

    if (file) {
        file = fs.readFileSync(VIDEO_ARCHIVE_PATH+'/'+searchTarget.split('.')[0]+'.json', 'utf8')
        json = JSON.parse(file)
        json["_id"] = searchTarget.split('.')[0]
    }

    var baseTem = baseTemplate()

    var template = `
        <div>
            <form class="insert" id="insert" action="/insert" style="overflow:visible;display:block" data-submitfalse="q" method="GET" role="search">
                <br>`
    if (file) {
        template += `
                <div id="root">
                    _id : <input name="_id" type="text" value="${json["_id"]}"/>
                </div>`
    }
    template += `
                <div id="source">`
    if (file) {
        template +=`
                    source : 
                    <label><input type="radio" name="source" value="The Witcher III : Wild Hunter">The Witcher III : Wild Hunter</label>
                    <script>
                        $("input:radio[name='source']:radio[value='${json["source"]}']").prop('checked', true)
                    </script>`
    } else {
        template +=`
                    source : <label><input type="radio" name="source" value="The Witcher III : Wild Hunter">The Witcher III : Wild Hunter</label>`
    }

    template += `
                </div>
                <div id="text">`

    if (file) {
        json["text"].forEach(function (elm, idx) {
            template += `
                    <div id="text_${idx}">
                    text : <input name="text[${idx}]" type="text" value="${elm}"/>
                    </div>
            `
        })
    } else {
        template += `
                    <div id="text_0">
                    text : <input name="text[0]" type="text"/>
                    </div>`
    }
    template +=`
                </div>
                <button type="button" class="btn" id="btn_add_text" onclick="onClickAddtext()">add text</button>
                <button type="button" class="btn" id="btn_del_text" onclick="onClickDeltext()">del text</button>
                <div id="link">`
    if (file) {
        template +=`
                    link : <input name="link" type="text" value="${json["link"]}"/>`
    } else {
        template +=`
                    link : <input name="link" type="text"/>`
    }
    template += `
                </div>
                <div class="item_btn">
                    <input class="btn" id="insert_btn" value="insert" type="submit">
                    <button type="button" class="btn" id="btn_home" onclick="onClickHome()">Home</button>
                </div>
            </form>
        </div>
    </body>
    <script>
        function onClickAddtext(){
            text = document.getElementById('text')
            len = text.children.length

            let div = document.createElement('div')
            div.setAttribute('id', 'text_'+len)
            div.innerHTML = 'text : <input name="text[]" type="text"/>'
            text.appendChild(div);
        }

        function onClickDeltext(){
            text = document.getElementById('text')
            len = text.children.length - 1
            child = document.getElementById('text_'+len)
            text.removeChild(child);
        }

        function onClickHome(){
            location.href = '/'
        }

    </script>`

    baseTem = baseTem.replace('<!-- SEARCH -->', template)

    res.send(baseTem)
}

async function insert(req, res) {
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    autocomplete = fs.readFileSync("./metadata/script_vid_autocomplete.js", 'utf8')
    const query = req.query

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = undefined
        
        if (query['_id']) 
            result = await client.db(DATABASE_NAME).collection(VIDEO_COLLECTION).findOne({ _id: query['_id'] });

        // console.log(result)
        if (result) {
            await replaceListing(client, query, VIDEO_COLLECTION)
            _id = query["_id"]
            delete query["_id"]
            fs.writeFileSync(path.join(__dirname, VIDEO_ARCHIVE_PATH, _id+'.json'), JSON.stringify(query, null, "\t"), "utf-8")
        } else {
            fs.writeFileSync(path.join(__dirname, VIDEO_ARCHIVE_PATH, query["link"]+'.json'), JSON.stringify(query, null, "\t"), "utf-8")
            query['_id'] = query["link"]
            await createListing(client, query, VIDEO_COLLECTION)
        }
    } catch (e) {
        console.error(e)
    } finally {
        await client.close()

        var template = baseTemplate()
    
        res.send(template)
    }
}

app.get('/preSearch', (req, res) => preSearch(req, res))
app.get('/search', (req, res) => search(req, res))
app.get('/insert', (req, res) => insert(req, res)) 

// Home
app.get('/', function(req, res) {
    autocomplete = fs.readFileSync("./metadata/script_vid_autocomplete.js", 'utf8')
    var template = baseTemplate()

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

async function createListing(client, newListing, collection){
    const result = await client.db(DATABASE_NAME).collection(collection).insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}(${newListing['link']})`);
}

async function replaceListing(client, listing, collection) {
    result = await client.db(DATABASE_NAME).collection(collection).replaceOne({
        _id : listing['_id']
    }, 
    {
        $set: listing
    });
    
    // console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`_id : ${listing['_id']}, for "${listing["link"]}" replaced : matchedCount(${result.matchedCount}), modiefiedCount(${result.modifiedCount})`);
}