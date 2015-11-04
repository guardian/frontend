define([
    'bonzo',
    'qwery',
    'common/utils/_',
    'facia/modules/ui/container-show-more'
], function (
    bonzo,
    qwery,
    _,
    containerShowMore
) {
    describe('Container Show More', function () {
        var $container;

        function itemWithId(id) {
            return '<div class="js-fc-item" data-id="' + id + '"></div>';
        }

        beforeEach(function () {
            $container = bonzo(bonzo.create(
                '<div>' +
                    itemWithId('loldongs') +
                    itemWithId('corgi') +
                    itemWithId('geekpie') +
                '</div>'
            ));
        });

        afterEach(function () {
            $container.remove();
        });

        it('should be able to group elements by id', function () {
            var grouped = containerShowMore.itemsByArticleId($container);

            expect(_.intersection(_.keys(grouped), ['loldongs', 'corgi', 'geekpie']).length === 3).toBeTruthy();
        });

        it('should de-duplicate items loaded in', function () {
            var $after = containerShowMore.dedupShowMore($container,
                '<div>' +
                    itemWithId('corgi') +
                    itemWithId('daschund') +
                '</div>'
            );

            expect(qwery('.js-fc-item', $after).length === 1).toBeTruthy();
        });
    });
});
