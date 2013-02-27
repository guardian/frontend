define([
    'bonzo',
    'qwery',
    'bean'
], function (
    bonzo,
    qwery,
    bean
    ) {

    var Accordion = function() {

        var rootEl = bonzo(qwery('.accordion'));

        bean.on(document.querySelector('.accordion'), 'click', '.accordion-item > a', function(e) {
            var $this = bonzo(qwery(this));

            e.preventDefault();

            if (!$this.hasClass('active')) {
                bonzo(qwery('.accordion .is-open')).removeClass('is-open').hide();
                bonzo($this.next()).toggleClass('is-open').toggle();

                bonzo(qwery('.active', '.accordion')).removeClass('active');
                $this.addClass('active');
            } else {
                bonzo(qwery('.accordion .is-open')).removeClass('is-open').hide();
                $this.removeClass('active');
            }
        });

    };

    return Accordion;

});
