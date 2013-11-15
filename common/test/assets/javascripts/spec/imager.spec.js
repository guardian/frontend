define(['modules/imager', 'helpers/fixtures', '$', 'bonzo'], function(imager, fixtures, $, bonzo) {

    describe('Imager', function() {

        var lowClassName = 'connection--low',
            notLowClassName = 'connection--not-low',
            dataSrc = '/item-{width}/cat.jpg';

        beforeEach(function() {
            fixtures.render({
                id: 'imager-fixtures',
                fixtures: [1, 2].map(function(value, i) {
                    return '<div class="item__image-container img-' + i + '" data-src="' + dataSrc + '"></div>';
                })
            });
        });

        afterEach(function() {
            $('html').removeClass([lowClassName, notLowClassName].join(' '));
        });

        it('should upgrade images', function() {
            $('html').addClass(notLowClassName);
            imager.upgrade();
            var $imgs = $('.item__image-container img');
            expect($imgs.length).toEqual(2);
            $imgs.each(function(img) {
                // should update src
                expect(bonzo(img).attr('src')).not.toEqual(dataSrc);
            })
        });

        it('should not upgrade when connection is low', function() {
            $('html').addClass(lowClassName);
            imager.upgrade();
            expect($('.item__image-container img').length).toEqual(0);
        });

    });
});
