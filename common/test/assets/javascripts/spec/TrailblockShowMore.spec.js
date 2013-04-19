define(['common','ajax', 'bean', 'modules/trailblock-show-more'], function(common, ajax, bean, TrailblockShowMore) {

    describe("TrailblockShowMore", function() {
        
        var fixtureTrailblock ='<div id="front-container">'
            + '<div class="js-show-more trailblock" id="trailblock-show-more-fixture">'
            + '<ul><li class="trail"></li><li class="trail"></li></ul>'
            + '</div>'
            + '</div>',
            // fake server
            server;

        beforeEach(function() {
            ajax.init("");
            common.$g('body').append(fixtureTrailblock);
            // spy on mediator
            sinon.spy(common.mediator, 'emit');
            // create fake server
            server = sinon.fakeServer.create();
            // create the module
            var trailblockShowMore = new TrailblockShowMore();
            trailblockShowMore.init();
        });

        afterEach(function() {
            common.$g('#front-container').remove();
            common.mediator.emit.restore();
            server.restore();
        });

        it("should append the 'show more' cta", function(){
            expect(common.$g('#front-container .trailblock .cta').length).toEqual(1);
        });
        
        var serverSetup = function(opts) {
            var opts = opts || {};
            var statusCode = opts.statusCode || 202;
            var response = opts.response || '{"html": "<ul></ul>", "hasMore": true}';
            server.respondWith('GET', '/top-stories.json?view=section&offset=2', [statusCode, {}, response]);
            // click container
            bean.fire(common.$g('#front-container .trailblock .cta')[0], 'click');
            server.respond();   
        };
        
        it("should emit 'module:trailblock-show-more:loaded' on success", function(){
            serverSetup();
            expect(common.mediator.emit.firstCall.args[0]).toEqual('module:trailblock-show-more:loaded')
        });
        
        it("should emit 'module:error' on error", function(){
            serverSetup({statusCode: 404});
            expect(common.mediator.emit.firstCall.args).toEqual(
                ['module:error', 'Failed to load more trails for `top-stories`', 'modules/trailblock-show-more.js']
            );
        });
        
        it("should increase the omniture count by one on success", function(){
            serverSetup();
            expect(common.$g('#front-container .trailblock .cta').attr('data-link-name')).toEqual('Show more | 2');
        });
        
        it("should remove cta if no more stories", function(){
            serverSetup({response: '{"html": "<ul></ul>", "hasMore": false}'});
            expect(common.$g('#front-container .trailblock .cta').length).toEqual(0);
        });
       
    });
});
