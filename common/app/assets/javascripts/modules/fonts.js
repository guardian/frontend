define(['common', 'modules/detect', 'reqwest'], function (common, detect, reqwest) {

    function Fonts() {
    
        var connectionSpeed = detect.getConnectionSpeed(),
            layoutMode = detect.getLayoutMode();

        function fontIsRequired(style) {
        	// A final check for localStorage.
        	// Because it would be horrible if people downloaded fonts and then couldn't cache them.
        	try {
        		return (localStorage.getItem(style.getAttribute('data-cache-name')) === null);
        	}
        	catch(e) {
        		return false;
        	}
        }

        this.loadFromServer = function(fontServer) {
        	var styleNodes = document.querySelectorAll('[data-cache-name]');
            for (var i = 0, j = styleNodes.length; i<j; ++i) {
            	var style = styleNodes[i];
            	if (fontIsRequired(style)) {
            		reqwest({
	                    url: fontServer + '/' + style.getAttribute('data-cache-file'),
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