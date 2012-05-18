define(function() {

	/*  super basic printf / templating tool
		source: http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436 */
	function format() {
	    var args = arguments;
	    return this.replace(/{(\d+)}/g, function(match, number) { 
	        return typeof args[number] != 'undefined' ? args[number] : match;
	    });
	};

	return {
		format: format
	}

});