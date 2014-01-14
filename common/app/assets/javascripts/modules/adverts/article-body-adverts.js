/*global guardian */
define([
    'common/common',
    'qwery',
    'bonzo',
    'bean',
    'common/utils/detect'
], function (
    common,
    qwery,
    bonzo,
    bean,
    detect
) {

    var inlineAdvertSlot = '<div class="ad-slot ad-slot--inline" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>',
        mpuSlot = '<div class="ad-slot ad-slot--mpu-banner-ad" data-link-name="ad slot mpu-banner-ad" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>';

    // inserts a few inline advert slots in to the page 
    var createInlineAdSlots = function (id) {
        var article = document.getElementsByClassName('js-article__container')[0];
        bonzo(qwery('p:nth-of-type(7n)'), article).each(function(el, i) {
            var cls = (i % 2 === 0) ? 'is-odd' : 'is-even';
            bonzo(bonzo.create(inlineAdvertSlot.replace(/%slot%/g, id))).addClass(cls).insertAfter(this);
        });
    };
    
    var createMpuAdSlot = function (id) {
        bonzo(qwery('.js-mpu-ad-slot .social-wrapper')).after(bonzo.create(mpuSlot.replace(/%slot%/g, id))[0]);
    };

    var ArticleBodyAdverts = {

        init: function() {

            if((/wide|desktop/).test(detect.getBreakpoint())) {
                createInlineAdSlots('Middle1');
                createMpuAdSlot('Middle');
            }

            if((/mobile/).test(detect.getBreakpoint())) {
                createInlineAdSlots('x49');
            }

        }
    };


    return ArticleBodyAdverts;

});
