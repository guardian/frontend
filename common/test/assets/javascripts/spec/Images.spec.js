define(['common/modules/ui/images', 'helpers/fixtures', 'common/$', 'bonzo', 'common/utils/mediator'], function(images, fixtures, $, bonzo, mediator) {

    describe('Images', function() {

        var fixturesId = 'images-fixtures',
            dataSrc = '/item-{width}/cat.jpg',
            imgClass = 'js-image-upgrade';

        beforeEach(function() {
            fixtures.render({
                id: fixturesId,
                fixtures: [1, 2, 3].map(function(value, i) {
                    return '<div class="' + imgClass + ' img-' + i + '" data-src="' + dataSrc + '"></div>';
                })
            });
        });

        afterEach(function() {
            mediator.removeAllListeners();
            fixtures.clean(fixturesId);
        });

        it('should upgrade images with class "' + imgClass + '"', function() {
            images.upgrade();
            var $upgradedImgs = $('.' + imgClass + ' img');
            expect($upgradedImgs.length).toEqual(3);
            $upgradedImgs.each(function(upgradedImg) {
                // should update src
                expect(bonzo(upgradedImg).attr('src')).not.toEqual(dataSrc);
            })
        });

        it('should not upgrade image with display "none"', function() {
            var hiddenImg = $('.' + imgClass + ':first-child')
                .css('display', 'none');
            images.upgrade();
            expect($('.' + imgClass + ' img').length).toEqual(2);
            expect($('img', hiddenImg).length).toEqual(0);

        });

        describe('window events', function() {

            ['resize', 'orientationchange'].forEach(function(event) {
                it('should listen to "' + event + '"', function() {
                    var upgradeSpy = sinon.spy(images, 'upgrade');
                    images.listen();
                    mediator.emit('window:' + event);
                    expect(upgradeSpy).toHaveBeenCalled();
                    upgradeSpy.restore();
                });
            });

        })

    });

});
