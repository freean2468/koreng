//
// a tool for a data insertion to the video_collection in MOngoDB
//

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
        if (fileName.match(exp)) {
            responseData.push({
                "search" : fileName
            })
        } else {
            const content = JSON.parse(fs.readFileSync(VIDEO_ARCHIVE_PATH+"/"+element, "utf8"))
            for (let idx = 0; idx < content["text"].length; ++idx){
                const sentence = content["text"][idx]

                if (sentence.toLowerCase().match(exp)){
                    responseData.push({
                        "search" : fileName
                    })
                    continue
                }
            }
        }
    });

    res.json(responseData);
}

function baseTemplate() {
    const autocomplete = fs.readFileSync("./metadata/script_vid_autocomplete.js", 'utf8')
    var base = `
    <!doctype html>
    <html>
    <head>
        <title>Data Management Tool</title>
        <meta charset="utf-8">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
        <script src="https://unpkg.com/@trevoreyre/autocomplete-js"></script>
        <script src="./js/general.js"></script>
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
            </section>
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
    var nav = `<ul> videos : ${list.length}`

    for(let item in list) {
        let filename = list[item].split('.')[0]
        nav += `<li><a id="${filename}" href="http://localhost:${PORT}/search?target=${filename}">${filename}</a></li>
        <script type="text/javascript">
            var prevPage = window.location.href
            var a = document.getElementById("${filename}")
            if (a.href === prevPage) {
                a.setAttribute("class", "onActive")
                a.parentElement.setAttribute("class", "onActive")
            }
        </script>`
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
            <form class="insert" id="insert" action="/insert" style="overflow:visible;display:block" data-submitfalse="q" method="POST" role="search">
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
            let literal = '', pharaphrase = '', start_timestamp = '', end_timestamp = ''
            if (json["literal"] !== undefined){
                literal = json["literal"][idx]
            }
            if (json["pharaphrase"] !== undefined){
                pharaphrase = json["pharaphrase"][idx]
            }
            if (json["start_timestamp"] !== undefined){
                start_timestamp = json["start_timestamp"][idx]
            }
            if (json["end_timestamp"] !== undefined){
                end_timestamp = json["end_timestamp"][idx]
            }
            template += `
                    <div class="context">
                        <span id="ip_start_timestamp_${idx}">
                            start_timestamp[${idx}] <input class="ip_time" type="text" name="start_timestamp[${idx}]" value="${start_timestamp}">
                        </span>
                        <span id="ip_end_timestamp_${idx}">
                            end_timestamp[${idx}] <input class="ip_time" type="text" name="end_timestamp[${idx}]" value="${end_timestamp}">
                        </span>
                        <div id="text_${idx}">
                            text[${idx}] : <textarea name="text[${idx}]">${elm}</textarea>
                        </div>
                        <div class="ta_literal" id="literal_${idx}">
                            literal[${idx}] : <textarea name="literal[${idx}]">${literal}</textarea>
                        </div>
                        <div class="ta_pharaphrase" id="pharaphrase${idx}">
                            pharaphrase[${idx}] : <textarea name="pharaphrase[${idx}]">${pharaphrase}</textarea>
                        </div>
                    </div>
            `
        })
    } else {
        template += `
                    <div class="context">
                        <div id="ip_start_timestamp_0">
                            start_timestamp[0] <input class="ip_time" type="text" name="start_timestamp[0]">
                        </div>
                        <div id="ip_end_timestamp_0">
                            end_timestamp[0] <input class="ip_time" type="text" name="end_timestamp[0]">
                        </div>
                        <div id="text_0">
                            text[0] : <textarea name="text[0]"></textarea>
                        </div>
                        <div class="ta_literal" id="literal_0">
                            literal[0] : <textarea name="literal[0]"></textarea>
                        </div>
                        <div class="ta_pharaphrase" id="pharaphrase_0">
                            pharaphrase[0] : <textarea name="pharaphrase[0]"></textarea>
                        </div>
                    </div>`
    }
    template +=`
                </div>
                <button type="button" class="btn" id="btn_add_text" onclick="onClickAddTexts()">add texts</button>
                <button type="button" class="btn" id="btn_del_text" onclick="onClickDelTexts()">del texts</button>
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
        function onClickAddTexts(){
            text = document.getElementById('text')
            len = text.children.length

            let div = document.createElement('div')
            div.setAttribute('class', "context")
            div.innerHTML = '<div id="ip_start_timestamp_' + len + '">start_timestamp : <input class="ip_time" type="text" name="start_timestamp[]"></div>'
            div.innerHTML += '<div id="ip_end_timestamp_' + len + '">end_timestamp : <input class="ip_time" type="text" name="end_timestamp[]"></div>'
            div.innerHTML += '<div id="text_' + len + '">text : <textarea name="text[]"></textarea></div>'
            div.innerHTML += '<div class="ta_literal" id="literal_' + len + '">literal : <textarea name="literal[]"></textarea></div>'
            div.innerHTML += '<div class="ta_pharaphrase" id="pharaphrase_' + len + '">pharaphrase : <textarea name="pharaphrase[]"></textarea></div>'
            text.appendChild(div);
        }

        function onClickDelTexts(){
            text = document.getElementById('text')
            len = text.children.length - 1
            child = document.getElementById('text_'+len)
            text.removeChild(child);

            // literal = document.getElementById('literal')
            // len = literal.children.length - 1
            // child = document.getElementById('literal_'+len)
            // literal.removeChild(child);
            
            // pharaphrase = document.getElementById('pharaphrase')
            // len = pharaphrase.children.length - 1
            // child = document.getElementById('pharaphrase'+len)
            // pharaphrase.removeChild(child);
        }

        function onClickHome(){
            location.href = '/'
        }

    </script>`

    baseTem = baseTem.replace('<!-- SEARCH -->', template)

    res.send(baseTem)
}

async function insert(req, res) {
    console.log('[insert!]')
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    autocomplete = fs.readFileSync("./metadata/script_vid_autocomplete.js", 'utf8')
    const query = req.body

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = undefined
        
        if (query['_id']) 
            result = await client.db(DATABASE_NAME).collection(VIDEO_COLLECTION).findOne({ _id: query['_id'] });
            
        if (result) {
            await replaceListing(client, query, VIDEO_COLLECTION)
            _id = query["_id"]
            delete query["_id"]
            console.log('[_ID] ',_id)
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
app.post('/insert', (req, res) => insert(req, res)) 

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