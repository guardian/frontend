import Injector from 'helpers/injector';
/*eslint-disable no-unused-vars*/
import jasmineSinon from 'jasmine-sinon';
/*eslint-enable no-unused-vars*/

describe('Tags Container', function () {

    var injector = new Injector(),
        tagsContainer, commercialFeatures;

    beforeEach(function (done) {
        injector.test([
            'common/modules/commercial/third-party-tags',
            'common/modules/commercial/commercial-features'
        ], function () {
            tagsContainer = arguments[0];
            commercialFeatures = arguments[1];
            commercialFeatures.thirdPartyTags = true;
            done();
        });
    });

    it('should exist', function () {
        expect(tagsContainer).toBeDefined();
    });

    it('should not run if disabled in commercial features', function () {
        commercialFeatures.thirdPartyTags = false;
        expect(tagsContainer.init()).toBe(false);
    });

});
