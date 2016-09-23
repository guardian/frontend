define([
    'bean',
    'fastdom',
    'common/utils/$',
    'common/utils/template',
    'common/modules/user-prefs',
    'common/views/svgs',
    'text!common/views/commercial/survey/survey-adblock.html'
], function (
    bean,
    fastdom,
    $,
    template,
    userprefs,
    svgs,
    surveyAdBlockTemplate
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

    surveyAdBlock.prototype.attach = function () {
        fastdom.write(function () {
            $(document.body).append(this.bannerTmpl);
            bean.on(document, 'click', $('.survey-button__cta.whitelist'), function () {
                // -> state 2
                $.forEachElement(('.state-1'), function(el){el.classList.add('is-hidden');});
                $.forEachElement(('.state-3'), function(el){el.classList.add('is-hidden');});
                $.forEachElement(('.state-2'), function(el){el.classList.remove('is-hidden');});
            });
            bean.on(document, 'click', $('.survey-button__cta.noads'), function () {
                // -> state 3
                $.forEachElement(('.state-1'), function(el){el.classList.add('is-hidden');});
                $.forEachElement(('.state-2'), function(el){el.classList.add('is-hidden');});
                $.forEachElement(('.state-3'), function(el){el.classList.remove('is-hidden');});
            });
            bean.on(document, 'click', $('.howto-unblock__close-btn'), function () {
                // -> state 1
                $.forEachElement(('.state-2'), function(el){el.classList.add('is-hidden');});
                $.forEachElement(('.state-3'), function(el){el.classList.add('is-hidden');});
                $.forEachElement(('.state-1'), function(el){el.classList.remove('is-hidden');});
            });
            bean.on(document, 'click', $('.pay-now__close-btn'), function () {
                // -> state 1
                $.forEachElement(('.state-2'), function(el){el.classList.add('is-hidden');});
                $.forEachElement(('.state-3'), function(el){el.classList.add('is-hidden');});
                $.forEachElement(('.state-1'), function(el){el.classList.remove('is-hidden');});
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
