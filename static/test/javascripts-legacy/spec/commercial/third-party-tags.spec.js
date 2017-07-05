define([
    'helpers/injector'
], function (
    Injector
) {
    describe('Tags Container', function () {

        var injector = new Injector(),
            tagsContainer, commercialFeatures;

        beforeEach(function (done) {
            injector.require([
                'commercial/modules/third-party-tags',
                'commercial/modules/commercial-features'
            ], function () {
                tagsContainer = arguments[0];
                commercialFeatures = arguments[1].commercialFeatures;
                commercialFeatures.thirdPartyTags = true;
                done();
            });
        });

        it('should exist', function () {
            expect(tagsContainer).toBeDefined();
        });

        it('should not run if disabled in commercial features', function (done) {
            commercialFeatures.thirdPartyTags = false;
            tagsContainer.initThirdPartyTags()
                .then(function(enabled) {
                    expect(enabled).toBe(false);
                    done();
                })
                .catch(function() {
                    done.fail('third-party tags failed');
                });

        });

    });
});
