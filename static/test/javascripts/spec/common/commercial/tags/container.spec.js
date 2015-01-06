define([
    'helpers/injector'
], function (
    Injector
) {

    return new Injector()
        .store('common/utils/config')
        .require(['common/modules/commercial/tags/container', 'mocks'], function (tagsContainer, mocks) {

            function extractParam(img, paramName) {
                var paramValue = new RegExp(paramName + '=([^&]*)').exec(img.src);
                return paramValue && paramValue[1];
            }

            describe('Tags Container', function () {

                beforeEach(function () {
                    mocks.store['common/utils/config'].page = {
                        contentType: 'Article',
                        section: 'article',
                        edition: 'uk'
                    };
                });

                it('should exist', function () {
                    expect(tagsContainer).toBeDefined();
                });

                it('should not run if "Identity" content type', function () {
                    mocks.store['common/utils/config'].page.contentType = 'Identity';

                    expect(tagsContainer.init()).toBe(false);
                });

                it('should not run if "identity" section', function () {
                    mocks.store['common/utils/config'].page.section = 'identity';

                    expect(tagsContainer.init()).toBe(false);
                });

            });

        });

});
