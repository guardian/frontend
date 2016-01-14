define([
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/creatives/branded-component-jobs.html',
    'text!common/views/commercial/creatives/branded-component-membership.html',
    'text!common/views/commercial/creatives/branded-component-soulmates.html',
    'lodash/objects/defaults'
], function (
    qwery,
    $,
    config,
    template,
    svgs,
    brandedComponentJobsTpl,
    brandedComponentMembershipTpl,
    brandedComponentSoulmatesTpl,
    defaults) {

    var templates = {
            jobs: {
                template: brandedComponentJobsTpl,
                config:   {
                    imgUrl: config.images.commercial.brandedComponentJobs,
                    marque36icon: svgs('marque36icon', ['creative__marque']),
                    arrowRight: svgs('arrowRight', ['i-right'])
                }
            },
            membership: {
                template: brandedComponentMembershipTpl,
                config:   {
                    marque36icon: svgs('marque36icon', ['creative__marque']),
                    arrowRight: svgs('arrowRight', ['i-right'])
                }
            },
            soulmates: {
                template: brandedComponentSoulmatesTpl,
                config:   {
                    logosoulmates: svgs('logosoulmates'),
                    profileImgM: config.images.commercial.brandedComponentSoulmatesM,
                    profileImgF: config.images.commercial.brandedComponentSoulmatesF
                }
            }
        },
        /**
         * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10027767
         */
        BrandedComponent = function ($adSlot, params, options) {
            this.$adSlot = $adSlot;
            this.params  = params;
            this.opts = defaults(options || {}, {
                force: false
            });
        };

    BrandedComponent.prototype.create = function () {
        var templateConfig = templates[this.params.type],
            $rightHandCol  = $('.js-secondary-column');

        if (
            !this.opts.force && (!templateConfig ||
            $rightHandCol.css('display') === 'none' ||
            $rightHandCol.dim().height < 1800 ||
            config.page.section === 'football')
        ) {
            return false;
        }

        templateConfig.config.clickMacro = this.params.clickMacro;
        templateConfig.config.omnitureId = this.params.omnitureId;

        $.create(template(templateConfig.template, templateConfig.config))
            .appendTo($rightHandCol);
    };

    return BrandedComponent;

});
