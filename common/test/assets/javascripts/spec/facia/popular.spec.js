define(['modules/facia/popular', 'bonzo', '$', 'bean', 'helpers/fixtures', 'ajax'], function(popular, bonzo, $, bean, fixtures, ajax) {

    describe('Popular', function() {

        var server,
            response = JSON.stringify({
                trails: [1, 2, 3, 4].map(function(itemNum) {
                    return {
                        headline: 'A Headline',
                        trailText: 'Some trailtext',
                        webPublicationDate: {
                            timestamp: '1'
                        },
                        itemPicture: 'item-{width}.jpg'
                    }
                })
            });

        ajax.init({
            page: {
                ajaxUrl: '',
                edition: 'UK'
            }
        });

        beforeEach(function() {
            fixtures.render({
                id: 'popular',
                fixtures: ['<section class="container"></section>']
            });
            // set up fake server
            server = sinon.fakeServer.create();
            server.respondWith([200, {}, response]);
            server.autoRespond = true;
            // seem to need this, or sinon gets ahead of itself
            server.autoRespondAfter = 20;
        });

        afterEach(function() {
            fixtures.clean('popular');
            server.restore();
        });

        it('should render component', function() {
            popular.render({});

            waitsFor(function() {
                return $('.container--popular').length;
            }, 'popular container to be rendered', 100);
        });

        it('should have data-link-name attribute equal to "block | popular"', function() {
            popular.render({});

            waitsFor(function() {
                return $('.container--popular').length;
            }, 'popular container to be rendered', 100);
            runs(function() {
                expect($('.container--popular').attr('data-link-name')).toEqual('block | popular');
            });
        });

        it('should have a "data-type" attribute of value "popular"', function() {
            popular.render({});

            waitsFor(function() {
                return $('.container--popular').length;
            }, 'popular container to be rendered', 100);
            runs(function() {
                expect($('.container--popular').attr('data-type')).toEqual('popular');
            });
        });

        it('should call correct most-read endpoint', function() {
            var section = 'sport';
            server.respondWith('/most-read/' + section + '.json?_edition=UK', [200, {}, response]);
            popular.render({
                page: {
                    section: section
                }
            });

            waitsFor(function() {
                return $('.container--popular').length;
            }, 'popular container to be rendered', 100);
        });

        it('should upgrade images', function() {
            popular.render({});

            waitsFor(function() {
                return $('.container--popular').length;
            }, 'popular container to be rendered', 100);
            runs(function() {
                expect($('.container--popular img').length).toEqual(4);
            });
        });

        it('dates should be relativised', function() {
            popular.render({});

            waitsFor(function() {
                return $('.container--popular').length;
            }, 'popular container to be rendered', 100);
            runs(function() {
                $('.timestamp__text').each(function(item) {
                    expect(bonzo(item).text()).toEqual('1 Jan 1970');
                });
            });
        });

    });

});
