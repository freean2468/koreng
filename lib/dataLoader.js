module.exports = DataLoader;

// DataLoader holds all of contents(book, drama, music, etc.) which is a datapool to be searched
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
        // first read json file then put contents of relevant txt file into contents attribute in json
        if (itemPath.split(".")[1] === 'json') {
          var obj = JSON.parse(this.fs.readFileSync(itemPath));
          obj.contents = this.fs.readFileSync(itemPath.split(".")[0]+'.txt').toString().replace(/(\r\n|\n|\r|\s\s)/gm, " ");
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

  // Just to see whether items have been loaded well or not
  this.showData = function() {
    this.data.forEach((item) => {
      console.log(`Title : ${item.title}`);
      console.log('Contents : ' + item.contents.slice(0, 10));
    });
  };

  //
  this.searchData = function(searchTarget) {
    var resObjList = [];
    var resultTotalCount = 0;

    for (var i = 0; i < this.data.length; ++i) {
      const item = this.data[i];
      var resObj = {
        title: item.title,
        category: item.category,
        language: item.language,
        resList: []
      };

      var res = 0;

      // search target through contents from start to very end
      while (1) {
        res = item.contents.indexOf(searchTarget, res);
        // very end
        if (res === -1) {
          break;
          // something catched, so push result into list
        } else {
          let sentence = item.contents.slice(res - 250, res + 250);
          const firstSpaceIndex = sentence.indexOf(' ');
          const lastSpaceIndex = sentence.lastIndexOf(' ');
          resObj.resList.push(sentence.slice(firstSpaceIndex, lastSpaceIndex));
          res += searchTarget.length;
          ++resultTotalCount;
        }
      }
      // push only when there were results
      if (resObj.resList.length !== 0)
        resObjList.push(resObj);
    }
    return {resultTotalCount:resultTotalCount, resObjList:resObjList};
  }

  // initializing
  this.readData('./data');
  //this.showData();
}
