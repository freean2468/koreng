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
      response.end(template.HTML('Hello, world'));
    }
    // Should response to css file request
  } else if (pathname.split(".")[1] === 'css') {
    console.log(pathname);
    //title = security.sanitizeHtml(title);
    response.writeHead(200, {
      'Content-type': 'text/css'
    });
    response.write(fs.readFileSync(`./style${pathname}`, {
      encoding: 'utf8'
    }));
    response.end('');
  } else if (pathname === '/search_process') {
    onSearch(request, response);
  } else {
    response.writeHead(404);
    response.end('Not found');
  }

});

app.listen(3000);

function onSearch(request, response) {
  if (request.method === 'POST') {
    var body = '';

    request.on('data', function(data) {
      body += data;

      if (body.length > 1e6)
        request.connection.destroy();
    });

    request.on('end', function() {
      const post = qs.parse(body);
      const searchTarget = security.sanitizeHtml(post.search);

      // nothing to search
      if (searchTarget === undefined || searchTarget.length === 0 || searchTarget.replace(/\s/g, '') === '') {
        response.writeHead(200);
        response.end(template.HTML('you want to type some expressions above.'));
      // something to search
      } else {
        const result = dataLoaderInst.searchData(searchTarget);
        const resultTotalCount = result.resultTotalCount;

        if (result.resultTotalCount === 0) {
          response.writeHead(200);
          response.end(template.HTML('no results'));
        } else {
          response.writeHead(200);
          response.end(template.HTML(resultHandling(searchTarget, result)));
        }
      }
    });
  }
};

//temp
function resultHandling(searchTarget, result) {
  const resTotalCount = result.resultTotalCount;
  const resList = result.resObjList;
  const searchTargetStyle = `<b style="-webkit-text-decoration: underline double #ff2200;
                            text-decoration: underline wavy #ff5500">${searchTarget}</b>`;

  // insert HTML dynamic code
  var temp = `${searchTargetStyle} total result(s) : ${resTotalCount} of ${resList.length} contents <br><br>`;
  var blockCount = 0;

  for (var item in resList) {
    //div header
    temp += `<div class="resBlockHeader" id="${blockCount}">`;
    //span Header
    temp += `<span>
            < ${resList[item].title} >, ${resList[item].category},
            ${resList[item].language}, result(s) : ${resList[item].resList.length}
            </span>`;
    temp += `<span class="minimizeButton" id="minimizeButton_${blockCount}">-</span>`;
    //div Body
    temp += `<div class="resBlockBody" id="resBlockBody_${blockCount}"><ol>`;
    for (var _item in resList[item].resList) {
      var sentence = resList[item].resList[_item];
      var regex = new RegExp(searchTarget, "g")
      sentence = sentence.replace(regex, searchTargetStyle);

      temp += `<li>${sentence} </li><br>`;
    }
    //div close
    temp += `</ol></div></div><br>`;
    ++blockCount;
  }

  return temp;
}
