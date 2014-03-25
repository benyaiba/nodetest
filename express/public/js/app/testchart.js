function testchartInit() {
	doInit();
}

function doInit() {
	var lines = [];
	var lineOne = {
		label: "lineOne",
		data: [[1, 1], [2, 2], [3, 3]]
	};
	lines.push(lineOne);
	var lineTwo = {
		label: "lineTwo",
		data: [[1, 3], [2, 6], [3, 2], [4, 4]],
		yaxis: 2
	};
	lines.push(lineTwo);
	var plot = $.plot("#chartArea", lines, {
		series: {
			lines: {
				show: true
			},
			points: {
				show: true
			}
		},
		xaxes: {
			ticks: [[1, "a"], [2, "b"], [3, "c"], [4, "d"]]
		},
		yaxes: [{
			ticks: 10,
			max: 10,
			min: 0,
			tickDecimals: 2,
			position: "left"
		},
		{
			min: 0,
			tickDecimals: 2,
			position: "right",
			alignTicksWithAxis: 1
		}],
		legend: {
			position: "nw",
			container: "#chartHeader",
			labelFormatter: function(label, series) {
				return "<span>" + label + "</span>";
			},
			noColumns: 4
		},
		grid: {
			backgroundColor: {
				colors: ["#fff", "lightblue"]
			},
			borderWidth: {
				top: 1,
				right: 1,
				bottom: 2,
				left: 2
			},
			hoverable: true,
			clickable: true
		}
	});

	// bind event
	$("#chartArea").bind("plothover",
	function(event, pos, item) {
		//console.log("11111", pos, item);
	});
  	$("#chartArea").bind("plotclick",
	function(event, pos, item) {
    if(item){
      //console.log("11111", pos, item);
      var content = item.datapoint[0] + " - " + item.datapoint[1];
      showTooltip(item.pageX + 5, item.pageY + 5, content);
    }else{
      hideTooltip();
    }
	});
  
  function hideTooltip(){
    $("#tt").hide();
  }
  function showTooltip(x, y, content){
    console.log(x, y, content);
    if($("body > #tt").length == 0){
      $("#tt").appendTo($("body"));
    }
    
    $("#tt").html(content);
    $("#tt").css({
      "top": y,
      "left": x,
      "display": "block"
    });
  }
  
  // redraw
  function redraw(){
    var newData = [[[1,1],[2,2],[3,3],[4,4]]];
    plot.setData(newData);
    plot.draw();
  }
  $("#btn").on("click", function(){
    redraw();
  });
}