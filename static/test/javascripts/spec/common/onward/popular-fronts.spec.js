define(['common/modules/onward/popular-fronts', 'bonzo', 'common/utils/$', 'bean', 'helpers/fixtures', 'common/utils/ajax'], function(popular, bonzo, $, bean, fixtures, ajax) {

    describe('Popular Fronts', function() {

        var server,
            response = JSON.stringify({
                faciaHtml: '<section class="container--popular"><ul>' + [1, 2, 3, 4].reduce(function(previousValue, itemNum) {
                    return previousValue + '<li>' +
                            '<div class="js-image-upgrade" data-src="item-{width}.jpg"></div>' +
                            '<div class="js-item__timestamp"><div class="timestamp__text">1</div></div>' +
                        '</li>';
                }, '') + '</section></ul>'
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

        it('should render component', function (done) {
            popular.render({}, {
                then: function () {
                    expect($('.container--popular').length).not.toBe(0);
                    done();
                }
            });
        });

        it('should call correct most-read endpoint', function (done) {
            var section = 'sport';
            server.respondWith('/most-read/' + section + '.json', [200, {}, response]);
            popular.render({
                page: {
                    section: section
                }
            }, {
                then: function () {
                    expect($('.container--popular').length).not.toBe(0);
                    done();
                }
            });
        });

        it('should upgrade images', function (done) {
            popular.render({}, {
                then: function () {
                    expect($('.container--popular img').length).toEqual(4);
                    done();
                }
            });
        });

        it('should not display container if response is empty', function (done) {
            server.respondWith([200, {}, JSON.stringify({ faciaHtml: "\n\n\n\n   \n\n\n" })]);
            popular.render({}, {
                then: function () {
                    expect($('.container--popular').length).toEqual(0);
                    done();
                }
            });
        });

    });

});
