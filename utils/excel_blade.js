var path = "c:\\tmp\\exxx.xls";
var excelParser = require('excel-parser');

excelParser.worksheets({
  inFile: path
}, function(err, worksheets){
  if(err) console.error(err);
  console.log(worksheets);
});