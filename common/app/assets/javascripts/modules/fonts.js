define(['common', 'modules/detect', 'reqwest'], function (common, detect, reqwest) {

    function Fonts(styleNodes, fileFormat) {

        this.styleNodes = styleNodes;
    	this.fileFormat = fileFormat;

        var connectionSpeed = detect.getConnectionSpeed(),
            layoutMode = detect.getLayoutMode();

        function fontIsRequired(style) {
        	// A final check for localStorage.
        	// Because it would be horrible if people downloaded fonts and then couldn't cache them.
        	try {
        		localStorage.setItem('test', 'test1');
        		localStorage.removeItem('test');
        		return (localStorage.getItem(Fonts.storagePrefix + style.getAttribute('data-cache-name')) === null);
        	}
        	catch(e) {
        		return false;
        	}
        }

        this.loadFromServer = function(url, callback) {

        	// If no URL, then load from standard static assets path.
        	var url = url || '';

            for (var i = 0, j = this.styleNodes.length; i<j; ++i) {
            	var style = this.styleNodes[i];
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
	                    		localStorage.setItem(Fonts.storagePrefix + json.name, json.css);
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

    }

    Fonts.storagePrefix = "gufont-";

    Fonts.clearFontsFromStorage = function() {
        while(localStorage.length > 0) {
            var name = localStorage.key(0);
            if (name.indexOf(Fonts.storagePrefix) === 0) {
                localStorage.removeItem(name);
            }
        }
    }
    
    return Fonts;

});