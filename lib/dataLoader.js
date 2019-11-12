module.exports = DataLoader;

function DataLoader() {
  this.fs = require('fs');
  this.pt = require('path');
  this.data = [];

  this.readData = function(dir) {
    const items = this.fs.readdirSync(dir);

    for (let i = 0; i < items.length; ++i) {
      const item = items[i];
      const itemPath = this.pt.join(dir, item);
      const stats = this.fs.statSync(itemPath);

      if (stats.isDirectory()) {
        this.readData(itemPath);
      } else {
        if (itemPath.split(".")[1] === 'json') {
          var obj = JSON.parse(this.fs.readFileSync(itemPath));
          obj.contents = this.fs.readFileSync(itemPath.split(".")[0]+'.txt').toString().replace(/(\r\n|\n|\r|\s\s)/gm, "");
          this.data.push(obj);
        } else if (itemPath.split(".")[1] === 'txt') {
          // console.log(itemPath);
          // this.data[0].contents = this.fs.readFileSync(itemPath).toString();
        } else {
          console.log(`readData err : ${itemPath}`);
        }
      }
    }
  };

  this.showData = function() {
    this.data.forEach((item) => {
      console.log(`Title : ${item.title}`);
      console.log('Contents : ' + item.contents.slice(0, 10));
    });
  };

  this.searchData = function(searchTarget) {
    var resObjList = [];

    // this.data.forEach((item) => {
    for (var i = 0; i < this.data.length; ++i) {
      const item = this.data[i];
      var resObj = {
        title: item.title,
        resList: []
      };

      var res = 0;
      while (1) {
        res = item.contents.indexOf(searchTarget, res);
        if (res === -1) {
          break;
        } else {
          resObj.resList.push(item.contents.slice(res - 70, res + 70));
          res += searchTarget.length;
        };
      }
      resObjList.push(resObj);
    }
    console.log(resObjList);
  }

  this.readData('./data');
  this.showData();
}
