define(['common', 'modules/detect', 'reqwest'], function (common, detect, reqwest) {

    function Fonts() {
    
        var connectionSpeed = detect.getConnectionSpeed(),
            layoutMode = detect.getLayoutMode();

        this.loadFromServer = function(fontServer) {
        	var styleNodes = document.querySelectorAll('[data-cache-name]');
            for (var i = 0, j = styleNodes.length; i<j; ++i) {
            	var style = styleNodes[i];
            	console.log(style);
            	if (style.getAttribute('data-cache-full') !== true) {
            		reqwest({
	                    url: fontServer + style.getAttribute('data-cache-file'),
	                    type: 'jsonp',
	                    jsonpCallbackName: 'guFont',
	                    success: function(json) {
	                    	localStorage.setItem(json.name, json.css);
	                        common.pubsub.emit('modules:fonts:loaded', [json.name]);
	                    }
            		});
            	}
            }
        }

    }
    
    return Fonts;

});