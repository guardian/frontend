define(function() {

	/*  super basic printf / templating tool
		source: http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format/4673436#4673436 */
	function format(str) {
		var args = arguments;
		return str.replace(/{(\d+)}/g, function(match, number) {
			var index = parseInt(number) + 1; // offset by 1 because str is first arg
			return typeof args[index] != 'undefined' ? args[index] : match;
		});
	}

	return {
		format: format
	};

});