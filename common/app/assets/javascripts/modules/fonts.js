define(['reqwest', 'common'], function(reqwest, common) {

    function Fonts(styleNodes, fileFormat) {

        this.styleNodes = styleNodes;
    	this.fileFormat = fileFormat;
        this.reqwest = reqwest; // expose publicly so we can inspect it in unit tests

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
            		this.reqwest({
	                    url: url + style.getAttribute('data-cache-file-' + this.fileFormat),
	                    type: 'jsonp',
	                    jsonpCallbackName: 'guFont',
	                    success: (function(style) {
	                    	return function(json) {
	                    		if (typeof callback === 'function') {
	                        		callback(style, json);
	                        	}
	                    		localStorage.setItem(Fonts.storagePrefix + style.getAttribute('data-cache-name'), json.css);
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

    Fonts.storagePrefix = "guFont:";

    Fonts.clearFontsFromStorage = function() {
        // Loop through in reverse because localStorage indexes will change as you delete items.
        for (var i = localStorage.length-1; i>-1; --i) {
            var name = localStorage.key(i);
            if (name.indexOf(Fonts.storagePrefix) === 0) {
                localStorage.removeItem(name);
            }
        }
    }

    Fonts.detectSupportedFormat = function(ua) {
        ua = ua.toLowerCase();
        var format = 'woff';
        if (ua.indexOf('android') > -1) {
            format = 'ttf';
        }
        if (ua.indexOf('iphone os') > -1 && ua.indexOf('iphone os 5') < 0) {
            format = 'ttf';
        }
        return format;
    }
    
    return Fonts;

});
