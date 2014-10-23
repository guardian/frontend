define([
    'jasq'
], function () {

    function extractParam(img, paramName) {
        var paramValue = new RegExp(paramName + '=([^&]*)').exec(img.src);
        return paramValue && paramValue[1];
    }

    describe('Tags Container', {
        moduleName: 'common/modules/commercial/tags/container',
        mock: function () {
            return {
                'common/utils/config': function () {
                    return {
                        page: {
                            contentType: 'Article',
                            section: 'article',
                            edition: 'uk'
                        }
                    };
                }
            }
        },
        specify: function () {

            it('should exist', function (tagsContainer) {
                expect(tagsContainer).toBeDefined();
            });

            it('should not run if "Identity" content type', function (tagsContainer, deps) {
                deps['common/utils/config'].page.contentType = 'Identity';

                expect(tagsContainer.init()).toBe(false);
            });

            it('should not run if "identity" section', function (tagsContainer, deps) {
                deps['common/utils/config'].page.section = 'identity';

                expect(tagsContainer.init()).toBe(false);
            });

        }
    });

});
