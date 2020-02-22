
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

// app.use('/', express.static(__dirname+'/public/html'));

// images
app.use('/', express.static(__dirname+'/public/image'));

// Home
app.get('/', (req, res) => HTMLLoaderInst.assembleHTML(res, '','home'))

// Search
app.get('/preSearch', (req, res) => preSearch(req, res))
app.get('/search', (req, res) => onSearch(req, res))

// get cy data from mongoDB
app.get('/cy', (req, res, next) => getCyData(req, res, next))

// get video data from mongoDB
app.get('/video', (req, res, next) => getVideoData(req, res, next))

//REPLACE_OPEN
// Main
app.get("/" + encodeURIComponent("toddler"), (req, res) => HTMLLoaderInst.assembleHTML(res, "toddler", "toddler"))
//REPLACE_CLOSE

// app.post('/filter_process', (req, res) => res.send(onSearchWithFilter(req, res)))
// app.get('/filter', (req, res) => res.send(HTMLLoaderInst.resultHandlingForFilter(dataLoaderInst.metaData)))

app.use(function(req, res, next) {
    res.status(404)
    HTMLLoaderInst.assembleHTML(res, '', 'home')
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
function preSearch(req, res) {
    const searchTarget = req.query.target
    presearchTable = mongoClientInst.presearchTable
    var responseData = []
    const exp = new RegExp(searchTarget)

    presearchTable.forEach(element => {
        if (element.match(exp))
            responseData.push({
                "search" : element
            })
    });

    res.json(responseData);
}

async function getCyData(req, res, next) {
    const searchTarget = req.query.target
    var mongoRes = await mongoClientInst.findOneListingById(searchTarget)
    
    if (mongoRes) {
        res.json(mongoRes);
    } else {
        console.log("something's wrong!! in getCyData")
        next()
    }    
}

async function getVideoData(req, res, next) {
    const searchTarget = req.query.target
    console.log(searchTarget)
    var mongoRes = await mongoClientInst.findVideoListingById(searchTarget)
    
    if (mongoRes) {
        res.json(mongoRes);
    } else {
        console.log("something's wrong!!in getVideoData")
        next()
    }    
}

function onSearch(req, res) {
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

    searchRes = {
        resultTotalCount: 0,
        resObjList: []
    }


    return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, searchRes, dataLoaderInst.metaData);

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