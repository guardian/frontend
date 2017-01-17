define([
    'common/utils/$',
    'Promise',
    'helpers/fixtures',
    'helpers/injector'
], function (
    $,
    Promise,
    fixtures,
    Injector
) {
    var hostedOnward,
        injector = new Injector();

    describe('Hosted Onward Journey', function () {
        var mock = sinon.stub().returns(Promise.resolve({html:'<div class="next-page"></div>'}));

        var fixturesConfig = {
                id: 'hosted-onward',
                fixtures: [
                    '<div class="js-onward-placeholder"></div>'
                ]
            },
            $fixturesContainer;

        var mockConfig = {page: {
            ajaxUrl: "some.url",
            contentType: "gallery",
            pageId: "pageId"
        }};

        beforeEach(function (done) {
            injector.mock('common/utils/config', mockConfig);
            injector.mock('common/utils/fetch-json', mock);
            injector.require([
                'commercial/modules/hosted/onward'
            ], function () {
                hostedOnward = arguments[0];

                $fixturesContainer = fixtures.render(fixturesConfig);
                done();
            });
        });

        afterEach(function () {
            fixtures.clean(fixturesConfig.id);
        });

        it('should exist', function () {
            expect(hostedOnward).toBeDefined();
        });

        it('should make an ajax call and insert html', function (done) {
            hostedOnward.init()
                .then(function () {
                    expect(mock).toHaveBeenCalledWith('some.url/pageId/gallery/onward.json', {mode: 'cors'});
                    expect($('.js-onward-placeholder .next-page', $fixturesContainer).length).toBeGreaterThan(0);
                })
                .then(done)
                .catch(done.fail);
        });

    });
});
