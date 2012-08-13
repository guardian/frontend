define(['common', 'modules/fonts'], function(common, Fonts) {
    
    describe("Web Font Loader", function() {
        
        var styleNodes;
        var fileFormat;

        beforeEach(function() {
            localStorage.clear();
            styleNodes = document.querySelectorAll('[data-cache-name]');
            fileFormat = 'woff';
        });

        it("should request css files and cache in localStorage", function() {
        	var callbackCount = 0;
        	common.mediator.on('modules:fonts:loaded', function() { callbackCount++; });

            runs(function() {
                new Fonts(fileFormat).loadFromServer('fixtures/');
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
        	common.mediator.on('modules:fonts:loaded', function() { callbackCount++; });

            runs(function() {
                new Fonts(fileFormat).loadFromServerAndApply('fixtures/');
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

        it("should request the TTF version of css files for Android devices", function() {
        	var callbackCount = 0;
        	common.mediator.on('modules:fonts:loaded', function() { callbackCount++; });

        	fileFormat = 'ttf';

            runs(function() {
                new Fonts(fileFormat).loadFromServerAndApply('fixtures/');
            });

            waitsFor(function() {
            	return (callbackCount === styleNodes.length);
            }, "loaded callback never ran", 1000);

            runs(function() {
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                	var name = styleNodes[i].getAttribute('data-cache-name');
                	expect(localStorage.getItem(name)).toBe('@font-face{android');
                	expect(styleNodes[i].innerHTML).toBe('@font-face{android');
                }
            });
        });

        it("should not request css files if localStorage already has them", function() {
            var callbackCount = 0;
            common.mediator.on('modules:fonts:notloaded', function() { callbackCount++; });

            // Pretend data was already in localStorage
            for (var i = 0, j = styleNodes.length; i<j; ++i) {
                localStorage.setItem(styleNodes[i].getAttribute('data-cache-name'), '@font-face{');
            }

            runs(function() {
                new Fonts(fileFormat).loadFromServer('fixtures/');
            });

            waitsFor(function() {
                console.log(styleNodes.length);
                return (callbackCount === styleNodes.length);
            }, "notloaded callback never ran", 1000);

            runs(function() {
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                    var name = styleNodes[i].getAttribute('data-cache-name');
                    expect(localStorage.getItem(name)).toBe('@font-face{');
                }
            })
                
        });

        it("should not request css files if localStorage is full or disabled", function() {
        	var callbackCount = 0;
        	common.mediator.on('modules:fonts:notloaded', function() { callbackCount++; });

        	// Force localStorage to throw error.
        	localStorage.setItem = null;

        	runs(function() {
                new Fonts(fileFormat).loadFromServer('fixtures/');
            });

            waitsFor(function() {
                console.log(styleNodes.length);
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