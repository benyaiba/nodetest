$(function(){
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
});

$(function(){
  setInterval(drawRandomLine, 300);
});

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
  var width = 300;
  var height = 300;
  var x = random(width);
  var y = random(height);
  var x2 = random(width);
  var y2 = random(height);
  var ctx = $("#testCanvas2").get(0).getContext("2d");
  drawLine(x, y, x2,y2, ctx);
}