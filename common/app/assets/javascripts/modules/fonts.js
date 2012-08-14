define(['common', 'modules/detect', 'reqwest'], function (common, detect, reqwest) {

    function Fonts(fileFormat) {

    	this.fileFormat = fileFormat || null;

        var storagePrefix = "gufont-",
            connectionSpeed = detect.getConnectionSpeed(),
            layoutMode = detect.getLayoutMode();

        function fontIsRequired(style) {
        	// A final check for localStorage.
        	// Because it would be horrible if people downloaded fonts and then couldn't cache them.
        	try {
        		localStorage.setItem('test', 'test1');
        		localStorage.removeItem('test');
        		return (localStorage.getItem(storagePrefix + style.getAttribute('data-cache-name')) === null);
        	}
        	catch(e) {
        		return false;
        	}
        }

        this.loadFromServer = function(url, callback) {

        	// If no URL, then load from standard static assets path.
        	var url = url || '';

        	var styleNodes = document.querySelectorAll('[data-cache-name]');
            for (var i = 0, j = styleNodes.length; i<j; ++i) {
            	var style = styleNodes[i];
            	if (fontIsRequired(style)) {
            		reqwest({
	                    url: url + style.getAttribute('data-cache-file-' + this.fileFormat),
	                    type: 'jsonp',
	                    jsonpCallbackName: 'guFont',
	                    success: (function(style) {
	                    	return function(json) {
	                    		if (typeof callback === 'function') {
	                        		callback(style, json);
	                        	}
	                    		localStorage.setItem(storagePrefix + json.name, json.css);
	                        	common.mediator.emit('modules:fonts:loaded', [json.name]);
	                    	}
	                    })(style)
            		});
            	} else {
            		common.mediator.emit('modules:fonts:notloaded', []);
            	}
            }
        }

        this.loadFromServerAndApply = function(url) {
        	var html = document.querySelector('html');
        	this.loadFromServer(url, function(style, json) {
        		style.innerHTML = json.css;
        		if (html.className.indexOf('font-' + json.name + '-loaded') < 0) {
        			html.className += ' font-' + json.name + '-loaded';
        		}
        	});
        }

        this.clearFontsFromStorage = function() {
            while(localStorage.length > 0) {
                var name = localStorage.key(0);
                if (name.indexOf(storagePrefix) === 0) {
                    localStorage.removeItem(name);
                }
            }
        }
    }
    
    return Fonts;

});