/*global guardian */
define([
    'common/common',
    'common/modules/component',
    'qwery',
    'bonzo',
    'bean',
    'common/utils/detect'
], function (
    common,
    Component,
    qwery,
    bonzo,
    bean,
    detect
) {

    function ArticleBodyAdverts() {
        this.context = document;
    }

    Component.define(ArticleBodyAdverts);

    var inlineAdvertSlot = '<div class="ad-slot ad-slot--inline" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>',
        mpuSlot = '<div class="ad-slot ad-slot--mpu-banner-ad" data-link-name="ad slot mpu-banner-ad" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>';

    // inserts a few inline advert slots in to the page
    ArticleBodyAdverts.prototype.createInlineAdSlots = function(id) {
        var article = document.getElementsByClassName('js-article__container')[0];

        bonzo(qwery('p:nth-of-type(7n)'), article).each(function(el, i) {
            var cls = (i % 2 === 0) ? 'is-odd' : 'is-even';
            bonzo(bonzo.create(inlineAdvertSlot.replace(/%slot%/g, id))).addClass(cls).insertAfter(this);
        });
    };

    ArticleBodyAdverts.prototype.createMpuAdSlot = function(id) {
        bonzo(qwery('.js-mpu-ad-slot .social-wrapper')).after(bonzo.create(mpuSlot.replace(/%slot%/g, id))[0]);
    };

    ArticleBodyAdverts.prototype.init = function() {
        if((/wide|desktop/).test(detect.getBreakpoint())) {
            this.createInlineAdSlots('Middle1');
            this.createMpuAdSlot('Middle');
        }

        if((/mobile/).test(detect.getBreakpoint())) {
            this.createInlineAdSlots('x49');
        }
    };

    return ArticleBodyAdverts;

});
