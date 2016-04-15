define([
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/template',
    'common/utils/fastdom-promise',
    'common/views/svgs',
    'common/modules/ui/toggles',
    'common/modules/commercial/creatives/template-preprocessor',

    // require templates, so they're bundled up as part of the build
    'text!common/views/commercial/creatives/ad-feature-mpu.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large-v2.html',
    'text!common/views/commercial/creatives/logo-ad-feature.html',
    'text!common/views/commercial/creatives/logo-sponsored.html',
    'text!common/views/commercial/creatives/manual-inline.html',
    'text!common/views/commercial/creatives/manual-multiple.html',
    'text!common/views/commercial/creatives/manual-single.html',
    'text!common/views/commercial/creatives/gimbap.html',
    'text!common/views/commercial/creatives/gimbap-simple.html',
    'text!common/views/commercial/creatives/gimbap-richmedia.html',
    'text!common/views/commercial/creatives/manual-container.html'
], function (
    Promise,
    $,
    config,
    template,
    fastdom,
    svgs,
    Toggles,
    templatePreprocessor
) {
    function createToggle(el) {
        if (el.querySelector('.popup__toggle')) {
            new Toggles(el).init();
        }
    }

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
            this.params.isSoulmates = params.Toneclass.indexOf('soulmates') !== -1;
            this.params.isMembership = params.Toneclass.indexOf('membership') !== -1;
            this.params.HeaderToneclass = 'commercial__header--' + this.params.Toneclass.replace('commercial--tone-', '');
        }

        this.params.marque36icon = svgs('marque36icon');
        this.params.marque54icon = svgs('marque54icon');
        this.params.logosoulmates = svgs('logosoulmates');
        this.params.logosoulmatesjoin = svgs('logosoulmatesjoin');
        this.params.logomembership = svgs('logomembershipwhite');
        this.params.logosoulmateshorizontal = svgs('logosoulmates');
        this.params.logomasterclasseshorizontal = svgs('logomasterclasseshorizontal');
        this.params.logomembershorizontal = svgs('logomembershiphorizontal');
        this.params.logojobshorizontal = svgs('logojobshorizontal');
        this.params.logobookshophorizontal = svgs('logobookshophorizontal');
        this.params.logojobs = svgs('logojobs');
        this.params.logomasterclasses = svgs('logomasterclasses');
        this.params.arrowRight = svgs('arrowRight', ['i-right']);
        this.params.logoguardian = svgs('logoguardian');
        this.params.marque36iconCreativeMarque = svgs('marque36icon', ['creative__marque']);
        this.params.logoFeatureLabel = 'Paid for by';
    };

    Template.prototype.postLoadEvents = {
        'manual-single': createToggle,
        'manual-multiple': createToggle
    };

    Template.prototype.create = function () {
        return new Promise(function (resolve) {
            if( this.params.creative === 'manual-single' && config.switches.v2ManualSingleTemplate ) {
                this.params.originalCreative = 'manual-single';
                this.params.creative = 'manual-container';
                this.params.creativeCard = 'manual-card-large';
                this.params.classNames = ['legacy', 'legacy-single', this.params.toneClass.replace('commercial--', ''), this.params.Toneclass.replace('commercial--tone-', '')];
            }

            if (this.params.creative === 'manual-multiple' && config.switches.v2ManualMultipleTemplate ) {
                // harmonise attribute names until we do this on the DFP side
                this.params.toneClass = this.params.Toneclass;
                this.params.baseUrl = this.params.base__url;
                this.params.offerLinkText = this.params.offerlinktext;

                this.params.originalCreative = 'manual-multiple';
                this.params.creative = 'manual-container';
                this.params.creativeCard = 'manual-card';
                this.params.classNames = ['legacy', this.params.toneClass.replace('commercial--', ''), this.params.toneClass.replace('commercial--tone-', '')];
            }

            require(['text!common/views/commercial/creatives/' + this.params.creative + '.html'], function (creativeTpl) {
                if (templatePreprocessor[this.params.creative]) {
                    templatePreprocessor[this.params.creative](this);
                }

                var creativeHtml = template(creativeTpl, this.params);
                var $ad = $.create(creativeHtml);

                resolve(fastdom.write(function () {
                    $ad.appendTo(this.$adSlot);
                    if (this.postLoadEvents[this.params.creative]) {
                        this.postLoadEvents[this.params.creative]($ad[0]);
                    }
                    return $ad;
                }, this));
            }.bind(this));
        }.bind(this));
    };

    return Template;

});
