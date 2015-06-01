import Injector from 'helpers/injector';

describe('Tags Container', function () {

    function extractParam(img, paramName) {
        var paramValue = new RegExp(paramName + '=([^&]*)').exec(img.src);
        return paramValue && paramValue[1];
    }

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
