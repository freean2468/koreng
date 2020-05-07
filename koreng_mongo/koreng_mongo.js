//
// a tool for a data insertion to the eng_dictionary collection in MOngoDB
//

// expres
const express = require('express')
const app = express()

// third-party
const compression = require('compression')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const fetch = require("node-fetch")

// built-in
const fs = require('fs')
const {MongoClient} = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const path = require('path')

const SERVICE_SERVER_URL = "https://www.sensebedictionary.org"
const LOCAL_SERVER_URL = "http://localhost:5000"
const PORT = 5100

// middlewares
app.use(express.static('public'))
app.use(helmet())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}))
app.use(bodyParser.json())
app.use(compression())

last_index = 0
indexTable = {}

const METADATA_PATH = "dictionary_data"
const ARCHIVE_PATH = "dictionary_archive"

const TABLE_PATH = './'
const PASSWORD = fs.readFileSync("./pw.txt", "utf8")

const DATABASE_NAME = "sensebe_dictionary"
const DICTIONARY_COLLECTION = "eng_dictionary"

const REDIRECTION_TABLE_FILE = "redirectionTable.json"
const DB_INDEX_TABLE_FILE = 'rootIndexTable.json'
const TAG_TABLE_FILE = 'tagTable.json'

// called from search()
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
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="predeterminer">predeterminer</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="determiner">determiner</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="phrase">phrase</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="idiom">idiom</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="exclamation">exclamation</label>
    <label><input type="checkbox" name="data[${idx}][_speech][]" value="number">number</label>`
}

// called from search(), /, insert() 
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
                            <button type="button" class="btn btn_home" onclick="onClickHome()">Home</button>
                        </div>
                    </form>

                    <form id="genSiteMap" action="/genSiteMap" style="overflow:visible;display:block" data-submitfalse="q" method="GET">  
                        <input class="btn" id="sitemap_btn" value="genSiteMap" type="submit">
                    </form>
                </div>
            </header>
            <section class="content">
                <nav id="left_nav">
                    <!-- NAV -->
                </nav>
                <main>
                    <!-- SEARCH -->
                    <!-- TRANSACTION -->
                </main>
            </section>
        </div>
    </body>
    <script>
        function onClickHome(){
            location.href = '/'
        }
        
        ${autocomplete}
    </script>
    </html>
    `

    base = base.replace('<!-- NAV -->', navTemplate())
    base = base.replace('<!-- TRANSACTION -->', transactionTemplate())

    return base
}

function transactionTemplate() {
    var template = `
    <div>
        <form id="findByIdType" action="/findByIdType" style="overflow:visible;display:block" data-submitfalse="q" method="GET">
            <br>
                findByIdType : <input name="findByIdType" type="text"/>
                // <input class="btn btn_transaction" id="find_btn" value="find" align="right" type="submit">
        </form>
    </div>`

    return template
}

// called from baseTemplate()
function navTemplate() {
    const list = fs.readdirSync('dictionary_archive')
    var nav = `<ul>volumes : ${list.length}`

    for(let item in list) {
        let filename = list[item].split('.')[0]
        nav += `
        <li><a id="a_${filename}" href="http://localhost:${PORT}/search?target=${filename}">${filename}</a></li>
        <script type="text/javascript">
            var prevPage = document.referrer
            var pp = window.location.href
            var a = document.getElementById("a_${filename}")
            if (a.href === pp) {
                a.setAttribute("class", "onActive")
                a.parentElement.setAttribute("class", "onActive")
            }
            if (a.href === prevPage) {
                a.setAttribute("class", "onVisited")
                a.parentElement.setAttribute("class", "onVisited")

                var container = document.getElementById("left_nav")

                // console.log(container.offsetTop)
                // console.log(container.scrollTop)
                // console.log(a.offsetTop)
                $('#left_nav').animate({scrollTop: a.offsetTop - container.offsetTop})
            }
        </script>`
    }
    nav += `
    </ul>
    `
    return nav
}

function preSearch(req, res) {
    const searchTarget = req.query.target.toLowerCase()
    filelist = fs.readdirSync('./dictionary_archive')
    var responseData = []
    const exp = new RegExp(searchTarget)

    filelist.forEach(element => {
        fileName = element.split('.')[0].toLowerCase()
        if (fileName.match(exp))
            responseData.push({
                "search" : fileName
            })
    });

    function customSort(a, b) {
        if(a.search.length == b.search.length){
             return 0
        } 
        return a.search.length > b.search.length ? 1 : -1; 
    } 
    
    responseData = responseData.sort(customSort);

    res.json(responseData);
}

// called from app.get()
function search(req, res) {
    const searchTarget = req.query.target.toLowerCase()
    const filelist = fs.readdirSync(ARCHIVE_PATH)
    var file, json
    for (let idx = 0; idx < filelist.length; ++idx){
        fileName = filelist[idx].split('.')[0].toLowerCase()
        if (fileName === searchTarget) {
            file = fileName
            break
        }
    }

    if (file) {
        file = fs.readFileSync('./dictionary_archive/'+searchTarget.split('.')[0]+'.json', 'utf8')
        json = JSON.parse(file)
    }

    var baseTem = baseTemplate()

    var template = `
        <div>
            <ul class="caution">
                <li>idiom의 경우 root를 따로 만들고 from에 원형을 추가</li>
                <ul>
                    "sb/sth 중 singular인지 plural인지 구분"
                </ul>
            </ul>

            <form class="insert" id="insert" action="/insert" style="overflow:visible;display:block" data-submitfalse="q" method="GET" role="search">
                <br>
                <div id="root">
                    <div id="caution"></div>`
    if (file) {
        template +=`
                    root : <input id="input_root" name="root" type="text" oninput="caseCheck(this)" value="${json["root"]}"/>`
    } else {
        template +=`
                    root : <input id="input_root" name="root" type="text" oninput="caseCheck(this)" value="${searchTarget}"/>`
    }

    template += `
                <script>
                    function caseCheck(input) {
                        const value = input.value
                        let flag = false
                        let _root = document.getElementById("caution")
                        for (let idx = 0; idx < value.length; ++idx) {
                            if (value[idx] === value[idx].toUpperCase()) {
                                _root.innerHTML = '<font color="red">root has UpperCase!</font>'
                                flag = true
                            }
                        }
                        if (flag === false) {
                            _root.innerHTML = ""
                        }
                    }
                </script>
                </div>
                <div id="from">`

    if (file) {
        json["from"].forEach(function (elm, idx) {
            template += `
                    <div id="from_${idx}">
                        from : <input name="from[${idx}]" type="text" value="${elm}"/>
                        <button type="button" class="btn btn_del_from" onclick="onClickDelFrom(this)">del from</button><br>
                    </div>
            `
        })
    } else {
        // template += `
        //             <div id="from_0">
        //                 <!-- from : <input name="from[0]" type="text"/> -->
        //             </div>`
    }
    template +=`
                </div>
                <button type="button" class="btn btn_add_from" onclick="onClickAddFrom()">add from</button>
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
                        <div> 
                            ${idx}.usage : <input name="data[${idx}][_usage]" type="text" value="${data["_usage"]}"/> 
                            <button type="button" class="btn btn_del_data" onclick="onClickDelData(this)">del data</button>
                        </div>
                        <div> ${idx}.speech : `
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
                            <div id=data_${idx}_chunk_${_idx}> 
                                ${idx}.chunk : <input name="data[${idx}][_chunks][]" type="text" value="${chunk}"/> 
                                <button type="button" class="btn btn_del_chunk" onclick="onClickDelChunk(this)">del chunk</button> 
                            </div>`
            })
            template += `
                        </div>
                        <button type="button" class="btn btn_add_chunk" onclick="onClickAddChunk(this)" value="${idx}">add chunk</button>
                        <div>${idx}.video : <input name="data[${idx}][_video]" type="text" value="${data["_video"]}"/></div>

            <div id=data_${idx}_text>`
            
            data["_text"].forEach(function (text, _idx) {
                template += `
                            <div id=data_${idx}_text_${_idx}> 
                                ${idx}.text : <input name="data[${idx}][_text][${_idx}]" type="text" value="${text}"/> 
                                <button type="button" class="btn btn_del_text" onclick="onClickDelText(this)" value="${idx}">del text</button>
                            </div>`
            })
            template += `
                        </div>
                    <button type="button" class="btn btn_add_text" onclick="onClickAddText(this)" value="${idx}">add text</button>
                    
            <div id=data_${idx}_tag>`
            
            if (data["_tag"] !== undefined) {
                data["_tag"].forEach(function (tag, _idx) {
                    template += `
                <div id=data_${idx}_tag_${_idx}> 
                    ${idx}.tag : <input name="data[${idx}][_tag][]" type="text" value="${tag}"/> 
                    <button type="button" class="btn btn_del_tag" onclick="onClickDelTag(this)">del tag</button>
                </div>`
                })
            }

            template += `
                </div>
                <button type="button" class="btn btn_add_tag" onclick="onClickAddTag(this)" value="${idx}">add tag</button>
            </div>`
        })
    } else {
        template += `
                    <div id=data_0>
                        <div> 
                            0.usage : <input name="data[0][_usage]" type="text"/> 
                            <button type="button" class="btn btn_del_data" onclick="onClickDelData(this)">del data</button>
                        </div>
                        <div> 0.speech : `
        template += speechTemplate(0)
        template += `
                        </div>
                        <div id=data_0_chunk>
                            <div id=data_0_chunk_0> 
                                0.chunk : <input name="data[0][_chunks][]" type="text"/> 
                                <button type="button" class="btn btn_del_chunk" onclick="onClickDelChunk(this)" value="0">del chunk</button>
                            </div>
                        </div>
                        <button type="button" class="btn btn_add_chunk" onclick="onClickAddChunk(this)" value="0">add chunk</button>
                        <div>0.video : <input name="data[0][_video]" type="text"/></div>
                        <div id=data_0_text>
                            <div id=data_0_text_0> 
                                0.text : <input name="data[0][_text][]" type="text"/> 
                                <button type="button" class="btn btn_del_text" onclick="onClickDelText(this)" value="0">del text</button>
                            </div>
                        </div>
                        <button type="button" class="btn btn_add_text" onclick="onClickAddText(this)" value="0">add text</button>
                        <div id=data_0_tag>
                            <div id=data_0_tag_0> 
                                0.tag : <input name="data[0][_tag][]" type="text"/> 
                                <button type="button" class="btn btn_del_tag" onclick="onClickDelTag(this)" value="0">del tag</button>
                            </div>
                        </div>
                        <button type="button" class="btn btn_add_tag" onclick="onClickAddTag(this)" value="0">add tag</button>
                    </div>`
    }

        template += `
                </div>
                <button type="button" class="btn btn_add_data" onclick="onClickAddData()">add data</button>
                <div class="item_btn">
                    <input class="btn" id="insert_btn" value="insert" type="submit">
                    <button type="button" class="btn btn_home" onclick="onClickHome()">Home</button>
                </div>
            </form>
        </div>

        <script>
            function deleteElmThenAlign(godfather, parent){
                godfather.removeChild(parent)
                parents = godfather.children

                for(var i in parents) {
                    parents[i].id = godfather.id+'_'+i
                }
            }

            function onClickAddFrom(){
                from = document.getElementById('from')
                len = from.children.length

                let div = document.createElement('div')
                div.setAttribute('id', 'from_'+len)
                div.innerHTML = 'from : <input name="from[]" type="text"/> <button type="button" class="btn btn_del_from" onclick="onClickDelFrom(this)">del from</button><br>'
                from.appendChild(div);
            }

            function onClickDelFrom(elm){
                deleteElmThenAlign(elm.parentElement.parentElement, elm.parentElement)
            }

            function onClickAddChunk(elm){
                idx = elm.getAttribute("value")
                chunk = document.getElementById('data_'+idx+'_chunk')
                len = chunk.children.length

                let div = document.createElement('div')
                div.setAttribute("id", "data_"+idx+"_chunk_"+len)
                div.innerHTML = idx+'.chunk : <input name="data['+idx+'][_chunks][]" type="text"/> <button type="button" class="btn btn_del_chunk" onclick="onClickDelChunk(this)">del chunk</button>'
                chunk.appendChild(div)
            }

            function onClickDelChunk(elm){
                deleteElmThenAlign(elm.parentElement.parentElement, elm.parentElement)
            }

            function onClickAddText(elm){
                idx = elm.getAttribute("value")
                text = document.getElementById('data_'+idx+'_text')
                len = text.children.length

                let div = document.createElement('div')
                div.setAttribute("id", "data_"+idx+"_text_"+len)
                div.innerHTML = idx+'.text : <input name="data['+idx+'][_text][]" type="text"/> <button type="button" class="btn btn_del_text" onclick="onClickDelText(this)">del text</button>'
                text.appendChild(div)
            }

            function onClickDelText(elm){
                deleteElmThenAlign(elm.parentElement.parentElement, elm.parentElement)
            }

            function onClickAddTag(elm){
                idx = elm.getAttribute("value")
                tag = document.getElementById('data_'+idx+'_tag')
                len = tag.children.length

                let div = document.createElement('div')
                div.setAttribute("id", "data_"+idx+"_tag_"+len)
                div.innerHTML = idx+'.tag : <input name="data['+idx+'][_tag][]" type="text"/> <button type="button" class="btn btn_del_tag" onclick="onClickDelTag(this)">del tag</button>'
                tag.appendChild(div)
            }

            function onClickDelTag(elm){
                root = document.getElementById('root').getElementsByTagName("INPUT")[0].value;
                tag = elm.previousElementSibling.value

                if (tag !== '') {
                    fetch('${LOCAL_SERVER_URL}/del_TagTable?tag='+tag+'&root='+root)
                        .then(response => response.json())
                        .then(res => {
                    
                            console.log('[FROM_LOCAL CMD_DEL_TAG] result : ', res)
                            deleteElmThenAlign(elm.parentElement.parentElement, elm.parentElement)
                        })

                    fetch('${SERVICE_SERVER_URL}/del_TagTable?tag='+tag+'&root='+root)
                        .then(response => response.json())
                        .then(res => {
                    
                            console.log('[FROM_SERVICE CMD_DEL_TAG] result : ', res)
                            deleteElmThenAlign(elm.parentElement.parentElement, elm.parentElement)
                        })
                } else {
                    console.log('[FAIL : CMD_DEL_TAG] none of tag value')
                    deleteElmThenAlign(elm.parentElement.parentElement, elm.parentElement)
                }
            }

            function onClickAddData(){
                data = document.getElementById('data')
                len = $("#data > div").length
                let div = document.createElement('div')
                div.setAttribute("id","data_"+len);
                div.innerHTML += '<div> '+len+'.usage : <input name="data['+len+'][_usage]" type="text"/> <button type="button" class="btn btn_del_data" onclick="onClickDelData(this)">del data</button></div>'
                div.innerHTML += '<div> '+len+'.speech : </div>'
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="verb">verb</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="auxiliary verb">auxiliary verb</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="phrasal verb">phrasal verb</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="modal verb">modal verb</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="adjective">adjective</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="adverb">adverb</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="conjunction">conjunction</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="noun">noun</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="pronoun">pronoun</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="preposition">preposition</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="predeterminer">predeterminer</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="determiner">determiner</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="phrase">phrase</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="idiom">idiom</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="exclamation">exclamation</label> '
                div.innerHTML += '<label><input type="checkbox" name="data['+len+'][_speech][]" value="number">number</label> '
                div.innerHTML += '</div>'
                div.innerHTML += '<div id="data_'+len+'_chunk"> <div id="data_'+len+'_chunk_0"> '+len+'.chunk : <input name="data['+len+'][_chunks][]" type="text"/> <button type="button" class="btn btn_del_chunk" onclick="onClickDelChunk(this)">del chunk</button> </div></div>'
                div.innerHTML += '<button type="button" class="btn btn_add_chunk" onclick="onClickAddChunk(this)">add chunk</button>'
                div.innerHTML += '<div>'+len+'.video : <input name="data['+len+'][_video]" type="text"/></div>'
                div.innerHTML += '<div id="data_'+len+'_text"> <div id="data_'+len+'_text_0"> '+len+'.text : <input name="data['+len+'][_chunks][]" type="text"/> <button type="button" class="btn btn_del_text" onclick="onClickDelText(this)">del text</button> </div></div>'
                div.innerHTML += '<button type="button" class="btn btn_add_text" onclick="onClickAddText(this)">add text</button>'
                div.innerHTML += '<div id="data_'+len+'_tag"> <div id="data_'+len+'_tag_0"> '+len+'.tag : <input name="data['+len+'][_chunks][]" type="text"/> <button type="button" class="btn btn_del_tag" onclick="onClickDelTag(this)">del tag</button> </div></div>'
                div.innerHTML += '<button type="button" class="btn btn_add_tag" onclick="onClickAddTag(this)">add tag</button>'

                btn_add_chunk = div.querySelector(".btn_add_chunk")
                btn_add_chunk.setAttribute("value",len)
                btn_add_text = div.querySelector(".btn_add_text")
                btn_add_text.setAttribute("value",len)
                btn_add_tag = div.querySelector(".btn_add_tag")
                btn_add_tag.setAttribute("value",len)
                data.appendChild(div);
            }

            function onClickDelData(elm){
                deleteElmThenAlign(elm.parentElement.parentElement.parentElement, elm.parentElement.parentElement)
            }
            
        </script>`

    baseTem = baseTem.replace('<!-- SEARCH -->', template)

    res.send(baseTem)
}

// DB transaction - insert
async function insert(req, res) {
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query

    if (query["from"] === undefined)
        query["from"] = []

    data = query["data"]
    if (data !== undefined) {
        data.forEach(function (_data, idx) {
            if (_data["_chunks"] === undefined)
                query["data"][idx]["_chunks"] = []
            if (_data["_speech"] === undefined)
                query["data"][idx]["_speech"] = []
            if (_data["_text"] === undefined)
                query["data"][idx]["_text"] = []
            if (_data["_tag"] === undefined)
                query["data"][idx]["_tag"] = []
        })
    } else if (data === undefined) {
        query["data"] = []
    }

    try {
        //
        // local processes
        // START
        fs.writeFileSync(path.join(__dirname, ARCHIVE_PATH, query["root"]+'.json'), JSON.stringify(query, null, "\t"), "utf-8")

        const res = setId(query)

        console.log('[ID_RES] ', res)
        // END
        //

        //
        // DB processes
        // START
        if (res) {
            // Connect to the MongoDB cluster
            await client.connect()
            result = await client.db(DATABASE_NAME).collection(DICTIONARY_COLLECTION).findOne({ _id: res });
        
            if (result) {
                console.log('[QUERY BEFORE REPLACING LISTING]', query)
                await replaceListing(client, query, DICTIONARY_COLLECTION)
            } else {
                console.log('[QUERY BEFORE CREATING LISTING]', query)
                await createListing(client, query, DICTIONARY_COLLECTION)
            }

            // Update DB status on the servers
            fetch(`${SERVICE_SERVER_URL}/update_DB_status`)
                .then(response => response.json())
                .then(status => {
                    console.log(`SERVICE_SERVER Updated result : volumes(${status["volumes"]}), usages(${status["usages"]}), videos(${status["videos"]})`)
                })
            fetch(`${LOCAL_SERVER_URL}/update_DB_status`)
                .then(response => response.json())
                .then(status => {
                    console.log(`LOCAL_SERVER Updated result : volumes(${status["volumes"]}), usages(${status["usages"]}), videos(${status["videos"]})`)
                })
        }
        // END
        //
    } catch (e) {
        console.error(e)
    } finally {
        await client.close()
    
        res.send(baseTemplate())
    }
}

// genSiteMap
async function genSiteMap(req, res) {
    // generate sitemaps
    
    const list = fs.readdirSync('dictionary_archive')
    var nav = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>http://www.sensebedictionary.org/</loc></url>
<url><loc>http://www.sensebedictionary.org/search?target=sensebe&amp;btnK=Sense+%EA%B2%80%EC%83%89</loc></url>`

    for(let item in list) {
        let filename = list[item].split('.')[0]
        let ext = list[item].split('.')[1]

        if (ext === 'json') {
            json = JSON.parse(fs.readFileSync(path.join('dictionary_archive', list[item]), "utf-8"))

            for(let idx in json["data"]) {
                nav += `
        <url> <loc>http://www.sensebedictionary.org/search?target=${filename}&amp;btnK=Sense+%EA%B2%80%EC%83%89&amp;usage=${json["data"][idx]["_usage"]}</loc> </url>`
            }
        }
    }

    nav += `
</urlset>`

    fs.writeFile('../public/sitemap.xml', nav, (err) => {
        if (err) throw err
        console.log(`[SITEMAP] sitemap.xml has been created`)
    });
    
    res.send(baseTemplate())
}

// findByIdType
async function findByIdType(req, res) {
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    const query = req.query

    idType = query["findByIdType"]

    try {
        await client.connect()

        // result = await client.db(DATABASE_NAME).collection("eng_dictionary").find({ _id: {
        //     $type:7 // ObjectId
        // } }).toArray()

        // if (result) {
        //     console.log(`Found a listing in the collection with the _id '${idType}':${result['_id']}`);
        //     console.log(result);

        //     // for (let i = 0; i < result.length; ++i) {
        //     //     console.log(result[i]['_id'])
        //     //     await deleteListingById(client, result[i]['_id'])
        //     // }
        // } else {
        //     console.log(`No listings found with the _id '${idType}'`);
        // }

        //
        //  deletes not intended listings
        //
        // try {
        //     await client.db(DATABASE_NAME).collection("eng_dictionary").deleteMany( { _id: {
        //         $type:7 // ObjectId
        //     }}) 
        // } catch (e) {
        //     print (e);
        // }

        //
        // create sitemaps
        //
//         const list = fs.readdirSync('dictionary_archive')
//         var nav = `<?xml version="1.0" encoding="UTF-8"?>

// <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//     <url><loc>http://www.sensebedictionary.org/</loc></url>
//     <url><loc>http://www.sensebedictionary.org/search?target=sensebe&amp;btnK=Sense+%EA%B2%80%EC%83%89</loc></url>`

//         for(let item in list) {
//             let filename = list[item].split('.')[0]
//             nav += `
//     <url>
//         <loc>http://www.sensebedictionary.org/search?target=${filename}&amp;btnK=Sense+%EA%B2%80%EC%83%89</loc>
//     </url>`
//         }

        //
        //  Video Link Integrity check
        //

        const list = fs.readdirSync('video_archive')
        let result = await client.db(DATABASE_NAME).collection("eng_dictionary").find().toArray()

        for(let item in list) {
            let filename = list[item].split('.')[0]
            let json = JSON.parse(fs.readFileSync(`./video_archive/${list[item]}`))

            for (let i = 0; i < result.length; ++i) {
                for (let j = 0; j < result[i]['data'].length; ++j) {
                    if (result[i]['data'][j]['_video'] === filename) {
                        result[i]['data'][j]['_integrity'] = true
                    }
                }
            }
        }

        let count = 0;

        for (let i = 0; i < result.length; ++i) {
            for (let j = 0; j < result[i]['data'].length; ++j) {
                if (result[i]['data'][j]['_integrity'] === undefined) {
                    count++
                    console.log(`[VIDEO LINK INTEGRITY UNDEFINED] link : ${result[i]['data'][j]['_video']} of data[${j}] of ${result[i]['_id']}`)
                } else if (result[i]['data'][j]['_integrity'] === true) {
                    // console.log(`[VIDEO LINK INTEGRITY TRUE]`)
                }
            }
        }
        console.log(`[VIDEO LINK INTEGRITY UNDEFINED] detected total : ${count}`)
        
//         nav += `
// </urlset>`

//         fs.writeFile('../public/sitemap.xml', nav, (err) => {
//             if (err) throw err;
//             console.log(`[SITEMAP] sitemap.xml has been created`);
//         });
    } catch (e) {
        console.error(e)
    } finally {
        console.log('--------TRANSACTION END!-----')
        await client.close()
    
        res.send(baseTemplate())
    }
}

app.get('/products/:id', function (req, res, next) {
    res.json({msg: 'This is CORS-enabled for all origins!'})
})

app.get('/preSearch', (req, res) => preSearch(req, res))
app.get('/search', (req, res) => search(req, res))
app.get('/insert', (req, res) => insert(req, res)) 
app.get('/genSiteMap', (req, res) => genSiteMap(req, res)) 

// Home
app.get('/', function(req, res) {
    autocomplete = fs.readFileSync("./metadata/script_autocomplete.js", 'utf8')
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

function registerRedirectionTable(json){
    root = json['root']
    redirection = json['redirection']

    if(redirection !== "") {
        console.log('fetch a add command to the server')

        fetch(`${LOCAL_SERVER_URL}/add_RedirectionTable?root=${root}&redirection=${redirection}`)
            .then(response => response.json())
            .then(res => {
                console.log(`on local add result : ${res}`)
            })
        fetch(`${SERVICE_SERVER_URL}/add_RedirectionTable?root=${root}&redirection=${redirection}`)
            .then(response => response.json())
            .then(res => {
                console.log(`on service add result : ${res}`)
            })
        return true
    } else {
        table = fs.readFileSync(path.join(__dirname, REDIRECTION_TABLE_FILE), "utf-8")
        redirectionTableJson = JSON.parse(table)
        if (redirectionTableJson[root])  {
            console.log('fetch a delete command to the server')

            fetch(`${LOCAL_SERVER_URL}/del_RedirectionTable?root=${root}`)
                .then(response => response.json())
                .then(res => {
                    console.log(`on local del result : ${res}`)
                })
            fetch(`${SERVICE_SERVER_URL}/del_RedirectionTable?root=${root}`)
                .then(response => response.json())
                .then(res => {
                    console.log(`on service del result : ${res}`)
                })
        }
    }
    return false
}

// creates a uique ID for the MongoDB
function setId(json){
    table = fs.readFileSync(path.join(__dirname, DB_INDEX_TABLE_FILE), "utf-8")

    rootTableJson = JSON.parse(table)
    root = json["root"]

    //
    // REDIRECTION
    redirectionResult = registerRedirectionTable(json)

    //
    // TEMPORARY tagTable codes
    tagTable = JSON.parse(fs.readFileSync(path.join(__dirname, TAG_TABLE_FILE), "utf-8"))
    dataList = json["data"]

    for (let i = 0; i < dataList.length; ++i) {
        let tagList = dataList[i]["_tag"]
        for (let j = 0; j < tagList.length; ++j) {
            let tag = tagList[j]

            if (tagTable[tag] === undefined) {
                tagTable[tag] = [
                    {
                        "r" : root
                    }
                ]
                console.log(`[TAG] ${tag} is added to tagTable, as r(${root})`)

                fetch(`${SERVICE_SERVER_URL}/add_TagTable?con=0&tag=${tag}&root=${root}`)
                    .then(response => response.json())
                    .then(res => {
                        console.log(`result : ${res}`)
                    })
                fetch(`${LOCAL_SERVER_URL}/add_TagTable?con=0&tag=${tag}&root=${root}`)
                    .then(response => response.json())
                    .then(res => {
                        console.log(`result : ${res}`)
                    })
            } else {
                let list = tagTable[tag]
                let flag = false

                for (let k = 0; k < list.length; ++k) {
                    let tagOfTable = list[k]
                    if (tagOfTable["r"] === root) {
                        flag = true
                    }
                }
                
                // the entry has been resistered before but not the root
                if (flag === false) {
                    tagTable[tag].push({
                        "r" : root
                    })
                    console.log(`[TAG] ${tag} is added to tagTable, as r(${root})`)

                    fetch(`${SERVICE_SERVER_URL}/add_TagTable?con=1&tag=${tag}&root=${root}`)
                        .then(response => response.json())
                        .then(res => {
                            console.log(`result : ${res}`)
                        })
                    fetch(`${LOCAL_SERVER_URL}/add_TagTable?con=1&tag=${tag}&root=${root}`)
                        .then(response => response.json())
                        .then(res => {
                            console.log(`result : ${res}`)
                        })
                }
            }
            fs.writeFileSync(path.join(__dirname, TAG_TABLE_FILE), JSON.stringify(this.tagTable), "utf-8")
        }
    }
    //
    //


    //
    // INDEX
    if(redirectionResult === false) {
        if(rootTableJson[root] === undefined){
            _id = Object.keys(rootTableJson).length
            // console.log(Object.keys(rootTableJson).length)
            rootTableJson[root]=_id
            json['_id'] = _id

            console.log('[INDEX] fetched adding commands to the servers')

            fetch(`${SERVICE_SERVER_URL}/add_IndexTable?id=${_id}&root=${root}`)
                .then(response => response.json())
                .then(res => {
                    console.log(`result : ${res}`)
                })
            fetch(`${LOCAL_SERVER_URL}/add_IndexTable?id=${_id}&root=${root}`)
                .then(response => response.json())
                .then(res => {
                    console.log(`result : ${res}`)
                })
        } else {
            json['_id'] = rootTableJson[root]
        }
        console.log(`json['_id'] : ${json['_id']}, root : ${root}`)
        return json['_id']
    }
    return redirectionResult
}

///
/// MongoDB Transactions down below
///
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

// Use this function when you need to find documents having a expected element
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

async function deleteListingById(client, idOfListing) {
    result = await client.db(DATABASE_NAME).collection("eng_dictionary")
         .deleteOne({ _id: idOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
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