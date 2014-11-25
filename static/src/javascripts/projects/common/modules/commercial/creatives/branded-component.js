define([
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'text!common/views/commercial/creatives/branded-component-jobs.html',
    'text!common/views/commercial/creatives/branded-component-membership.html',
    'text!common/views/commercial/creatives/branded-component-soulmates.html'
], function (
    qwery,
    $,
    config,
    template,
    brandedComponentJobsTpl,
    brandedComponentMembershipTpl,
    brandedComponentSoulmatesTpl
) {

    var templates = {
            jobs: {
                template: brandedComponentJobsTpl,
                config:   {
                    imgUrl: config.images.commercial.brandedComponentJobs
                }
            },
            membership: {
                template: brandedComponentMembershipTpl,
                config:   {}
            },
            soulmates: {
                template: brandedComponentSoulmatesTpl,
                config:   {}
            }
        },
        /**
         * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10027767
         */
        BrandedComponent = function ($adSlot, params) {
            this.$adSlot = $adSlot;
            this.params  = params;
        };

    BrandedComponent.prototype.create = function () {
        var templateConfig = templates[this.params.type],
            $rightHandCol  = $('.js-secondary-column');

        if (
            !templateConfig ||
            $rightHandCol.css('display') === 'none' ||
            $rightHandCol.dim().height < 1600 ||
            config.page.section === 'football'
        ) {
            return false;
        }

        templateConfig.config.clickMacro = this.params.clickMacro;

        $.create(template(templateConfig.template, templateConfig.config))
            .appendTo($rightHandCol);
    };

    return BrandedComponent;

});
