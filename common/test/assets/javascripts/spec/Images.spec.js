define(['modules/ui/images', 'helpers/fixtures', '$', 'bonzo', 'utils/mediator'], function(images, fixtures, $, bonzo, mediator) {

    describe('Images', function() {

        var fixturesId = 'images-fixtures',
            lowClassName = 'connection--low',
            notLowClassName = 'connection--not-low',
            dataSrc = '/item-{width}/cat.jpg',
            imgClass = 'item__image-container';

        beforeEach(function() {
            $('html').addClass(notLowClassName);
            fixtures.render({
                id: fixturesId,
                fixtures: [1, 2, 3].map(function(value, i) {
                    return '<div class="' + imgClass + ' img-' + i + '" data-src="' + dataSrc + '"></div>';
                })
            });
        });

        afterEach(function() {
            $('html').removeClass([lowClassName, notLowClassName].join(' '));
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

        it('should not upgrade when connection is low', function() {
            $('html')
                .removeClass(notLowClassName)
                .addClass(lowClassName);
            images.upgrade();
            expect($('.' + imgClass + ' img').length).toEqual(0);
        });

        it('should not upgrade image with display "none"', function() {
            var hiddenImg = $('.' + imgClass + ':first-child')
                .css('display', 'none');
            images.upgrade();
            expect($('.' + imgClass + ' img').length).toEqual(2);
            expect($('img', hiddenImg).length).toEqual(0);

        });

        describe('force upgrade', function() {

            var forceUpgradeAttr = 'data-force-upgrade';
            it('should force upgrade if "' + forceUpgradeAttr + '" attribute exists', function() {
                $('html')
                    .removeClass(notLowClassName)
                    .addClass(lowClassName);
                // add data-force-upgrade attrs
                ['desktop wide', 'tablet desktop', 'mobile'].forEach(function(breakpoints, i) {
                    $('.' + imgClass + ':nth-child(' + (i + 1) + ')').attr(forceUpgradeAttr, '');
                });
                images.upgrade();
                expect($('.' + imgClass + ' img').length).toEqual(3);
            });

            it('should force upgrade at certain breakpoints if set in attribute', function() {
                var $style = bonzo(bonzo.create('<style></style>'))
                    .html('body:after { content: "desktop"; }')
                    .appendTo('head');
                $('html')
                    .removeClass(notLowClassName)
                    .addClass(lowClassName);
                // add data-force-upgrade attrs
                ['desktop wide', 'tablet desktop', 'mobile'].forEach(function(breakpoints, i) {
                    $('.' + imgClass + ':nth-child(' + (i + 1) + ')').attr(forceUpgradeAttr, breakpoints);
                });
                images.upgrade();
                // first two should be forced to upgrade
                expect($('.' + imgClass + ':nth-child(1) img').length).toEqual(1);
                expect($('.' + imgClass + ':nth-child(2) img').length).toEqual(1);
                // but not the third
                expect($('.' + imgClass + ':nth-child(3) img').length).toEqual(0);
                $style.remove();
            });

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
