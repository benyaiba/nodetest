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
	
	$.fn.colorIt.params = {
		color: "red"
	}
})(jQuery);

