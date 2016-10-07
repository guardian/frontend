define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/modules/user-prefs',
    'common/views/svgs',
    'text!common/views/commercial/survey/survey-adblock.html',
    'common/utils/storage',
], function (
    bean,
    fastdom,
    $,
    template,
    userprefs,
    svgs,
    surveyAdBlockTemplate,
    storage
) {
    var surveyAdBlock = function (config) {
        this.config = config || {};
        this.bannerTmpl = template(surveyAdBlockTemplate,
            {
                arrowWhiteRight: svgs('arrowWhiteRight'),
                marque36icon: svgs('marque36icon'),
                crossIcon: svgs('crossIcon'),
                surveyOverlaySimple: svgs('surveyOverlaySimple'),
                adFreeDataLink: this.config.adFreeDataLink,
                adFreeButtonText: this.config.adFreeButtonText,
                adFreeMessagePrefix: this.config.adFreeMessagePrefix,
                whitelistDataLink: this.config.whitelistDataLink,
                whitelistText: this.config.whitelistText,
                whitelistGuideImage: this.config.whitelistGuideImage,
                adBlockIcon: this.config.adBlockIcon,
                adBlockPlusIcon: this.config.adBlockPlusIcon,
                variant: this.config.variant
            });
    };

    var greetingView = function() {
        // -> state 1
        $.forEachElement(('.whitelist-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.adfree-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.greeting-state'), function(el){el.classList.remove('is-hidden');});
        $('.survey-container').removeClass('thank-you');
    };

    var whiteListInstructionView = function () {
        // -> state 2
        $.forEachElement(('.greeting-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.adfree-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.thankyou-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.whitelist-state'), function(el){el.classList.remove('is-hidden');});
        $('.survey-container').removeClass('thank-you');
    };

    var adFreeOptionView = function() {
        // -> state 3
        $.forEachElement(('.greeting-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.whitelist-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.thankyou-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.adfree-state'), function(el){el.classList.remove('is-hidden');});
        $('.survey-container').removeClass('thank-you');
    };

    var paymentDoneView = function() {
        // -> state 4
        $.forEachElement(('.greeting-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.whitelist-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.adfree-state'), function(el){el.classList.add('is-hidden');});
        $.forEachElement(('.thankyou-state'), function(el){el.classList.remove('is-hidden');});
        $('.survey-container').addClass('thank-you');
        storage.local.set('gu.abb3.exempt', true);
    };

    var closeOverlay = function() {
        // -> go to article
        $('.survey-container').removeClass('thank-you');
        $('.js-survey-adblock').addClass('is-hidden');
    };

    surveyAdBlock.prototype.attach = function () {
        fastdom.write(function () {
            $(document.body).append(this.bannerTmpl);
            bean.on(document, 'click', $('.cta-whitelist'), function () {
                whiteListInstructionView();
            });
            bean.on(document, 'click', $('.survey-button-rounded__cta.noads'), function () {
                adFreeOptionView();
            });
            bean.on(document, 'click', $('.survey-button-rounded__cta.paypal'), function () {
                paymentDoneView();
            });
            bean.on(document, 'click', $('.survey-button-rounded__cta.ccard'), function () {
                paymentDoneView();
            });
            bean.on(document, 'click', $('.howto-unblock__close-btn'), function () {
                greetingView();
            });
            bean.on(document, 'click', $('.pay-now__close-btn'), function () {
                greetingView();
            });
            bean.on(document, 'click', $('.survey-button-rounded__cta.readon'), function () {
                closeOverlay();
            });
        }.bind(this));
    };

    surveyAdBlock.prototype.show = function () {
        fastdom.write(function () {
            $('.js-survey-adblock').removeClass('is-hidden');
        });
    };

    return surveyAdBlock;
});
