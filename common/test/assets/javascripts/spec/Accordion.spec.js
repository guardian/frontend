define(['modules/accordion', 'common', 'bonzo', 'bean'], function(Accordion, common, bonzo, bean) {

    describe('Accordion', function() {

        var $accordion,
            accordion;

        beforeEach(function() {
            $accordion = bonzo(bonzo.create('<div class="accordion"><div class="accordion-item"><a href="#"></a></div></div>'));
            common.$g('body').append($accordion[0]);
            accordion = new Accordion();
        });

        afterEach(function() {
            $accordion.remove();
            delete accordion;
        });

        it('should be able to open', function() {
            var a = $accordion[0].querySelector('a');
            // click link
            bean.fire($accordion[0].querySelector('a'), 'click');
            expect(bonzo(a).hasClass('active')).toBeTruthy();
        })

        it('should be able to close', function() {
            var a = $accordion[0].querySelector('a');
            // click link twice
            bean.fire($accordion[0].querySelector('a'), 'click');
            bean.fire($accordion[0].querySelector('a'), 'click');
            expect(bonzo(a).hasClass('active')).toBeFalsy();
        })

    });

});