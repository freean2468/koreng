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
app.get('/', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html','home'))

//
// feelingmap
app.get('/feelingmap', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'feelingmap'))

app.get('/angry', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'angry'))
app.get('/angry_cy', (req, res) => HTMLLoaderInst.assembleCyHTML(res, 'public/html', 'angry'))

app.get('/sorry', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'sorry'))
app.get('/sorry_cy', (req, res) => HTMLLoaderInst.assembleCyHTML(res, 'public/html', 'sorry'))
app.get('/atone', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'atone'))

app.get('/kind', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'kind'))
app.get('/kind_cy', (req, res) => HTMLLoaderInst.assembleCyHTML(res, 'public/html', 'kind'))
app.get('/benevolent', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'benevolent'))

app.get('/happy', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'happy'))
app.get('/happy_cy', (req, res) => HTMLLoaderInst.assembleCyHTML(res, 'public/html', 'happy'))
app.get('/happy-as-clams', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'happy-as-clams'))

//
// verbmap
app.get('/verbmap', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'verbmap'))

app.get('/to-be', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'to-be'))
app.get('/to-be_cy', (req, res) => HTMLLoaderInst.assembleCyHTML(res, 'public/html', 'to-be'))
app.get('/bode', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'bode'))

app.get('/leave', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'leave'))
app.get('/leave_cy', (req, res) => HTMLLoaderInst.assembleCyHTML(res, 'public/html', 'leave'))
app.get('/go-away', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'go-away'))
app.get('/bugger-off', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'bugger-off'))

app.get('/hate', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'hate'))
app.get('/hate_cy', (req, res) => HTMLLoaderInst.assembleCyHTML(res, 'public/html', 'hate'))
app.get('/abhor', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'abhor'))

app.get('/change', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'change'))
app.get('/change_cy', (req, res) => HTMLLoaderInst.assembleCyHTML(res, 'public/html', 'change'))
app.get('/alter', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'alter'))
app.get('/alteration', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'alteration'))

//
// titlemap
app.get('/titlemap', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'titlemap'))
app.get('/brother', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'brother'))
app.get('/brother_cy', (req, res) => HTMLLoaderInst.assembleCyHTML(res, 'public/html', 'brother'))
app.get('/brethren', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'brethren'))

// toddler
app.get('/toddler', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'toddler'))

// game
app.get('/game', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'game'))
app.get('/zelda_mm', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'zelda_mm'))
app.get('/zelda_oot', (req, res) => HTMLLoaderInst.assembleHTML(res, 'public/html', 'zelda_oot'))

// Search
app.get('/search', (req, res) => onSearch(req, res))

// app.post('/filter_process', (req, res) => res.send(onSearchWithFilter(req, res)))
// app.get('/filter', (req, res) => res.send(HTMLLoaderInst.resultHandlingForFilter(dataLoaderInst.metaData)))

app.use(function(req, res, next) {
  res.status(404)
  HTMLLoaderInst.assembleHTML(res, 'public/html', 'home')
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
    return HTMLLoaderInst.assembleHTML(res, 'public/html', 'home');
  // something to search
  } else {
    // const result = dataLoaderInst.searchData(searchTarget, filterCategory, filterContents);
    const result = dataLoaderInst.searchData(searchTarget, '', '');

    // const resultTotalCount = result.resultTotalCount;

    return HTMLLoaderInst.assembleSearchResultHTML(res, searchTarget, result, dataLoaderInst.metaData);
  }
}
