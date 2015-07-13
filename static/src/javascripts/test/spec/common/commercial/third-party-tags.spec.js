import Injector from 'helpers/injector';
/*eslint-disable no-unused-vars*/
import jasmineSinon from 'jasmine-sinon';
/*eslint-enable no-unused-vars*/

describe('Tags Container', function () {

    var injector = new Injector(),
        tagsContainer, config;

    beforeEach(function (done) {
        injector.test(['common/modules/commercial/third-party-tags', 'common/utils/config'], function () {
            tagsContainer = arguments[0];
            config = arguments[1];
            config.page = {
                contentType: 'Article',
                section: 'article',
                edition: 'uk'
            };
            config.switches = {};
            done();
        });
    });

    it('should exist', function () {
        expect(tagsContainer).toBeDefined();
    });

    it('should not run if "Identity" content type', function () {
        config.page.contentType = 'Identity';

        expect(tagsContainer.init()).toBe(false);
    });

    it('should not run if "identity" section', function () {
        config.page.section = 'identity';

        expect(tagsContainer.init()).toBe(false);
    });

});
