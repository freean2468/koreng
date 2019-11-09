module.exports = {
  p: require('path'),
  sanitizeHtml: require('sanitize-html'),

  securePath: function(path) {
    return this.p.parse(path).base;
  }
};
