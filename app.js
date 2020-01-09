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
app.get('/', (req, res) => HTMLLoaderInst.assembleHTML(res, 'home'))

app.get('/wordmap', (req, res) => HTMLLoaderInst.assembleHTML(res, 'wordmap'))

app.get('/toddler', (req, res) => HTMLLoaderInst.assembleHTML(res, 'toddler'))

app.get('/game', (req, res) => HTMLLoaderInst.assembleHTML(res, 'game'))
app.get('/zelda_mm', (req, res) => HTMLLoaderInst.assembleHTML(res, 'zelda_mm'))
app.get('/zelda_oot', (req, res) => HTMLLoaderInst.assembleHTML(res, 'zelda_oot'))

// Search & Filter
app.get('/search', (req, res) => onSearch(req, res))

// app.post('/filter_process', (req, res) => res.send(onSearchWithFilter(req, res)))
// app.get('/filter', (req, res) => res.send(HTMLLoaderInst.resultHandlingForFilter(dataLoaderInst.metaData)))

app.use(function(req, res, next) {
  res.status(404)
  HTMLLoaderInst.assembleHTML(res, 'home')
});
 
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(PORT, () => console.log(`agjac on port ${PORT}!`))

//
// functions
//
function onSearch(req, res) {
  function arrayRemove(arr, value) {
    return arr.filter(function(ele) {
      return ele != value;
    });
  }
  
  const searchTarget = req.query.target

  // const filterCategory = arrayRemove(req.query.filterCategory.replace(/';;'/g, ';').split(';'), '')
  // const filterContents = arrayRemove(req.query.filterContents.replace(/';;'/g, ';').split(';'), '')

  // nothing to search
  if (searchTarget === undefined || searchTarget.length === 0 || searchTarget.replace(/\s/g, '') === '') {
    return HTMLLoaderInst.assembleHTML(res, 'home');
  // something to search
  } else {
    // const result = dataLoaderInst.searchData(searchTarget, filterCategory, filterContents);
    const result = dataLoaderInst.searchData(searchTarget, '', '');

    // const resultTotalCount = result.resultTotalCount;

    return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, result, dataLoaderInst.metaData);
  }
}
