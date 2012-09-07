define(['common', 'modules/fonts'], function(common, Fonts) {
    
    describe("Web Font Loader", function() {
        
        var styleNodes;
        var fileFormat;
        var storagePrefix = '_guFont:';

        beforeEach(function() {
            localStorage.clear();
            styleNodes = document.querySelectorAll('[data-cache-name]');
            fileFormat = 'woff';
            callbackSpy = sinon.spy(function(){});
        });

        it("should request css files and cache in localStorage", function() {
        	
            common.mediator.on('modules:fonts:loaded', callbackSpy);

            runs(function() {
                new Fonts(styleNodes, fileFormat).loadFromServer('fixtures/');
            });

            waitsFor(function() {
            	return (callbackSpy.calledTwice);
            }, "loaded callback never ran", 1000);

            runs(function() {
                expect(callbackSpy.calledTwice).toBeTruthy();
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                	var name = styleNodes[i].getAttribute('data-cache-name');
                	expect(localStorage.getItem(storagePrefix + name)).toBe('@font-face{');
                 }
            });
        });

        it("should request css files, cache in localStorage and apply the styles", function() {
        	
            common.mediator.on('modules:fonts:loaded', callbackSpy);

            runs(function() {
                new Fonts(styleNodes, fileFormat).loadFromServerAndApply('fixtures/');
            });

            waitsFor(function() {
            	return (callbackSpy.calledTwice);
            }, "loaded callback never ran", 1000);

            runs(function() {
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                	var name = styleNodes[i].getAttribute('data-cache-name');
                	expect(localStorage.getItem(storagePrefix + name)).toBe('@font-face{');
                	expect(styleNodes[i].innerHTML).toBe('@font-face{');
                }
            });
        });

        it("should request the TTF version of css files when requested", function() {
        	
            common.mediator.on('modules:fonts:loaded', callbackSpy);

        	fileFormat = 'ttf';

            runs(function() {
                new Fonts(styleNodes, fileFormat).loadFromServerAndApply('fixtures/');
            });

            waitsFor(function() {
            	return (callbackSpy.calledTwice);
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
            
            common.mediator.on('modules:fonts:notloaded', callbackSpy);

            // Pretend data was already in localStorage
            for (var i = 0, j = styleNodes.length; i<j; ++i) {
                localStorage.setItem(storagePrefix + styleNodes[i].getAttribute('data-cache-name'), '@font-face{notfromnetwork');
            }

            runs(function() {
                new Fonts(styleNodes, fileFormat).loadFromServer('fixtures/');
            });

            waitsFor(function() {
                return (callbackSpy.calledTwice);
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
            // Plus one non-font storage.
            localStorage.setItem('guUserPref:myPref', 'myprefvalue')

            expect(localStorage.length).toEqual(styleNodes.length + 1);

            Fonts.clearFontsFromStorage();

            // localStorage should be empty.
            expect(localStorage.length).toEqual(1);
            expect(localStorage.getItem('guUserPref:myPref')).toEqual('myprefvalue');

        });

        it("should not request css files if localStorage is full or disabled", function() {
        	
            common.mediator.on('modules:fonts:notloaded', callbackSpy);

        	// Force localStorage to throw error.
        	localStorage.setItem = null;

        	runs(function() {
                f = new Fonts(styleNodes, fileFormat)
                f.loadFromServer('fixtures/');
                reqwestSpy = sinon.spy(f.reqwest);
            });

            waitsFor(function() {
            	return (callbackSpy.calledTwice);
            }, "notloaded callback never ran", 1000);

            runs(function() {

                expect(reqwestSpy.callCount).toBe(0);

                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                	var name = styleNodes[i].getAttribute('data-cache-name');
                	expect(localStorage.getItem(storagePrefix + name)).toBe(null);
                }
            })
        		
        });

    });

});
