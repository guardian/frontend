/*global guardian */
define([
    'common',
    'qwery',
    'bonzo',
    'bean',
    'utils/detect',
    'modules/analytics/adverts',
    'modules/adverts/sticky'
], function (
    common,
    qwery,
    bonzo,
    bean,
    detect,
    Sticky
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

    var CommercialInArticles = function () {

        var self = this;
        
        this.id = 'CommercialInArticles';
        this.expiry = '2014-01-07';
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
                id: 'commercialInline',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha1.com';
                    createInlineAdSlots('Middle1');
                    createMpuAdSlot('Middle');
                }
            },
            {
                id: 'commercialAdhesive',
                test: function(context, config) {
                    guardian.config.page.oasSiteIdHost = 'www.theguardian-alpha1.com';
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

    return CommercialInArticles;

});
