define(['curl'], function (curl) {

	curl.config({
		baseUrl: '',
		paths: {
			curl: '../src/curl'
		}
	});
	curl(['stuff/one'], callback);

});