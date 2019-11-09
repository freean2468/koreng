var fs = require('fs');

module.exports = {
  HTML: function(title, description) {
    var list = '<ul>';
    var fileList = fs.readdirSync('./Data');
    var i = 0;
    while (i < fileList.length) {
      list += `<li><a href="/?id=${fileList[i]}">${fileList[i]}</a></li>`;
      i++;
    }
    list += '</ul>';
    var control = '';

    control = `
            <a href="/search">Search</a>
            `;

    return `<!doctype html>
  <html>
  <head>
  <title>${title}</title>
  <meta charset="utf-8">
  </head>
  <body>
  <h1><a href="/">Koreng</a></h1>
  <ol>
  ${list}
  ${control}
  </ol>
  <h2>${title}</h2>
  <p>${description}</p>
  </body>
  </html>
  `;
  }
};
