var Attr = require("../util").FileAttr,
    Zip = require("../adm-zip"),
    fs = require("fs");

/*
var zip = new Zip();
zip.addLocalFolder("c:/asd/");
zip.writeZip("c:/asd.zip");
*/

var zip = new Zip("c:/asd.zip");
zip.getEntries().forEach(function(entry) {
   // console.log(entry.toString());
});
zip.extractAllTo("C:/test");
