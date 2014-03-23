function testchartInit(){
  doInit();
}

function doInit(){
  var lines = [];
  var lineOne = {label: "lineOne", data: [[1,1],[2,2],[3,3]]};
  lines.push(lineOne);
  var lineTwo = {label: "lineTwo", data:[[1,3],[2,6],[3,2],[4,4]]};
  lines.push(lineTwo);
  $.plot("#chartContainer", lines);
}