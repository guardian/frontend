define(['common'], function (common) {

    var Errors = function (config) {
    	
    	var c = config || {};
    		isDev = (c.isDev !== undefined) ? c.isDev : false,
        	path = '/px.gif',
        	cons = c.console || window.console,
            win = c.window || window,
            body = document.body,
            createImage = function(url) {
                var image = new Image();
                image.id = 'js-err';
                image.className = 'h';
                image.src = url;
                body.appendChild(image);
            },
            makeUrl = function(properties) {
                return path + '?js/' + encodeURIComponent(properties.join(','));
            },
            log = function(message, filename, lineno) {
            	if (isDev) {
            		cons.error({message: message.toString(), filename: filename, lineno: lineno});
            	} else {
                    var url = makeUrl([message, filename, lineno]);
                    createImage(url);
            	}
            },
            init = function() {
                win.onerror = log;
            };
        
        return {
            log: log,
            init: init
        };
        
    };

    return Errors;
});

