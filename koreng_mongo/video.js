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

const natural = require('natural');
const wdTokenizer = new natural.WordTokenizer();
const stcTokenizer = new natural.SentenceTokenizer();

// custom
const ENUM = require('../metadata/enum')

// built-in
const fs = require('fs')
const {MongoClient} = require('mongodb');
const path = require('path')

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

VIDEO_ARCHIVE_PATH = "collections/SB_VIDEO"
COL_INFO_PATH = "public/json"
WORD_LIST = "word_list.json"

PASSWORD = fs.readFileSync("./pw.txt", "utf8")

DATABASE_NAME = "sensebe_dictionary"
VIDEO_COLLECTION = "SB_VIDEO"
WORD_COLLECTION = "SB_WORD"

LOCALHOST = "http://localhost:5200"

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
        <script src="./js/formSerializer.js"></script>
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

        <!-- React를 실행. -->
        <!-- 주의: 사이트를 배포할 때는 "development.js"를 "production.min.js"로 대체하세요. -->
        <script src="https://unpkg.com/react@16/umd/react.development.js" crossorigin></script>
        <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js" crossorigin></script>
      
        <!-- 만든 React 컴포넌트를 실행. -->
        <script src="./src/Header.js"></script>
        <script src="./src/Tool.js"></script>

        <script>
            ${autocomplete}
        </script>
    </body>
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

function stcDataTemplate(idx) {
    let elm = document.createElement('div')

    elm.innerHTML = '<label>시간대:</label> \
                        <select name="c['+idx+'][t][stc][ti]"> \
                            <option value="modern">현대</option> \
                            <option value="middle-aged">중세</option \
                            <option value="ancient">고대</option \
                        </select> '

    return elm
}

function search(req, res) {
    const searchTarget = req.query.target
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
        for (let idx in json["c"]){
            var c = json["c"][idx]

            function integrityCheck(json) {
                for (let key in json) {
                    var value = json[key];
                    if (value === undefined) { 
                        throw "no value"
                    } else {
                        // console.log("[integrityCheck] value : ", value)
                    }
                    integrityCheck(value[key])
                }
            }
            
            integrityCheck(c)

            let literal = c["lt"], pharaphrase = c["pp"],
            start_timestamp = c["st"],end_timestamp = c["et"],
            script = c["t"]["scrt"],
            stc = c["t"]["stc"]

            template += `
                    <div class="ctt">
                        <span class="wst">
                            st <input class="st" type="text" value="${start_timestamp}">
                        </span>
                        <span class="wet">
                            et <input class="et" type="text" value="${end_timestamp}">
                        </span>
                        <div class="wscrt">
                            scrt <button type="button" class="btn" id="btn_parse" onclick="onClickParseStc(${idx})">parse</button>
                            <textarea class="scrt">${script}</textarea>
                        </div>
                        
                        <div class="wstc">`

            // sentences data
            for (let j in stc){
                let ct = stc[j]['ct'], lt = stc[j]['lt'], pp = stc[j]['pp']
                console.log(ct)

                template +=`
                            <div>
                                ct <textarea class="ct" type="text">${ct}</textarea>
                                lt <textarea class="lt" type="text">${lt}</textarea>
                                pp <textarea class="pp" type="text">${pp}</textarea>
                                <button type="button" class="btn" onclick="onClickGenToken(this)">generate</button>
                                <button type="button" class="btn" onclick="onClickDelSentence(this)">del sen</button>
                                <button type="button" class="btn" id="btn_parse" onclick="onClickParseCt(this)">ct parse</button>`

                let wd = stc[j]['wd']

                if (wd) {
                    template += `
                                <div class="wwd">`

                    for (let k in wd) {
                        let ct = wd[k]["ct"], lt = wd[k]["lt"], rt = wd[k]["rt"]

                        if (rt === undefined) {
                            rt = ct
                        }
    
                        template += `
                                    <div>
                                        ct <input class="ct" type="text" value="${ct}">
                                        rt <input class="rt" type="text" value="${rt}">
                                        lt <input class="lt" type="text" value="${lt}">
                                    </div>`
                    }
                    template +=`
                                    <button type="button" class="btn" onclick="onClickDelWord(this)">del wd</button>
                                </div>`
                }
                template +=`
                                <div class="wpct">
                                `

                let pct = stc[j]['pct']

                if (pct) {
                    for (let k in pct) {
                        let ct = pct[k]["ct"], lt = pct[k]["lt"], pp = pct[k]["pp"]

                        template += `
                                    <div>
                                        ct <textarea class="ct" type="text">${ct}</textarea>
                                        lt <textarea class="lt" type="text">${lt}</textarea>
                                        pp <textarea class="pp" type="text">${pp}</textarea>
                                        <button type="button" class="btn" onclick="onClickDelPct(this)">del pct</button>
                                        <button type="button" class="btn" onclick="onClickGenToken(this)">generate</button>
                                    </div>`
                    }
                }

                template += `   
                                </div>
                                <button type="button" class="btn" onclick="onClickAddPct(this)">add pct</button>
                            </div>`
            }

            template += `
                        </div>
                        <button type="button" class="btn" id="btn_addSen" onclick="onClickAddSentence(this)">add sen</button>
                        <div class="ta_literal" id="literal_${idx}">
                            literal[${idx}] : <textarea name="c[${idx}][lt]">${literal}</textarea>
                        </div>
                        <div class="ta_pharaphrase" id="pharaphrase_${idx}">
                            pharaphrase[${idx}] : <textarea name="c[${idx}][pp]">${pharaphrase}</textarea>
                        </div>
                    </div>`
        }
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
                    <input type="button" class="btn" value="debug" onclick="onSubmit(false)"/>
                </div>
            </form>
        </div>
        <div id="tool"></div>
    </body>
    <script>
        $(document).ready(function () {
            $('form#insert').on('submit', function(e) {
                e.preventDefault();
                // let formData = $(this).serializeObject()
                // console.log('[SUBMIT_BASE_OBJ] ', formData)
                // console.log('[SUBMIT_STRINGIFIED], ', JSON.stringify(formData))
                $.ajax({
                    url : $(this).attr('action') || window.location.pathname,
                    type: "POST",
                    data: $(this).serialize(),
                    // dataType: 'json',
                    success: function (data) {
                        // console.log("[SUBMIT_COMPLETE] : ", data)
                        alert("SUBMIT_COMPLETE")
                    },
                    error: function (jXHR, textStatus, errorThrown) {
                        alert(errorThrown);
                    }
                });
            });

            alignData()
        });

        function onSubmit( bool ){
            let formData = $('form#insert').serializeObject()

            if (!bool) {
                console.log(formData)
            }

            return false
        }

        function alignData() {
            let root = $('#text')
            // console.log('[ROOT] : ', root)

            root.children('div').each(function (rootIdx) {
                // console.log('[CONTEXT] : ', this)
                let context = $(this)

                context.children('.wst').each(function () {
                    $(this).children('.st').each(function() {
                        $(this).attr('name', 'c['+rootIdx+']['+$(this).attr('class')+']')
                    })
                })

                context.children('.wet').each(function () {
                    $(this).children('.et').each(function() {
                        $(this).attr('name', 'c['+rootIdx+']['+$(this).attr('class')+']')
                    })
                })

                context.children('.wscrt').each(function () {
                    $(this).children('.scrt').each(function() {
                        $(this).attr('name', 'c['+rootIdx+'][t]['+$(this).attr('class')+']')
                    })
                })

                context.children('.wstc').each(function () {
                    // console.log('[wstc] : ', this)
                    let wstc = $(this)

                    wstc.children('div').each(function (stcIdx) {
                        // console.log('[SENTENCE] : ', this)
                        let stc = $(this)
                        
                        stc.children('textarea').each(function () {
                            // console.log('[TEXTAREA] : ', this)
                            $(this).attr('name', 'c['+rootIdx+'][t][stc]['+stcIdx+']['+$(this).attr('class')+']')
                        })

                        stc.children('.wwd').each(function () {
                            // console.log('[WWD] : ', this)
                            let wwd = $(this)

                            wwd.children('div').each(function (wdIdx) {
                                let wd = $(this)

                                wd.children('input').each(function () {
                                    $(this).attr('name', 'c['+rootIdx+'][t][stc]['+stcIdx+'][wd]['+wdIdx+']['+$(this).attr('class')+']')
                                })
                            })
                        })

                        stc.children('.wpct').each(function () {
                            // console.log('[WWD] : ', this)
                            let wpct = $(this)

                            wpct.children('div').each(function (pctIdx) {
                                let div = $(this)

                                div.children('textarea').each(function () {
                                    $(this).attr('name', 'c['+rootIdx+'][t][stc]['+stcIdx+'][pct]['+pctIdx+']['+$(this).attr('class')+']')
                                })
                            })
                        })
                    })
                })
            })
        }

        function deleteElmThenAlign(godfather, parent){
            godfather.removeChild(parent)
            parents = godfather.children
        }

        function onClickAddTexts(){
            text = document.getElementById('text')

            let div = document.createElement('div')
            div.setAttribute('class', "ctt")
            div.innerHTML = '<span class="wst">' +
                                'st : <input class="st" type="text">' +
                            '</span>' + 
                            '<span class="wet">' +
                                'et <input class="et" type="text">' +
                            '</span>' + 
                            '<div class="wscrt">' +
                                'scrt <button type="button" class="btn" id="btn_parse" onclick="onClickParseStc()">parse</button>' +
                                '<textarea class="scrt"></textarea>' +
                            '</div>'
            text.appendChild(div);

            alignData()
        }

        function onClickDelTexts(){
            ctt = document.getElementsByClassName('ctt')
            length = ctt.length
            ctt[length-1].parentElement.removeChild(ctt[length-1])

            alignData()
        }

        function onClickGenToken(btn){
            let parent = $(btn).parent('div')
            parent.children('.ct').each(function() {
                fetch('${LOCALHOST}/tokenizeStc?stc='+this.innerHTML)
                    .then(response => response.json())
                    .then(res => {
                        let elm = document.createElement('div')
                        elm.setAttribute("class", "wwd")
                        for (let i in res) {
                            elm.innerHTML += '<div>' + 
                                                'ct <input class="ct" type="text" value="'+res[i]+'">' +
                                                'rt <input class="rt" type="text" value="">' +
                                                'lt<input class="lt" type="text" value="">' +
                                            '<div>'
                            // elm.innerHTML += '<button type="button" class="btn" onclick="onClickGenToken(this)">generate</button>'
                            // elm.innerHTML += '<button type="button" class="btn" onclick="onClickDelSentence(this)">del sen</button>'
                        }
                        elm.innerHTML += '<button type="button" class="btn" onclick="onClickDelWord(this)">del wd</button>'
                        parent[0].insertAdjacentElement('beforeend',elm)

                        alignData()
                    })
            })

            

            // elm.innerHTML = '<label>시간대:</label> \
            //                     <select name="c['+idx+'][t][stc][ti]"> \
            //                         <option value="modern">현대</option> \
            //                         <option value="middle-aged">중세</option> \
            //                         <option value="ancient">고대</option> \
            //                     </select> '

            // elm.innerHTML += '<label><input type="checkbox" name="c['+idx+'][t][stc][lg]">문어</label> '
            // elm.innerHTML += '<label><input type="checkbox" name="c['+idx+'][t][stc][lg]">구어</label> '

            // elm.innerHTML += '<label><input type="checkbox" name="c['+idx+'][t][stc][cls]">왕</label> '
            // elm.innerHTML += '<label><input type="checkbox" name="c['+idx+'][t][stc][cls]">귀족</label> '
            // elm.innerHTML += '<label><input type="checkbox" name="c['+idx+'][t][stc]">noun</label> '
            // elm.innerHTML += '<label><input type="checkbox" name="c['+idx+'][t][stc]">pronoun</label> '
            // elm.innerHTML += '<label><input type="checkbox" name="c['+idx+'][t][stc]">preposition</label> '

            // elm.innerHTML += '<button type="button" class="btn" onclick="onClickGenToken(this)">generate</button>'
            // elm.innerHTML += '<button type="button" class="btn" onclick="onClickDelSentence(this)">del sen</button>'

            // btn.insertAdjacentElement('beforebegin',elm)
        }

        function onClickDelSentence(elm){
            deleteElmThenAlign(elm.parentElement.parentElement, elm.parentElement)

            alignData()
        }

        function onClickDelWord(elm){
            deleteElmThenAlign(elm.parentElement.parentElement, elm.parentElement)

            alignData()
        }

        function onClickDelPct(elm){
            deleteElmThenAlign(elm.parentElement.parentElement, elm.parentElement)

            alignData()
        }

        function onClickParseStc(idx){
            var script = document.getElementById('textarea_'+idx).innerHTML
            
            fetch('${LOCALHOST}/parseStc?stc='+script)
                .then(response => response.json())
                .then(res => {
                    anchor = document.getElementById('text_'+idx)

                    for (let i in res) {
                        let elm = document.createElement('div')
                        elm.innerHTML = 'ct <textarea class="ct" type="text">'+res[i]+'</textarea>'
                        elm.innerHTML += 'lt <textarea class="lt" type="text"></textarea>'
                        elm.innerHTML += 'pp <textarea class="pp" type="text"></textarea>'
                        elm.innerHTML += '<button type="button" class="btn" onclick="onClickGenToken(this)">generate</button>'
                        elm.innerHTML += '<button type="button" class="btn" onclick="onClickDelSentence(this)">del sen</button>'
                        anchor.insertAdjacentElement('beforeend',elm);
                    }

                    alignData()
                })
        }

        function onClickParseCt(btn){
            let ct = $(btn).parent('div').children('.ct')[0]
            var script = ct.innerHTML

            fetch('${LOCALHOST}/parseStc?stc='+script)
                .then(response => response.json())
                .then(res => {
                    for (let i in res) {
                        let elm = document.createElement('div')
                        console.log(res[i])
                        elm.innerHTML = 'pct <textarea class="ct" type="text">'+res[i]+'</textarea>' + 
                                        'lt <textarea class="lt" type="text"></textarea>' +
                                        'pp <textarea class="pp" type="text"></textarea>' +
                                        '<button type="button" class="btn" onclick="onClickDelPct(this)">del pct</button>' +
                                        '<button type="button" class="btn" onclick="onClickGenToken(this)">generate</button>'
                        $(btn).parent('div').children('.wpct').append(elm)

                        // add pct button
                        // elm = document.createElement('button')
                        // elm.setAttribute('type', 'button')
                        // elm.setAttribute('class', 'btn')
                        // elm.setAttribute('onclick', 'onClickAddPct(this)')
                        // elm.innerHTML = 'add pct'

                        // $(btn).parent('div').append(elm)
                    }

                    alignData()
                })
        }

        function onClickAddSentence(that){
            let stc = that.previousElementSibling

            let elm = document.createElement('div')
            elm.innerHTML = 'ct <textarea class="ct" type="text"></textarea>'
            elm.innerHTML += 'lt <textarea class="lt" type="text"></textarea>'
            elm.innerHTML += 'pp <textarea class="pp" type="text"></textarea>'
            elm.innerHTML += '<button type="button" class="btn" onclick="onClickGenToken(this)">generate</button>'
            elm.innerHTML += '<button type="button" class="btn" onclick="onClickDelSentence()">del sen</button>'
            stc.insertAdjacentElement('beforeend',elm);

            alignData()
        }

        function onClickAddPct(that){
            let wpct = $(that).parent('div').children('.wpct')

            let elm = document.createElement('div')
            elm.innerHTML = 'pct <textarea class="ct" type="text"></textarea>'
            elm.innerHTML += 'lt <textarea class="lt" type="text"></textarea>'
            elm.innerHTML += 'pp <textarea class="pp" type="text"></textarea>'
            elm.innerHTML += '<button type="button" class="btn" onclick="onClickGenToken(this)">generate</button>'
            elm.innerHTML += '<button type="button" class="btn" onclick="onClickDelPct(this)">del pct</button>'
            wpct.append(elm)

            alignData()
        }

        function onClickHome(){
            location.href = '/'
        }

    </script>`

    baseTem = baseTem.replace('<!-- SEARCH -->', template)

    res.send(baseTem)
}

async function insert(req, res) {
    // console.log('[insert!]')
    const uri = `mongodb+srv://sensebe:${PASSWORD}@agjakmdb-j9ghj.azure.mongodb.net/test`
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true })

    // this data doesn't match with my format so has to be reformatted below lines
    const query = req.body

    console.log('[BF_FORMAT] : ', JSON.stringify(query, null, 2)) // spacing level = 2

    // for (let j = 0; j < query['c'].length; ++j) {
    //     if (query['c'][j]['t']['stc']) {
    //         var len = query['c'][j]['t']['stc'][0]['ct'].length
    //         let stc = []

    //         for (let i = 0; i < len; ++i){
    //             stc.push({
    //                 "ct":query['c'][j]['t']['stc'][0]['ct'][i],
    //                 "lt":query['c'][j]['t']['stc'][0]['lt'][i],
    //                 "pp":query['c'][j]['t']['stc'][0]['pp'][i]
    //             })
    //         }

    //         query['c'][j]['t']['stc'] = stc
    //     }
    // }

    // console.log('[AF_FORMAT] : ', JSON.stringify(query, null, 2)) // spacing level = 2

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        let result = undefined
        let link = query["link"]
        
        // SB_VIDEO ISNERT
        if (query['_id']) 
            result = await client.db(DATABASE_NAME).collection(VIDEO_COLLECTION).findOne({ _id: query['_id'] });
            
        if (result) {
            await replaceListing(client, query, VIDEO_COLLECTION)
            _id = query["_id"]
            delete query["_id"]
            console.log('[VIDEO_REPLACE_LISTING] _id : ',_id)
            fs.writeFileSync(path.join(__dirname, VIDEO_ARCHIVE_PATH, _id+'.json'), JSON.stringify(query, null, "\t"), "utf-8")
        } else {
            fs.writeFileSync(path.join(__dirname, VIDEO_ARCHIVE_PATH, link+'.json'), JSON.stringify(query, null, "\t"), "utf-8")
            if (query['_id'] === undefined)
                query['_id'] = link

            console.log('[VIDEO_CREATE_LISTING] _id : ', query['_id'])
            await createListing(client, query, VIDEO_COLLECTION)
        }

        // SB_WORD INSERT
        let wordList = JSON.parse(fs.readFileSync(path.join(COL_INFO_PATH, WORD_LIST), "utf8"))
        for (let i = 0; i < query['c'].length; ++i) {
            let stc = query['c'][i]['t']['stc']

            if (stc) {
                for (let j = 0; j < stc.length; ++j) {
                    let wd = stc[j]['wd']

                    if (wd) {
                        for (let k = 0; k < wd.length; ++k) {
                            let data = wd[k], ct = data['ct'], lt = data['lt'],
                                sp = 0
                                
                            let rt = undefined

                            if (data['rt']) {
                                rt = data['rt'].toLowerCase()
                            } else {
                                rt = data['ct'].toLowerCase()
                            }
                            
                            let hashId = rt.hashCode(),
                                listing = { 
                                    _id: hashId, 
                                    rt: rt,
                                    links: [
                                        {
                                            ct: ct,
                                            lt: data['lt'], 
                                            link: link, 
                                            pos: {
                                                stc:j,
                                                wd:k
                                            }
                                        }
                                    ]
                                }

                            result = await client.db(DATABASE_NAME).collection(WORD_COLLECTION).findOne(listing)

                            if (!result) {
                                await createListing(client, listing, WORD_COLLECTION)
                            } else {
                                await replaceListing(client, listing, WORD_COLLECTION)
                            }

                            if (!wordList[ct]) {
                                wordList[ct] = []
                                wordList[ct].push(lt)
                            } else {
                                let bool = true

                                for (let i in wordList[ct]) {
                                    if (wordList[ct][i] === lt) {
                                        bool = false
                                    }
                                }
                                
                                if (bool) {
                                    wordList[ct].push(lt)
                                }
                            }
                        }
                    }
                }
            }
        }

        fs.writeFileSync(path.join(__dirname, COL_INFO_PATH, WORD_LIST), JSON.stringify(wordList, null, "\t"), "utf-8")

    } catch (e) {
        console.error(e)
    } finally {
        await client.close()

        var template = baseTemplate()
    
        res.send(template)
    }
}

/* NLP */

Object.defineProperty(String.prototype, 'hashCode', {
    value: function() {
            var hash = 0, i, chr;
            for (i = 0; i < this.length; i++) {
            chr   = this.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
});

function parseStc(req, res) {
    let token = stcTokenizer.tokenize(req.query.stc)
    console.log(token)
    res.json(token)
}

function tokenizeStc(req, res) {
    let token = wdTokenizer.tokenize(req.query.stc)
    console.log(token)
    res.json(token)
}

app.get('/parseStc', (req, res) => parseStc(req, res))
app.get('/tokenizeStc', (req, res) => tokenizeStc(req, res))

/*     */

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