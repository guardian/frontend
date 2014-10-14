define(['common/modules/lazyload', 'bonzo', 'common/utils/ajax'], function(LazyLoad, bonzo, ajax) {

    describe('Lazy Load', function() {
        
        var $container = bonzo(bonzo.create('<div id="lazy-load-container"></div>')),
            server;

        beforeEach(function() {
            // create container
            $container.appendTo('body');
            ajax.init({page: {
                ajaxUrl: "",
                edition: "UK"
            }});
            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
        });

        afterEach(function() {
            $container.remove();
            server.restore();
        });

        it('should lazy load', function (done) {
            server.respondWith([200, {}, '{ "html": "<span>foo</span>" }']);

            new LazyLoad({
                url: 'fixtures/lazy-load',
                container: $container[0],
                success: function () {
                    expect($container.hasClass('lazyloaded')).toBeTruthy();
                    expect($container.html()).toBe('<span>foo</span>');
                    done();
                }
            }).load();

        })

    });

});
