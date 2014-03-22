var testdrawInterval = null;

function testdrawDestroy(){
  clearInterval(testdrawInterval);
}

function testdrawInit(){
  doInit1();
  doInit2();
  doInit3();
}

function doInit1(){
  var cDom = $("#testCanvas").get(0);
  var ctx = cDom.getContext("2d");
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(0,0,100,100);
  
  ctx.fillStyle = "rgba(0,0,255,0.5)";
  ctx.fillRect(105,0,100,100);
  
  ctx.moveTo(103,0);
  ctx.lineTo(103,100);
  ctx.strokeStyle = "rgb(255,0,0)";
  ctx.stroke();
  
  ctx.font = "20px simsun";
  ctx.fillText("时间都去哪儿了？",10,20);  
}

function doInit2(){
  testdrawInterval = setInterval(drawRandomLine, 300);
}

function random(value){
  return Math.random() * value;
}

function drawLine(x, y, x2,y2, ctx){
  ctx.moveTo(x,y);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = "red";
  ctx.stroke();
}
function drawRandomLine(){
  var width = 200;
  var height = 200;
  var x = random(width);
  var y = random(height);
  var x2 = random(width);
  var y2 = random(height);
  var ctx = $("#testCanvas2").get(0).getContext("2d");
  drawLine(x, y, x2,y2, ctx);
}

//================
function doInit3(){
  fillCanvas();
  bindEvent();
}
var nodes = [{
  x: 20,
  y: 100,
  w: 50,
  h: 100,
  color: "green"
},{
  x: 100,
  y: 50,
  w: 60,
  h: 150,
  color: "blue"
  }];
  
function fillCanvas(){
  var ctx = $("#testCanvas3").get(0).getContext("2d");
  nodes.forEach(function(item){
    ctx.fillStyle = item.color;
    ctx.fillRect(item.x, item.y, item.w, item.h);
  });
}

function bindEvent(){
  $("#testCanvas3").on("click", function(evt){
    var cx = $(this).offset().left;
    var cy = $(this).offset().top;
    var ox = evt.pageX;
    var oy = evt.pageY;
    var x = ox - cx;
    var y = oy - cy;
    nodes.forEach(function(item){
      if((x > item.x && x < (item.x + item.w))
        &&(y > item.y && y < (item.y + item.h))){
          console.log("in " + item.color + " -- ", cx, cy, ox, oy, x, y);
        }
    })
  });
  
}