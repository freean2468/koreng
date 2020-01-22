
// expres
const express = require('express')
const app = express()

// third-party
const compression = require('compression')
const bodyParser = require('body-parser')
const helmet = require('helmet')

// built-in
const fs = require('fs')

// custom
const HTMLLoader = require('./feature/HTMLLoader.js')
const HTMLLoaderInst = new HTMLLoader()
const dataLoader = require('./feature/dataLoader.js')
const dataLoaderInst = new dataLoader()
const mongoClient = require('./feature/mongoClient.js')
const mongoClientInst = new mongoClient()

// heroku
const PORT = process.env.PORT || 5000

// middlewares
app.use(express.static('public'))
app.use(helmet())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}))
app.use(compression())

// Home
app.get('/', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html','home'))

 // Main
 app.get("/" + encodeURIComponent("main_toddler"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/1_toddler", "main_toddler"))
 app.get("/" + encodeURIComponent("main_feelingmap"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/2_feelingmap", "main_feelingmap"))
 app.get("/" + encodeURIComponent("main_generalmap"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/3_generalmap", "main_generalmap"))
 app.get("/" + encodeURIComponent("main_verbmap"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/4_verbmap", "main_verbmap"))
 app.get("/" + encodeURIComponent("main_placemap"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/5_placemap", "main_placemap"))
 app.get("/" + encodeURIComponent("main_game"), (req, res) => HTMLLoaderInst.assembleHTML(res, "public/html/6_game", "main_game"))
 

// Search
app.get('/search', (req, res) => onSearch(req, res))

// image
app.get("/public/image/right_up_arrow.png", (req, res) => res.sendFile("/public/image/right_up_arrow.png", { root : __dirname}))

// app.post('/filter_process', (req, res) => res.send(onSearchWithFilter(req, res)))
// app.get('/filter', (req, res) => res.send(HTMLLoaderInst.resultHandlingForFilter(dataLoaderInst.metaData)))

app.use(function(req, res, next) {
    res.status(404)
    HTMLLoaderInst.assembleHTML(res, 'public/html', 'home')
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
    mongoClientInst.close()
}

//
// functions
//
async function onSearch(req, res) {
    function arrayRemove(arr, value) {
        return arr.filter(function(ele) {
        return ele != value;
        });
    }
    
    const searchTarget = req.query.target

    // let [foo, bar] = await Promise.all([getFoor(), getBar()]);
    // mongoRes = mongoClientInst.findOneListingById(searchTarget)
    //             .then(function(v){
    //                     console.log('success!', v)
    //                 },
    //                 function(v){
    //                     console.log('failure', v)
    //                 }
    //             )
    // console.log('mongoRes : ',mongoRes)

    let mongoRes = await mongoClientInst.findOneListingById(searchTarget)
    
    if (mongoRes) {
        searchRes = dataLoaderInst.searchData(searchTarget, '', '');

        return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, mongoRes, searchRes, dataLoaderInst.metaData);

    } else {
        return HTMLLoaderInst.assembleHTML(res, 'public/html', 'home');
    }
    // const filterCategory = arrayRemove(req.query.filterCategory.replace(/';;'/g, ';').split(';'), '')
    // const filterContents = arrayRemove(req.query.filterContents.replace(/';;'/g, ';').split(';'), '')

    // nothing to search
    // if (searchTarget === undefined || searchTarget.length === 0 || searchTarget.replace(/\s/g, '') === '') {
    //     return HTMLLoaderInst.assembleHTML(res, 'public/html', 'home');
    // // something to search
    // } else {
    //     // const result = dataLoaderInst.searchData(searchTarget, filterCategory, filterContents);
        // result = dataLoaderInst.searchData(searchTarget, '', '');

        // // const resultTotalCount = result.resultTotalCount;

        // return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, result, dataLoaderInst.metaData);
    // }
}