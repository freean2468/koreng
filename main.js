const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const template = require('./lib/template.js');
const security = require('./lib/security.js');
const DataLoader = require('./lib/dataLoader.js');
const dataLoaderInst = new DataLoader();

const app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.id;

  if (pathname === '/') {
    response.writeHead(200);

    if (title === undefined) {
      response.end(template.mainHTML('활용이 궁금한 영어를 여러분이 즐긴 컨텐츠에서 검색해보세요'));
    }
    // Should response to css file request
  } else if (pathname.split(".")[1] === 'css') {
    pathname = security.sanitizeHtml(pathname);
    response.writeHead(200, {
      'Content-type': 'text/css'
    });
    response.write(fs.readFileSync(`./style${pathname}`, {
      encoding: 'utf8'
    }));
    response.end('');
  } else if (pathname === '/search_process' || pathname === '/filter_process') {
    onSearchWithFilter(request, response);
  } else if (pathname === '/filter') {
    response.writeHead(200);
    response.end(template.resultHandlingForFilter(dataLoaderInst.metaData));
  } else {
    response.writeHead(404);
    response.end('Not found');
  }

});

app.listen(80);

function onSearchWithFilter(request, response) {
  if (request.method === 'POST') {
    var body = '';

    request.on('data', function(data) {
      body += data;

      if (body.length > 1e6)
        request.connection.destroy();
    });

    function arrayRemove(arr, value) {
      return arr.filter(function(ele) {
        return ele != value;
      });
    }

    request.on('end', function() {
      const post = qs.parse(body);
      const searchTarget = security.sanitizeHtml(post.search);
      const filterCategory = arrayRemove(security.sanitizeHtml(post.filterCategory).replace(/';;'/g, ';').split(';'), '');
      const filterContents = arrayRemove(security.sanitizeHtml(post.filterContents).replace(/';;'/g, ';').split(';'), '');

      // nothing to search
      if (searchTarget === undefined || searchTarget.length === 0 || searchTarget.replace(/\s/g, '') === '') {
        response.writeHead(200);
        response.end(template.mainHTML('you want to type some expressions above.'));
        // something to search
      } else {
        const result = dataLoaderInst.searchData(searchTarget, filterCategory, filterContents);
        const resultTotalCount = result.resultTotalCount;

        if (result.resultTotalCount === 0) {
          response.writeHead(200);
          response.end(template.resultHandlingForMain(searchTarget, result));
        } else {
          response.writeHead(200);
          response.end(template.resultHandlingForMain(searchTarget, result));
        }
      }
    });
  // sth unexpected
  } else {
    response.writeHead(200);
    response.end(template.mainHTML('Hello, world'));
  }
}
