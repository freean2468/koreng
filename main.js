var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var security = require('./lib/security.js');
var DataLoader = require('./lib/dataLoader.js');
var dataLoaderInst = new DataLoader();

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  var title = queryData.id;

  if (pathname === '/') {
    response.writeHead(200);

    if (title === undefined) {
      response.end(template.HTML('koreng', 'Hello, world'));
    } else {
      title = security.sanitizeHtml(title);

      fs.readFile('data/' + title, 'utf8', (err, description) => {
        response.end(template.HTML(title, description));
      });
    }
  } else if (pathname === '/search') {
    title = security.sanitizeHtml(title);

    response.end(template.HTML('Search',
      `<form action="search_process" method="post">
        <p><textarea name="search" id="desc" cols="150" rows="20"></textarea></p>
        <p><input type="submit" name="submit"></p>
      </form>
      `));
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
      var post = qs.parse(body);
      var searchTarget = security.sanitizeHtml(post.search);
      dataLoaderInst.searchData(searchTarget);

      response.writeHead(302, {
        Location: `/search`
      });
      response.end();
    });
  }
};