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
const template = require('./lib/template.js')
const DataLoader = require('./lib/dataLoader.js')
const dataLoaderInst = new DataLoader()

// middlewares
app.use(express.static('public'))
app.use(helmet())
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))
app.use(compression())
 
app.get('/', (req, res) => res.send(template.mainHTML('활용이 궁금한 영어를 여러분이 즐긴 컨텐츠에서 검색해보세요')))

app.post('/search_process', (req, res) => res.send(onSearchWithFilter(req, res)))
app.post('/filter_process', (req, res) => res.send(onSearchWithFilter(req, res)))

app.get('/filter', (req, res) => res.send(template.resultHandlingForFilter(dataLoaderInst.metaData)))

app.use(function(req, res, next) {
  res.status(404).send(template.mainHTML('활용이 궁금한 영어를 여러분이 즐긴 컨텐츠에서 검색해보세요'));
});
 
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(3000, () => console.log('agjac on port 3000!'))

function onSearchWithFilter(req, res) {
  function arrayRemove(arr, value) {
    return arr.filter(function(ele) {
      return ele != value;
    });
  }
  
  const searchTarget = req.body.search
  const filterCategory = arrayRemove(req.body.filterCategory.replace(/';;'/g, ';').split(';'), '')
  const filterContents = arrayRemove(req.body.filterContents.replace(/';;'/g, ';').split(';'), '')

  // nothing to search
  if (searchTarget === undefined || searchTarget.length === 0 || searchTarget.replace(/\s/g, '') === '') {
    res.send(template.mainHTML('you want to type some expressions above.'));
  // something to search
  } else {
    const result = dataLoaderInst.searchData(searchTarget, filterCategory, filterContents);
    // const resultTotalCount = result.resultTotalCount;

    res.end(template.resultHandlingForMain(searchTarget, result));
  }
}
