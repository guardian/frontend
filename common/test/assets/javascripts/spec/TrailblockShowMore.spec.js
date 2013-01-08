define(['common', 'bean', 'modules/trailblock-show-more'], function(common, bean, TrailblockShowMore) {

    describe("Trailblock Show More", function() {
        
        var fixtureTrailblock ='<div id="front-container">'
            + '<div class="js-show-more trailblock" id="trailblock-show-more-fixture">'
            + '<ul><li class="trail"></li><li class="trail"></li></ul>'
            + '</div>'
            + '</div>',
            // fake server
            server;

        beforeEach(function() {
            common.$g('body').append(fixtureTrailblock);
            sinon.spy(common.mediator, 'emit'); 
            server = sinon.fakeServer.create();
        });

        afterEach(function() {
            common.$g('#front-container').remove();
            common.mediator.emit.restore();
            server.restore();
        });

        it("should append the 'show more' cta", function(){
            var trailblockShowMore = new TrailblockShowMore();
            trailblockShowMore.init();
            expect(common.$g('#trailblock-show-more-fixture button').length).toEqual(1);
        });
        
        it("should emit 'module:trailblock-show-more:loaded' on success", function(){
            var trailblockShowMore = new TrailblockShowMore();
            trailblockShowMore.init();
            server.respondWith('GET', '/top-stories.json?view=section&offset=2', [202, {}, '{"html": "<ul></ul>"}']);
            // click container
            bean.fire(common.$g('#front-container .trailblock .cta')[0], 'click');
            server.respond();
            expect(common.mediator.emit.firstCall.args[0]).toEqual('module:trailblock-show-more:loaded')
        });
        
        it("should emit 'module:error' on error", function(){
            var trailblockShowMore = new TrailblockShowMore();
            trailblockShowMore.init();
            console.log(server);
            server.respondWith('GET', '/top-stories.json?view=section&offset=2', [500, {}, '']);
            // click container
            bean.fire(common.$g('#front-container .trailblock .cta')[0], 'click');
            server.respond();
            expect(common.mediator.emit.firstCall.args).toEqual(
                ['module:error', 'Failed to load more trails for `top-stories`', 'modules/trailblock-show-more.js']
            );
        });
       
    });
});