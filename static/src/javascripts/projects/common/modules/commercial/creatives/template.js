define([
    'Promise',
    'common/utils/config',
    'common/utils/template',
    'common/utils/fastdom-promise',
    'common/views/svgs',
    'common/modules/commercial/creatives/template-preprocessor',

    // require templates, so they're bundled up as part of the build
    'text!common/views/commercial/creatives/logo.html',
    'text!common/views/commercial/creatives/gimbap.html',
    'text!common/views/commercial/creatives/gimbap-simple.html',
    'text!common/views/commercial/creatives/gimbap-richmedia.html',
    'text!common/views/commercial/creatives/manual-container.html'
], function (
    Promise,
    config,
    template,
    fastdom,
    svgs,
    templatePreprocessor
) {
    /**
     * Create simple templated creatives
     *
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10021527
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028127
     */
    var Template = function (adSlot, params) {
        this.adSlot = adSlot instanceof HTMLElement ? adSlot : adSlot[0];
        this.params = params;

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
    };

    Template.prototype.create = function () {
        return new Promise(function (resolve) {
            if( this.params.creative === 'manual-single') {
                this.params.type = 'single';
                this.params.creative = 'manual-container';
                this.params.creativeCard = 'manual-card-large';
                this.params.classNames = ['legacy', 'legacy-single', this.params.toneClass.replace('commercial--', ''), this.params.toneClass.replace('commercial--tone-', '')];
            } else if (this.params.creative === 'manual-multiple') {
                // harmonise attribute names until we do this on the DFP side
                this.params.toneClass = this.params.Toneclass;
                this.params.baseUrl = this.params.base__url;
                this.params.offerLinkText = this.params.offerlinktext;

                this.params.type = 'multiple';
                this.params.creative = 'manual-container';
                this.params.creativeCard = 'manual-card';
                this.params.classNames = ['legacy', this.params.toneClass.replace('commercial--', ''), this.params.toneClass.replace('commercial--tone-', '')];
            } else if (this.params.creative === 'manual-inline') {
                this.params.omnitureId = this.params.omniture_id;
                this.params.toneClass = this.params.Toneclass;
                this.params.baseUrl = this.params.base_url;
                this.params.offerTitle = this.params.offer_title;
                this.params.offerUrl = this.params.offer_url;
                this.params.offerImage = this.params.offer_image;
                this.params.offerText = this.params.offer_meta;

                this.params.creative = 'manual-container';
                this.params.creativeCard = 'manual-card';
                this.params.type = 'inline';
                this.params.classNames = ['legacy-inline', this.params.toneClass.replace('commercial--', ''), this.params.toneClass.replace('commercial--tone-', '')];
            } else if (this.params.creative === 'logo-ad-feature') {
                this.params.creative = 'logo';
                this.params.type = 'ad-feature';
            } else if (this.params.creative === 'logo-sponsored') {
                this.params.creative = 'logo';
                this.params.type = 'sponsored';
            }

            require(['text!common/views/commercial/creatives/' + this.params.creative + '.html'], function (creativeTpl) {
                if (templatePreprocessor[this.params.creative]) {
                    templatePreprocessor[this.params.creative](this);
                }

                var creativeHtml = template(creativeTpl, this.params);

                resolve(fastdom.write(function () {
                    this.adSlot.insertAdjacentHTML('beforeend', creativeHtml);
                    return true;
                }, this));
            }.bind(this));
        }.bind(this));
    };

    return Template;

});
