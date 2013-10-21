define(['modules/facia/popular', 'bonzo', 'common', 'bean', 'helpers/fixtures', 'ajax'], function(popular, bonzo, common, bean, fixtures, ajax) {

    describe('Popular', function() {

        var server,
            response = JSON.stringify({
                fullTrails: [
                    {
                        headline: 'A Headline',
                        trailText: 'Some trailtext',
                        published: {
                            unix: '1'
                        },
                        mainPicture: {
                            item: 'item.jpg',
                            itemMain: 'item-main.jpg',
                            itemMobile: 'item-mobile.jpg',
                            itemMainMobile: 'item-main-mobile.jpg'
                        }
                    },
                    {
                        headline: 'Another Headline',
                        trailText: 'Some other trailtext',
                        published: {
                            unix: '1'
                        },
                        mainPicture: {
                            item: 'item-2.jpg',
                            itemMain: 'item-main-2.jpg',
                            itemMobile: 'item-mobile-2.jpg',
                            itemMainMobile: 'item-main-mobile-2.jpg'
                        }
                    }
                ]
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
                fixtures: ['<section class="collection"></section>']
            });
            // set up fake server
            server = sinon.fakeServer.create();
            server.autoRespond = true;
        });

        afterEach(function() {
            fixtures.clean('popular');
            server.restore();
        });

        it('should render component', function() {
            server.respondWith([200, {}, response]);
            popular.render({});

            waitsFor(function() {
                return common.$g('.collection--popular').length;
            }, 'popular collection to be rendered', 100);
        });

        it('should have a "data-type" attribute of value "popular"', function() {
            server.respondWith([200, {}, response]);
            popular.render({});

            waitsFor(function() {
                return common.$g('.collection--popular').length;
            }, 'popular collection to be rendered', 100);

            runs(function() {
                expect(common.$g('.collection--popular').attr('data-type')).toEqual('popular');
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
                return common.$g('.collection--popular').length;
            }, 'popular collection to be rendered', 100);
        });

        it('first three items should have an image', function() {
            server.respondWith([200, {}, response]);
            popular.render({});

            waitsFor(function() {
                return common.$g('.collection--popular').length;
            }, 'popular collection to be rendered', 100);

            runs(function() {
                common.$g('.item:nth-child(-n+3)').each(function(item) {
                    expect(bonzo(item).hasClass('item--image-upgraded')).toBeTruthy();
                });
            });
        });

       it('dates should be relativised', function() {
           server.respondWith([200, {}, response]);
           popular.render({});

           waitsFor(function() {
               return common.$g('.collection--popular').length;
           }, 'popular collection to be rendered', 100);

           runs(function() {
               common.$g('.timestamp__text').each(function(item) {
                   expect(bonzo(item).text()).toEqual('1 Jan 1970');
               });
           });
       });
    });

});
