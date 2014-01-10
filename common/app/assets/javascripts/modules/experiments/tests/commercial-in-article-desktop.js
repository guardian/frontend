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
        bonzo(qwery('p:nth-of-type(10n)'), article).each(function(el, i) {
            var cls = (i % 2 === 0) ? 'is-odd' : 'is-even';
            bonzo(bonzo.create(inlineAdvertSlot.replace(/%slot%/g, id))).addClass(cls).insertAfter(this);
        });
    };
    
    var createMpuAdSlot = function (id) {
        bonzo(qwery('.js-mpu-ad-slot .social-wrapper')).after(bonzo.create(mpuSlot.replace(/%slot%/g, id))[0]);
    };

    var CommercialInArticlesDesktop = function () {

        var self = this;
        
        this.id = 'CommercialInArticlesDesktop';
        this.expiry = '2014-01-20';
        this.audience = 0.1;
        this.audienceOffset = 0.5;
        this.description = 'Inserts commercial components in to the articles to monitor CTR';
        this.canRun = function(config) {
            return (config.page.contentType === 'Article'
                && (/wide|desktop/).test(detect.getBreakpoint())
            );
        };
        this.variants = [
            {
                id: 'CommercialInline',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha1.com';
                    guardian.config.page.ab_commercialInArticleDesktop = 'inline';
                    createInlineAdSlots('Middle1');
                    createMpuAdSlot('Middle');
                }
            },
            {
                id: 'CommercialMpu',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha2.com';
                    guardian.config.page.ab_commercialInArticleDesktop = 'mpu';
                    createInlineAdSlots('Middle');
                    createMpuAdSlot('Middle1');
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


    return CommercialInArticlesDesktop;

});
