
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
app.use('/', express.static('/public/image'));

// Home
app.get('/', (req, res) => HTMLLoaderInst.assembleStaticHTML(res, '','home'))

// Search
app.get('/preSearch', (req, res) => preSearch(req, res))
app.get('/search', (req, res) => {
    let target = req.query.target
    const redirectionTable = mongoClientInst.redirectionTable
    
    // check redirection
    if (redirectionTable[target] !== undefined)
        target = redirectionTable[target]
    HTMLLoaderInst.assembleSearchHTML(res, req.query.target)
})

// get cy data from mongoDB
app.get('/cy', (req, res, next) => getCyData(req, res, next))

// get video data from mongoDB
app.get('/video', (req, res, next) => getVideoData(req, res, next))

// Main
app.get("/" + encodeURIComponent("toddler"), (req, res) => HTMLLoaderInst.assembleStaticHTML(res, "toddler", "toddler"))

app.use(function(req, res, next) {
    res.status(404)
    HTMLLoaderInst.assembleStaticHTML(res, '', 'home')
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
    redirectionTable = mongoClientInst.redirectionTable
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