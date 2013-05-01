define(['common', 'ajax', 'modules/fonts', 'modules/storage'], function(common, ajax, Fonts, storage) {
    
    describe("Web Font Loader", function() {

        var styleNodes,
            fileFormat,
            callback,
            storagePrefix = 'gu.fonts.';

        function getNameAndCacheKey(style) {       
            var nameAndCacheKey = style.getAttribute('data-cache-file-woff').match(/fonts\/(.*)\.woff\.(.*)\.js$/);
            return nameAndCacheKey[1] + '.' + nameAndCacheKey[2];
        }

        function replaceCacheKeysInDOM(from, to) {
            for (var i = 0, j = styleNodes.length; i<j; ++i) {
                styleNodes[i].setAttribute('data-cache-file-woff', styleNodes[i].getAttribute('data-cache-file-woff').replace('.' + from + '.', '.' + to + '.'));
                styleNodes[i].setAttribute('data-cache-file-ttf', styleNodes[i].getAttribute('data-cache-file-ttf').replace('.12345.', '.123456789.'));
            }
        }

        beforeEach(function() {
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            storage.removeAll();
            styleNodes = document.querySelectorAll('[data-cache-name]');
            fileFormat = 'woff';
            callback = sinon.stub();
        });

        it("should request css files and cache in localStorage", function() {
            
            common.mediator.on('modules:fonts:loaded', callback);

            runs(function() {
                new Fonts(styleNodes, fileFormat).loadFromServer('fixtures/');
            });

            waitsFor(function() {
                return (callback.calledTwice);
            }, "loaded callback never ran", 1000);

            runs(function() {
                expect(callback.calledTwice).toBeTruthy();
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                    expect(storage.get(storagePrefix + getNameAndCacheKey(styleNodes[i]))).toBe('@font-face{');
                }
            });
        });

        it("should request css files, cache in localStorage and apply the styles", function() {
            
            common.mediator.on('modules:fonts:loaded', callback);

            runs(function() {
                new Fonts(styleNodes, fileFormat).loadFromServerAndApply('fixtures/');
            });

            waitsFor(function() {
                return (callback.calledTwice);
            }, "loaded callback never ran", 1000);

            runs(function() {
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                    expect(storage.get(storagePrefix + getNameAndCacheKey(styleNodes[i]))).toBe('@font-face{');
                    expect(styleNodes[i].innerHTML).toBe('@font-face{');
                }
            });
        });

        it("should request the TTF version of css files when requested", function() {
            
            common.mediator.on('modules:fonts:loaded', callback);

            fileFormat = 'ttf';

            runs(function() {
                new Fonts(styleNodes, fileFormat).loadFromServerAndApply('fixtures/');
            });

            waitsFor(function() {
                return (callback.calledTwice);
            }, "loaded callback never ran", 1000);

            runs(function() {
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                    expect(storage.get(storagePrefix + getNameAndCacheKey(styleNodes[i]))).toBe('@font-face{android');
                    expect(styleNodes[i].innerHTML).toBe('@font-face{android');
                }
            });
        });

        it("should not request css files if localStorage already has them", function() {
            
            common.mediator.on('modules:fonts:notloaded', callback);

            // Pretend data was already in localStorage
            for (var i = 0, j = styleNodes.length; i<j; ++i) {
                storage.set(storagePrefix + getNameAndCacheKey(styleNodes[i]), '@font-face{notfromnetwork');
            }

            runs(function() {
                new Fonts(styleNodes, fileFormat).loadFromServer('fixtures/');
            });

            waitsFor(function() {
                return (callback.calledTwice);
            }, "notloaded callback never ran", 1000);

            runs(function() {
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                    expect(storage.get(storagePrefix + getNameAndCacheKey(styleNodes[i]))).toBe('@font-face{notfromnetwork');
                }
            })
                
        });

        it("should be able to remove all fonts from storage in bulk", function() {
            
            // Pretend data was already in localStorage
            for (var i = 0, j = styleNodes.length; i<j; ++i) {
                storage.set(storagePrefix + styleNodes[i].getAttribute('data-cache-name'), '@font-face{notfromnetwork');
            }
            // Plus one non-font storage.
            storage.set('guUserPref:myPref', 'myprefvalue');

            expect(storage.length()).toEqual(styleNodes.length + 1);

            new Fonts(styleNodes, fileFormat).clearAllFontsFromStorage();

            // localStorage should be empty.
            expect(storage.length()).toEqual(1);
            expect(storage.get('guUserPref:myPref')).toEqual('myprefvalue');

        });

        it("should replace fonts in localStorage if a new cacheKey is found", function() {
             
            common.mediator.on('modules:fonts:loaded', callback);

            runs(function() {
                new Fonts(styleNodes, fileFormat).loadFromServer('fixtures/');
            });

            waitsFor(function() {
                return (callback.calledTwice);
            }, "initial loaded callback never ran", 1000);

            runs(function() {
                expect(callback.calledTwice).toBeTruthy();
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                    expect(storage.get(storagePrefix + getNameAndCacheKey(styleNodes[i]))).toBe('@font-face{');
                }
            });

            runs(function() {
                replaceCacheKeysInDOM('12345', '123456789');
                var styleNodes = document.querySelectorAll('[data-cache-name]');
                callback.reset();
                new Fonts(styleNodes, fileFormat).loadFromServer('fixtures/');
            });

            waitsFor(function() {
                return (callback.calledTwice);
            }, "cache busting loaded callback never ran", 1000);

            runs(function() {
                var styleNodes = document.querySelectorAll('[data-cache-name]');
                expect(callback.calledTwice).toBeTruthy();
                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                    expect(storage.get(storagePrefix + getNameAndCacheKey(styleNodes[i]))).toBe('@font-face{-cachebusted');
                }
                replaceCacheKeysInDOM('123456789', '12345');
            });

        });

        it("should not request css files if localStorage is full or disabled", function() {
            
            common.mediator.on('modules:fonts:notloaded', callback);
            var ajaxSpy;

            // Force localStorage to throw error.
            window.localStorage.setItem = sinon.stub.throws();

            runs(function() {
                var f = new Fonts(styleNodes, fileFormat);
                f.loadFromServer('fixtures/');
                ajaxSpy = sinon.spy(f.ajax);
            });

            waitsFor(function() {
                return (callback.calledTwice);
            }, "notloaded callback never ran", 1000);

            runs(function() {

                expect(ajaxSpy.callCount).toBe(0);

                for (var i = 0, j = styleNodes.length; i<j; ++i) {
                    expect(storage.get(storagePrefix + getNameAndCacheKey(styleNodes[i]))).toBe(null);
                }
            })
                
        });

    });

});
