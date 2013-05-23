define(['modules/lazyload', 'bonzo', 'ajax'], function(lazyLoad, bonzo, ajax) {

    describe('LazyLoad', function() {
        
        var $container = bonzo(bonzo.create('<div id="lazy-load-container"></div>'));

        beforeEach(function() {
            // create container
            $container.appendTo('body');
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
        });

        afterEach(function() {
            $container.remove();
        });

        it('should lazy load', function() {
            var success = false;
            function lazyLoadSuccess() {
                success = true;
            }
            
            waitsFor(function() {
                lazyLoad({
                    url: 'fixtures/lazy-load',
                    container: $container[0],
                    jsonpCallbackName: 'lazyLoad',
                    success: lazyLoadSuccess
                });
                return success;
              }, 'Lazy loaded data not loaded in', 100);
            
            runs(function() {
                expect($container.hasClass('lazyloaded')).toBeTruthy();
                expect($container.html()).toBe('<span>foo</span>');
            });
            
        })

    });

});