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

    var adSlot = '<div class="ad-slot ad-slot--inline" data-base="%slot%" data-median="%slot%"><div class="ad-container"></div></div>';

    // inserts a few inline advert slots in to the page 
    var createInlineAdSlots = function (id) {
        var article = document.getElementsByClassName('js-article__container')[0];
        bonzo(qwery('p:nth-of-type(7n)'), article).each(function(el, i) {
            var cls = (i % 2 === 0) ? 'is-odd' : 'is-even';
            bonzo(bonzo.create(adSlot.replace(/%slot%/g, id))).addClass(cls).insertAfter(this);
        });
    };
    
    var createTopAdSlot = function (id) {
        bonzo(qwery('.ad-slot--top-banner-ad')).attr('data-base', id);
        bonzo(qwery('.ad-slot--top-banner-ad')).attr('data-median', id);
        bonzo(qwery('.ad-slot--top-banner-ad')).attr('data-extended', id);
    };

    var CommercialInArticlesMobile = function () {

        var self = this;
        
        this.id = 'CommercialInArticlesMobile';
        this.expiry = '2014-01-21';
        this.audience = 0.1;
        this.audienceOffset = 0.4;
        this.description = 'Inserts commercial components in to the mobile articles to monitor CTR';
        this.canRun = function(config) {
            return (config.page.contentType === 'Article'
                && (/mobile/).test(detect.getBreakpoint())
            );
        };

        this.variants = [
            {
                id: 'CommercialInline',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha3.com';
                    guardian.config.page.ab_commercialInArticleMobile = 'inline';
                    createInlineAdSlots('x49');
                    createTopAdSlot('Top2');
                }
            },
            {
                id: 'CommercialTop',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha4.com';
                    guardian.config.page.ab_commercialInArticleMobile = 'top';
                    createInlineAdSlots('Top2');
                    createTopAdSlot('x49');
                }
            },
            {
                id: 'control',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha.com';
                }
            }
        ];
    };

    return CommercialInArticlesMobile;

});
