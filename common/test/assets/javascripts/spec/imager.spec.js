define(['modules/imager', 'helpers/fixtures', '$', 'bonzo', 'utils/mediator'], function(imager, fixtures, $, bonzo, mediator) {

    describe('Imager', function() {

        var fixturesId = 'imager-fixtures',
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
            imager.upgrade();
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
            imager.upgrade();
            expect($('.' + imgClass + ' img').length).toEqual(0);
        });

        it('should not upgrade image with display "none"', function() {
            var hiddenImg = $('.' + imgClass + ':first-child')
                .css('display', 'none');
            imager.upgrade();
            expect($('.' + imgClass + ' img').length).toEqual(2);
            expect($('img', hiddenImg).length).toEqual(0);

        });

        it('should be able to force upgrade', function() {
            var $style = bonzo(bonzo.create('<style></style>'))
                .html('body:after { content: "desktop"; }')
                .appendTo('head');
            $('html')
                .removeClass(notLowClassName)
                .addClass(lowClassName);
            // add data-force-upgrade attrs
            ['desktop wide', 'tablet desktop', 'mobile'].forEach(function(breakpoints, i) {
                $('.' + imgClass + ':nth-child(' + (i + 1) + ')').attr('data-force-upgrade', breakpoints);
            });
            imager.upgrade();
            var $upgradedImgs = $('.' + imgClass + ' img');
            // first two should be forced to upgrade
            expect($('.' + imgClass + ':nth-child(1) img').length).toEqual(1);
            expect($('.' + imgClass + ':nth-child(2) img').length).toEqual(1);
            // but not the third
            expect($('.' + imgClass + ':nth-child(3) img').length).toEqual(0);
            $style.remove();

        });

        describe('window events', function() {

            ['resize', 'orientationchange'].forEach(function(event) {
                it('should listen to "' + event + '"', function() {
                    var upgradeSpy = sinon.spy(imager, 'upgrade');
                    imager.listen();
                    mediator.emit('window:' + event);
                    expect(upgradeSpy).toHaveBeenCalled();
                    upgradeSpy.restore();
                });
            });

        })

    });

});
