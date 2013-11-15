define(['modules/imager', 'helpers/fixtures', '$'], function(imager, fixtures, $) {

    describe('Imager', function() {

        beforeEach(function() {
            fixtures.render({
                id: 'imager-fixtures',
                fixtures: [
                    '<div class="item__image-container one" data-src="http://i.guim.co.uk/item-{width}/sys-images/Guardian/Pix/pictures/2013/11/15/1384516091230/A-baby-is-carried-in-a-ba-010.jpg"></div>' +
                    '<div class="item__image-container two" data-src="http://i.guim.co.uk/item-{width}/sys-images/Guardian/Pix/pictures/2013/11/15/1384516091230/A-baby-is-carried-in-a-ba-010.jpg"></div>'
                ]
            });
        });

        afterEach(function() {
        });

        it('should upgrade images', function() {
            var className = 'connection--not-low';
            $('html').addClass(className);
            imager.upgrade();
            expect($('.item__image-container img').length).toEqual(0);
            $('html').removeClass(className);
        });

        it('should not run connection low', function() {
            var className = 'connection--low';
            $('html').addClass(className);
            imager.upgrade();
            expect($('.item__image-container img').length).toEqual(0);
            $('html').removeClass(className);
        });

    });
});
