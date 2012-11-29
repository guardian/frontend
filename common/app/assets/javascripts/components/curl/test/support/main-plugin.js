define(function(){
	return {
		load: function (id, require, loaded, config) {
			// just echo config back
			loaded(config);
		}
	};
});
