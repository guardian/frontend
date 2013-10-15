define(['modules/facia/popular', 'bonzo', 'common', 'bean', 'helpers/fixtures', 'ajax'], function(popular, bonzo, common, bean, fixtures, ajax) {

    describe('Popular', function() {

        var server;

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
            server.respondWith([200, {}, JSON.stringify({
                fullTrails: [{
                    headline: 'A Headline',
                    trailText: 'Some trailtext',
                    published: {
                        datetime: 'foo',
                        unix: 'foo'
                    },
                    mainPicture: {
                        item: 'item.jpg',
                        itemMain: 'item-main.jpg',
                        itemMobile: 'item-mobile.jpg',
                        itemMainMobile: 'item-main-mobile.jpg'
                    }
                }]
            })]);
            popular.render({});
        });

    });

});
