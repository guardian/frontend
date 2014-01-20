/*global guardian */
define([
    'common/common',
    'common/modules/component',
    'qwery',
    'bonzo',
    'bean',
    'lodash/objects/assign',
    'common/utils/detect'
], function (
    common,
    Component,
    qwery,
    bonzo,
    bean,
    extend,
    detect
) {

    function ArticleBodyAdverts(config) {
        this.context = document;
        this.config = extend(this.config, config);
    }

    Component.define(ArticleBodyAdverts);

    ArticleBodyAdverts.prototype.config = {
        nthParagraph: 7,
        inlineAdTemplate: '<div class="ad-slot ad-slot--inline" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>',
        mpuAdTemplate: '<div class="ad-slot ad-slot--mpu-banner-ad" data-link-name="ad slot mpu-banner-ad" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>'
    };

    // inserts a few inline advert slots in to the page
    ArticleBodyAdverts.prototype.createInlineAdSlots = function(id) {
        var paragraphSelector = 'p:nth-of-type('+ this.config.nthParagraph +'n)';
        var template          = this.config.inlineAdTemplate;
        var article           = document.getElementsByClassName('js-article__container')[0];

        bonzo(qwery(paragraphSelector), article).each(function(el, i) {
            // This protects against empty paragraph tags and paragraphs being used
            // instead of order/unordered lists
            if(el.innerText.length < 120) {
                return false;
            }

            var target = this;
            var cls = (i % 2 === 0) ? 'is-odd' : 'is-even';

            // Places the advert after h2 tags on all breakpoints except mobile
            if(detect.getBreakpoint() !== 'mobile' && el.nextElementSibling.nodeName === 'H2') {
                target = el.nextElementSibling;
            }

            bonzo(bonzo.create(template.replace(/%slot%/g, id))).addClass(cls).insertAfter(target);
        });
    };

    ArticleBodyAdverts.prototype.createMpuAdSlot = function(id) {
        var template = this.config.mpuAdTemplate;

        bonzo(qwery('.js-mpu-ad-slot .social-wrapper')).after(bonzo.create(template.replace(/%slot%/g, id))[0]);
    };

    ArticleBodyAdverts.prototype.destroyAds = function() {
        bonzo(qwery('.ad-slot--inline, .ad-slot--mpu-banner-ad')).remove();
    };

    ArticleBodyAdverts.prototype.reloadAds = function() {
        this.destroyAds();
        this.init();
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
