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

        it('should remove existing content in container', function() {
            var id = 'empty-container-fixture';
            fixtures.render({
                id: id,
                fixtures: ['<div class="' + imgClass + '" data-src="src.jpg"><img class="existing-img" src="low-res.jpg" /></div>']
            });
            images.upgrade(document.getElementById(id));
            expect($('#' + id + ' .existing-img').length).toEqual(0);
            fixtures.clean(id);
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
            images.upgrade();
            var $upgradedImgs = $('.' + imgClass + ' img');
            // first two should be forced to upgrade
            expect($('.' + imgClass + ':nth-child(1) img').length).toEqual(1);
            expect($('.' + imgClass + ':nth-child(2) img').length).toEqual(1);
            // but not the third
            expect($('.' + imgClass + ':nth-child(3) img').length).toEqual(0);
            $style.remove();

        });

        describe('created img element', function() {

            it('should always add "item__image" class to img element', function() {
                images.upgrade();
                expect($('.' + imgClass + ' img.item__image').length).toEqual(3);
            });

            var classDataAttr = 'data-img-class';
            it('should add "' + classDataAttr + '" as classes to img element', function() {
                var classes = 'a-class another-class';
                // add data attribute to first image container
                $('#' + fixturesId + ' .' + imgClass + ':first-child').attr(classDataAttr, classes);
                images.upgrade();
                expect($('.' + imgClass + ' img.item__image').length).toEqual(3);
                expect($('.' + imgClass + ' img.' + classes.split(' ').join('.')).length).toEqual(1);
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
