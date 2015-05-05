import Injector from 'helpers/injector';

new Injector()
    .test(['common/modules/commercial/third-party-tags', 'common/utils/config'], function (tagsContainer, config) {

        function extractParam(img, paramName) {
            var paramValue = new RegExp(paramName + '=([^&]*)').exec(img.src);
            return paramValue && paramValue[1];
        }

        describe('Tags Container', function () {

            beforeEach(function () {
                config.page = {
                    contentType: 'Article',
                    section: 'article',
                    edition: 'uk'
                };
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

    });
