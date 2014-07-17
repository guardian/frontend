define([
    'common/modules/commercial/tags/container'
], function(
    tagsContainer
){

    describe('Container', function() {

        var config;

        beforeEach(function() {
            config = {
                page: {
                    contentType: 'Article',
                    section: 'article',
                    edition: 'uk'
                }
            };
        });

        it('should exist', function() {
            expect(tagsContainer).toBeDefined();
        });

        it('should not run if "Identity" content type', function() {
            config.page.contentType = 'Identity';
            expect(tagsContainer.init(config)).toBe(false);
        });

        it('should not run if "identity" section', function() {
            config.page.section = 'identity';
            expect(tagsContainer.init(config)).toBe(false);
        });

    });

});
