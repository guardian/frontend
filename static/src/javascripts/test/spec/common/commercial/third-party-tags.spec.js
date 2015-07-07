import Injector from 'helpers/injector';
import sinonjs from 'sinonjs';
import jasmineSinon from 'jasmine-sinon';

describe('Tags Container', function () {

    function extractParam(img, paramName) {
        var paramValue = new RegExp(paramName + '=([^&]*)').exec(img.src);
        return paramValue && paramValue[1];
    }

    var injector = new Injector(),
        tagsContainer, config, krux;

    beforeEach(function (done) {
        injector.test(['common/modules/commercial/third-party-tags', 'common/utils/config', 'common/modules/commercial/third-party-tags/krux'], function () {
            tagsContainer = arguments[0];
            config = arguments[1];
            krux = arguments[2];
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
