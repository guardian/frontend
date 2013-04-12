define(['common','ajax', 'bean', 'modules/trailblock-show-more'], function(common, ajax, bean, TrailblockShowMore) {

    describe("TrailblockShowMore", function() {
        
        var fixtureTrailblock =
            '<div id="front-container">'
                + '<div class="js-show-more trailblock" id="trailblock-show-more-fixture">'
                    + '<ul>'
                        + '<li class="trail"><h2><a href="/link/one">Link one</a></h2></li>'
                        + '<li class="trail"><h2><a href="/link/two">Link two</a></h2></li>'
                    + '</ul>'
                + '</div>'
            + '</div>',
            $cta;
        
        ajax.init("");

        beforeEach(function() {
            common.$g('body').append(fixtureTrailblock);
            // spy on mediator
            sinon.spy(common.mediator, 'emit');
            // create the module
            var trailblockShowMore = new TrailblockShowMore(
                {
                    jsonpCallbackName: 'trailblockShowMore',
                    url: './fixtures/trails'
                }
            );
            trailblockShowMore.init();
            $cta = common.$g('#front-container .trailblock .cta');
            bean.fire($cta[0], 'click');
        });

        afterEach(function() {
            common.$g('#front-container').remove();
            common.mediator.emit.restore();
        });

        it("should append the 'show more' cta", function(){
            expect($cta.length).toBe(1);
        });
        
        it("should emit 'module:trailblock-show-more:loaded' on success", function(){
            waitsFor(function() {
                return common.mediator.emit.called;
              }, 'Trails not loaded in in time', 100);
            
            runs(function() {
                expect(common.mediator.emit.firstCall).toHaveBeenCalledWith('module:trailblock-show-more:loaded');
            });
        });
        
        it('should append 5 more trails', function(){
            waitsFor(function() {
                return common.mediator.emit.called;
              }, 'Trails not loaded in in time', 100);
            
            runs(function() {
                expect(common.$g('#front-container ul').length).toBe(1);
                expect(common.$g('#front-container .trail').length).toBe(7);
            });
        });
        
        it("should not show duplicates", function(){
            waitsFor(function() {
                return common.mediator.emit.called;
              }, 'Trails not loaded in in time', 100);
            
            runs(function() {
                common.$g('#front-container .trail').each(function(trail) {
                    var href = common.$g('h2 a', trail[0]).attr('href')
                    expect(common.$g('#front-container .trail h2 a[href="' + href + '"]').length).toBe(1);
                });
            });
        });
       
    });
});
