(function (curl, cb) {

	curl.config({
		baseUrl: '',
		paths: {
			curl: '../src/curl'
		}
	});
	curl(['stuff/one'], cb);

}(curl, callback));