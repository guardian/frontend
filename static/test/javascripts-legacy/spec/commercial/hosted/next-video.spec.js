define([
    'lib/$',
    'helpers/fixtures',
    'helpers/injector'
], function (
    $,
    fixtures,
    Injector
) {
    var hostedNextVideo,
        injector = new Injector();

    describe('Hosted Next Video', function () {
        var mock = sinon.stub().returns(Promise.resolve({html:'<div class="video"></div>'}));

        var fixturesConfig = {
                id: 'hosted-next-video',
                fixtures: [
                    '<div class="js-autoplay-placeholder"></div>'
                ]
            },
            $fixturesContainer;

        var mockConfig = {page: {
            ajaxUrl: "some.url",
            pageId: "pageId"
        }};

        beforeEach(function (done) {
            injector.mock('lib/config', mockConfig);
            injector.mock('lib/fetch-json', mock);
            injector.require([
                'commercial/modules/hosted/next-video'
            ], function () {
                hostedNextVideo = arguments[0];

                $fixturesContainer = fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function () {
            expect(hostedNextVideo).toBeDefined();
        });

        it('should make an ajax call and insert html', function (done) {
            hostedNextVideo.load()
                .then(function () {
                    expect(mock).toHaveBeenCalledWith('some.url/pageId/autoplay.json', {mode: 'cors'});
                    expect($('.js-autoplay-placeholder .video', $fixturesContainer).length).toBeGreaterThan(0);
                })
                .then(done)
                .catch(done.fail);
        });

    });
});
