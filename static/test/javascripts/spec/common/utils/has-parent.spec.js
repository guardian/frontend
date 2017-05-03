define([
    'qwery',
    'common/utils/_',
    'common/utils/has-parent',
    'helpers/fixtures'
], function(
    qwery,
    _,
    hasParent,
    fixtures
) {
    describe('has-parent', function() {

        beforeEach(function() {
            fixtures.render({
                id: 'parent-test',
                fixtures: [
                    '<html>' +
                        '<div class="container">' +
                            '<div class="button">' +
                                '<span class="button__label">Click me</span>' +
                            '</div>' +
                        '</div>' +
                    '</html>'
                ]
            });
        })

        afterEach(function() {
            fixtures.clean('parent-test');
        });

        it('should find parent class', function() {
            expect(hasParent('container', qwery('.button__label'))).toBeTruthy();
        });

        it('should fail to find matching parent class', function() {
            expect(hasParent('fake-class', qwery('.button__label'))).toBeFalsy();
        });
    });
});
