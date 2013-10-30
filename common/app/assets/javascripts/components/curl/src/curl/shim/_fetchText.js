(function (freeRequire) {
define(/*=='curl/shim/_fetchText',==*/ function () {

	var fs, http, url;

	fs = freeRequire('fs');
	http = freeRequire('http');
	url = freeRequire('url');

	var hasHttpProtocolRx;

	hasHttpProtocolRx = /^https?:/;

	function fetchText (url, callback, errback) {
		if (hasHttpProtocolRx.test(url)) {
			loadFileViaNodeHttp(url, callback, errback);
		}
		else {
			loadLocalFile(url, callback, errback);
		}
	}

	return fetchText;

	function loadLocalFile (uri, callback, errback) {
		fs.readFile(uri, function (ex, contents) {
			if (ex) {
				errback(ex);
			}
			else {
				callback(contents.toString());
			}
		});
	}

	function loadFileViaNodeHttp (uri, callback, errback) {
		var options, data;
		options = url.parse(uri, false, true);
		data = '';
		http.get(options, function (response) {
			response
				.on('data', function (chunk) { data += chunk; })
				.on('end', function () { callback(data); })
				.on('error', errback);
		}).on('error', errback);
	}

});
}(require));
