define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/commercial/creatives/manual-inline-button.html',
    'text!common/views/commercial/creatives/manual-single-button.html',
    'text!common/views/commercial/creatives/manual-multiple-button.html',

    // require templates, so they're bundled up as part of the build
    'text!common/views/commercial/creatives/ad-feature-mpu.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large-v2.html',
    'text!common/views/commercial/creatives/logo-ad-feature.html',
    'text!common/views/commercial/creatives/logo-sponsored.html',
    'text!common/views/commercial/creatives/manual-inline.html',
    'text!common/views/commercial/creatives/manual-multiple.html',
    'text!common/views/commercial/creatives/manual-single.html'
], function (
    $,
    config,
    template,
    svgs,
    manualInlineButtonStr,
    manualSingleButtonStr,
    manualMultipleButtonStr
) {

    var manualInlineButtonTpl;
    var manualSingleButtonTpl;
    var manualMultipleButtonTpl;

    var preprocessTemplate = {
        'manual-inline': function(tpl) {
            if (!manualInlineButtonTpl) {
                manualInlineButtonTpl = template(manualInlineButtonStr);
            }
            // having a button is the default state, that is why we expressely
            // test for when *not* to display one
            tpl.params.offerButton = tpl.params.showButton === 'no' ?
                '' :
                manualInlineButtonTpl(tpl.params);
        },

        'manual-single': function(tpl) {
            if (!manualSingleButtonTpl) {
                manualSingleButtonTpl = template(manualSingleButtonStr);
            }
            tpl.params.offerButton = (tpl.params.offerLinkText) ?
                 manualSingleButtonTpl(tpl.params) :
                 '';
        },

        'manual-multiple': function(tpl) {
            if (!manualMultipleButtonTpl) {
                manualMultipleButtonTpl = template(manualMultipleButtonStr);
            }

            var links = ['offer1linktext', 'offer2linktext', 'offer3linktext', 'offer4linktext'];
            for (var i = 0; i < links.length; i++) {
                tpl.params['offer' + (i + 1) + 'Button'] = (tpl.params.offerlinktext || tpl.params[links[i]]) ?
                    manualMultipleButtonTpl({
                        offerlinktext: tpl.params[links[i]] || tpl.params.offerlinktext,
                        arrowRight: tpl.params.arrowRight
                    }) :
                    '';
            }
        }
    };

    /**
     * Create simple templated creatives
     *
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10021527
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028127
     */
    var Template = function ($adSlot, params) {
        this.$adSlot = $adSlot;
        this.params  = params;

        if (this.params.Toneclass) {
            this.params.soulmates = params.Toneclass.indexOf('soulmates') !== -1;
            this.params.HeaderToneclass = 'commercial__header--' + this.params.Toneclass.replace('commercial--tone-', '');
        }

        this.params.marque36icon = svgs('marque36icon');
        this.params.marque54icon = svgs('marque54icon');
        this.params.logosoulmates = svgs('logosoulmates');
        this.params.logosoulmatesjoin = svgs('logosoulmatesjoin');
        this.params.arrowRight = svgs('arrowRight', ['i-right']);
        this.params.logoguardian = svgs('logoguardian');
        this.params.marque36iconCreativeMarque = svgs('marque36icon', ['creative__marque']);
        this.params.logoFeatureLabel = config.switches.newCommercialContent ? 'Paid for by:' : 'Brought to you by:';
    };

    Template.prototype.create = function () {
        require(['text!common/views/commercial/creatives/' + this.params.creative + '.html'], function (creativeTpl) {
            if (preprocessTemplate[this.params.creative]) {
                preprocessTemplate[this.params.creative](this);
            }

            var creativeHtml = template(creativeTpl, this.params);

            $.create(creativeHtml)
                .appendTo(this.$adSlot);
        }.bind(this));
    };

    return Template;

});
