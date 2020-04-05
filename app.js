//
// main code
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

// custom
const HTMLLoader = require('./feature/HTMLLoader.js')
const HTMLLoaderInst = new HTMLLoader()
const dataLoader = require('./feature/dataLoader.js')
const dataLoaderInst = new dataLoader()
const mongoClient = require('./feature/mongoClient.js')
const mongoClientInst = new mongoClient()

// for Heroku
const PORT = process.env.PORT || 5000

// middlewares
app.use(express.static('public'))
app.use(helmet())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}))
app.use(compression())

// code down below doesn't work at Heroku 
// do not use '__dirname'
// app.use('/', express.static(__dirname+'/public/html'));

// images
app.use('/', express.static('/public/image'));

// Home
app.get('/', (req, res) => {
    let target = 'sensebe'
    const presearchTable = mongoClientInst.presearchTable

    for (let idx = 0; idx < presearchTable.length; ++idx) {
        if (presearchTable[idx].toLowerCase() === target) {
            target = presearchTable[idx]
            break
        }
    }

    HTMLLoaderInst.assembleSearchHTML(res, target)
})

// Search
app.get('/preSearch', (req, res) => preSearch(req, res))
app.get('/search', (req, res) => {
    let target = req.query.target.toLowerCase()
    const redirectionTable = mongoClientInst.redirectionTable
    const presearchTable = mongoClientInst.presearchTable

    for (let idx = 0; idx < presearchTable.length; ++idx) {
        if (presearchTable[idx].toLowerCase() === target) {
            target = presearchTable[idx]
            break
        }
    }
    
    // check redirection
    if (redirectionTable[target] !== undefined)
        target = redirectionTable[target]

    HTMLLoaderInst.assembleSearchHTML(res, target)
})

// AJAX - get cy data from mongoDB
app.get('/cy', (req, res, next) => getCyData(req, res, next))

// AJAX - get video data from mongoDB
app.get('/video', (req, res, next) => getVideoData(req, res, next))

// AJAX - get DB status from mongoDB, called from HTMLLoader
app.get('/DB_status', (req, res, next) => res.json(mongoClientInst.getStatus()))

// AJAX - update DB status from mongoDB, called from koreng_mongo when data had been inserted.
app.get('/update_DB_status', (req, res, next) => updateDBStatus(req, res, next))

// AJAX - update Index Table 
app.get('/add_IndexTable', (req, res, next) => mongoClientInst.addIndexTable(res, req.query.id, req.query.root))

// AJAX - update Redirection Table 
app.get('/add_RedirectionTable', (req, res, next) => mongoClientInst.addRedirectionTable(res, req.query.root, req.query.redirection))

// AJAX - delete a element from Redirection Table 
app.get('/del_RedirectionTable', (req, res, next) => mongoClientInst.delRedirectionTable(res, req.query.root))

// when can not find any page
app.use(function(req, res, next) {
    res.status(404)
    HTMLLoaderInst.assembleSearchHTML(res, 'sensebe')
    console.log("something wrong! req.url : " + req.url)
});

// the very final exception code
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
// gets string from the req argument in AJAX transaction
// and gets a presearch table from local file, then check if the string is match with the elements of the presearch table. 
//
function preSearch(req, res) {
    const searchTarget = req.query.target.toLowerCase()
    const presearchTable = mongoClientInst.presearchTable
    var responseData = []
    const exp = new RegExp(searchTarget)

    presearchTable.forEach(element => {
        if (element.toLowerCase().match(exp)) {
            responseData.push({
                "search" : element
            })
        }
    });

    function customSort(a, b) {
        if(a.search.length == b.search.length){
             return 0
        } 
        return a.search.length > b.search.length ? 1 : -1; 
    } 
    
    responseData = responseData.sort(customSort)

    res.json(responseData)
}

//
// From now, codes below require a transaction with MongoDB
//

// get data from english dictionary collection in MongoDB
async function updateDBStatus(req, res, next) {
    const result = await mongoClientInst.setStatus()
    res.json(result)
}

// get data from english dictionary collection in MongoDB
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

// get data from video collection in MongoDB
async function getVideoData(req, res, next) {
    const searchTarget = req.query.target
    console.log('[SEARCHTARGET] ', searchTarget)
    var mongoRes = await mongoClientInst.findVideoListingById(searchTarget)
    
    if (mongoRes) {
        res.json(mongoRes);
    } else {
        console.log("something's wrong!!in getVideoData")
        next()
    }    
}