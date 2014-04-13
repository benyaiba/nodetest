(function($){
	$.fn.colorIt = function(params){
		var params = $.extend($.fn.colorIt.params, params);
		return this.find("a").css("color", params.color);
	}
	
	$.fn.showLinkHref = function(){
		return this.filter("a").append(function(){
			return " ( " + this.href + " )";
		});
	}
	
	$.fn.showLinkHref2 = function(callback){
		return this.filter("a").each(function(){
			var h = $(this).attr("href");
			$(this).append(" ( " + h + " )");
			if(callback){
				callback.call(this);
			}
		});
	}
  
  // left side bar
  $.fn.leftSideBar = function(){
    this.find("a").on("click", function(){
      var h = $(this).attr("href");
      loadPage(h);
      return false;
    });
  }
	
	$.fn.colorIt.params = {
		color: "red"
	}
  
  // extend for method : "$.outerHTML()"
  $.fn.outerHTML = function() {
    return $(this).clone().wrap('<div></div>').parent().html();
  }
  
  // extends jquery to implements method: serializeObject
  $.fn.serializeObject = function() {
    var arrayData, objectData;
    arrayData = this.serializeArray();
    objectData = {};

    $.each(arrayData, function() {
      var value;

      if (this.value != null) {
        value = this.value;
      } else {
        value = '';
      }

      if (objectData[this.name] != null) {
        if (!objectData[this.name].push) {
          objectData[this.name] = [objectData[this.name]];
        }

        objectData[this.name].push(value);
      } else {
        objectData[this.name] = value;
      }
    });
    return objectData;
  };
})(jQuery);

