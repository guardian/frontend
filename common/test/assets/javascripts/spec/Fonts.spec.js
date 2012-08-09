define(['common', 'modules/fonts'], function(common, Fonts) {
    
    describe("Web Font Loader", function() {
        
        var styleNodes;

        beforeEach(function() {
            localStorage.clear();
            styleNodes = document.querySelectorAll('[data-cache-name]');
        });

        it("should request css files and cache in localStorage", function() {
        	var callbackCount = 0;
        	common.pubsub.on('modules:fonts:loaded', function() { callbackCount++; });

            runs(function() {
                new Fonts().loadFromServer('fixtures/');
            });

            waitsFor(function() {
            	return (callbackCount === styleNodes.length);
            }, "loaded callback never ran", 1000);

            runs(function() {
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                	var name = styleNodes[i].getAttribute('data-cache-name');
                	expect(localStorage.getItem(name)).toBe('@font-face{');
                }
            });
        });

        it("should request css files, cache in localStorage and apply the styles", function() {
        	var callbackCount = 0;
        	common.pubsub.on('modules:fonts:loaded', function() { callbackCount++; });

            runs(function() {
                new Fonts().loadFromServerAndApply('fixtures/');
            });

            waitsFor(function() {
            	return (callbackCount === styleNodes.length);
            }, "loaded callback never ran", 1000);

            runs(function() {
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                	var name = styleNodes[i].getAttribute('data-cache-name');
                	expect(localStorage.getItem(name)).toBe('@font-face{');
                	expect(styleNodes[i].innerHTML).toBe('@font-face{');
                }
            });
        });

        it("should not request css files if localStorage is full or disabled", function() {
        	var callbackCount = 0;
        	common.pubsub.on('modules:fonts:notloaded', function() { callbackCount++; });

        	// Force localStorage to throw error.
        	window.localStorage.setItem = null;

        	runs(function() {
                new Fonts().loadFromServer('fixtures/');
            });

            waitsFor(function() {
            	return (callbackCount === styleNodes.length);
            }, "notloaded callback never ran", 1000);

            runs(function() {
            	for (var i = 0, j = styleNodes.length; i<j; ++i) {
                	var name = styleNodes[i].getAttribute('data-cache-name');
                	expect(localStorage.getItem(name)).toBe(null);
                }
            })
        		
        });

    });

});