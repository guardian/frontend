define(['common','ajax', 'bean', 'bonzo', 'modules/trailblock-show-more', 'fixtures/trails'], function(common, ajax, bean, bonzo, TrailblockShowMore, testData) {

    describe("TrailblockShowMore", function() {

        var server,
            fixtureTrailblock =
                '<div class="front-container">'
                    + '<div class="js-show-more trailblock" id="trailblock-show-more-fixture">'
                        + '<ul>'
                            + '<li class="trail"><h2><a href="/link/one" data-link-name="1">Link one</a></h2></li>'
                            + '<li class="trail"><h2><a href="/link/two" data-link-name="2">Link two</a></h2></li>'
                        + '</ul>'
                    + '</div>'
                + '</div>',
            $cta;

        ajax.init({page: {
            ajaxUrl: "",
            edition: "UK"
        }});

        beforeEach(function() {
            common.$g('body').append(fixtureTrailblock);
            // spy on mediator
            sinon.spy(common.mediator, 'emit');

            server = sinon.fakeServer.create();
            server.autoRespond = true;
            server.respondWith("GET", '/fixtures/trails.json?_edition=UK',
                [
                    200,
                    { "Content-Type": "application/json" },
                    testData
                ]
            );

            // create the module
            var trailblockShowMore = new TrailblockShowMore(
                {
                    url: '/fixtures/trails'
                }
            );

            trailblockShowMore.init(document);

            $cta = common.$g('.front-container .trailblock .cta');
            bean.fire($cta[0], 'click');
        });

        afterEach(function() {
            common.$g('.front-container').remove();
            common.mediator.emit.restore();
            common.mediator.removeEvent('module:clickstream:click');
            server.restore();
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

        it("should emit 'module:trailblock-show-more:render' on render", function(){
            waitsFor(function() {
                return common.mediator.emit.called;
              }, 'Trails not loaded in in time', 100);

            runs(function() {
                expect(common.mediator.emit.secondCall).toHaveBeenCalledWith('module:trailblock-show-more:render');
            });
        });

        it('should append 5 more trails', function(){
            waitsFor(function() {
                return common.mediator.emit.called;
              }, 'Trails not loaded in in time', 100);

            runs(function() {
                expect(common.$g('.front-container ul').length).toBe(1);
                expect(common.$g('.front-container .trail').length).toBe(7);
                bean.fire($cta[0], 'click');
                expect(common.$g('.front-container .trail').length).toBe(12);
                var numbers = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
                common.$g('.front-container .trail').each(function(trail, index) {
                    expect(common.$g('h2 a', trail).attr('href')).toBe('/link/' + numbers[index]);
                });
            });
        });

        it("should not show duplicates", function(){
            waitsFor(function() {
                return common.mediator.emit.called;
              }, 'Trails not loaded in in time', 100);

            runs(function() {
                bean.fire($cta[0], 'click');
                common.$g('.front-container .trail').each(function(trail) {
                    var href = common.$g('h2 a', trail[0]).attr('href')
                    expect(common.$g('.front-container .trail h2 a[href="' + href + '"]').length).toBe(1);
                });
            });
        });

        it("should increase cta omniture count by one on 'module:clickstream:click' event", function(){
            waitsFor(function() {
                return common.mediator.emit.called;
              }, 'Trails not loaded in in time', 100);

            runs(function() {
                common.mediator.emit('module:clickstream:click', { target: document.querySelector('.front-container .cta') });
                expect(common.$g('.front-container .trailblock .cta').attr('data-link-name')).toEqual('Show more | 3');
                common.mediator.emit('module:clickstream:click', { target: document.querySelector('.front-container .cta') });
                expect(common.$g('.front-container .trailblock .cta').attr('data-link-name')).toEqual('Show more | 4');
            });
        });

        it("shouldn't listen to non-cta clickstream clicks", function(){
            waitsFor(function() {
                return common.mediator.emit.called;
              }, 'Trails not loaded in in time', 100);

            runs(function() {
                common.mediator.emit('module:clickstream:click', { target: document.querySelector('body') });
                expect(common.$g('.front-container .trailblock .cta').attr('data-link-name')).toEqual('Show more | 2');
            });
        });

        it("should correctly increment omniture count on trails", function(){
            waitsFor(function() {
                return common.mediator.emit.called;
              }, 'Trails not loaded in in time', 100);

            runs(function() {
                bean.fire($cta[0], 'click');
                common.$g('.front-container .trail h2 a').each(function(trail, index) {
                    expect(bonzo(trail).attr('data-link-name')).toEqual(index + 1 + '')
                });
            });
        });

        it("should remove cta when no more trails", function(){
            waitsFor(function() {
                return common.mediator.emit.called;
              }, 'Trails not loaded in in time', 100);

            runs(function() {
                bean.fire($cta[0], 'click');
                bean.fire($cta[0], 'click');
                expect(common.$g('.front-container .trail').length).toBe(17);
                common.mediator.emit('module:clickstream:click', { target: document.querySelector('.front-container .cta') });
                expect(common.$g('.front-container .trailblock .cta').length).toBe(0);
            });
        });

    });
});
