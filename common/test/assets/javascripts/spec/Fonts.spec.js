define(['common', 'modules/fonts'], function(common, Fonts) {
    
    describe("Web Font Loader", function() {
        
        var styleNodes;
        var fileFormat;
        var storagePrefix = 'gufont-';

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
                	expect(localStorage.getItem(storagePrefix + name)).toBe('@font-face{');
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
                	expect(localStorage.getItem(storagePrefix + name)).toBe('@font-face{');
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
                	expect(localStorage.getItem(storagePrefix + name)).toBe('@font-face{android');
                	expect(styleNodes[i].innerHTML).toBe('@font-face{android');
                }
            });
        });

        it("should not request css files if localStorage already has them", function() {
            var callbackCount = 0;
            common.mediator.on('modules:fonts:notloaded', function() { callbackCount++; });

            // Pretend data was already in localStorage
            for (var i = 0, j = styleNodes.length; i<j; ++i) {
                localStorage.setItem(storagePrefix + styleNodes[i].getAttribute('data-cache-name'), '@font-face{notfromnetwork');
            }

            runs(function() {
                new Fonts(fileFormat).loadFromServer('fixtures/');
            });

            waitsFor(function() {
                return (callbackCount === styleNodes.length);
            }, "notloaded callback never ran", 1000);

            runs(function() {
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                    var name = styleNodes[i].getAttribute('data-cache-name');
                    expect(localStorage.getItem(storagePrefix + name)).toBe('@font-face{notfromnetwork');
                }
            })
                
        });

        it("should be able to remove all fonts from storage in bulk", function() {
            
            // Pretend data was already in localStorage
            for (var i = 0, j = styleNodes.length; i<j; ++i) {
                localStorage.setItem(storagePrefix + styleNodes[i].getAttribute('data-cache-name'), '@font-face{notfromnetwork');
            }
            expect(localStorage.length).toEqual(styleNodes.length);

            new Fonts(fileFormat).clearFontsFromStorage();

            // localStorage should be empty.
            expect(localStorage.length).toEqual(0);


            runs

        });

        it("should not request css files if localStorage is full or disabled", function() {
        	var callbackCount = 0;
        	common.mediator.on('modules:fonts:notloaded', function() { callbackCount++; });

        	// Force localStorage to throw error.
        	localStorage.setItem = null;

        	runs(function() {
                new Fonts().loadFromServer('fixtures/');
            });

            waitsFor(function() {
            	return (callbackCount === styleNodes.length);
            }, "notloaded callback never ran", 1000);

            runs(function() {
            	for (var i = 0, j = styleNodes.length; i<j; ++i) {
                	var name = styleNodes[i].getAttribute('data-cache-name');
                	expect(localStorage.getItem(storagePrefix + name)).toBe(null);
                }
            })
        		
        });

    });

});