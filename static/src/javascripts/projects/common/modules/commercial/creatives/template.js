define([
    'common/utils/$',
    'common/utils/template',
    'text!common/views/commercial/creatives/ad-feature-mpu.html',
    'text!common/views/commercial/creatives/ad-feature-mpu-large.html',
    'text!common/views/commercial/creatives/ad-single-manual.html'
], function (
    $,
    template,
    adFeatureMpuTpl,
    adFeatureMpuLargeTpl,
    adSingleManual
) {

    /**
     * Create simple templated creatives -
     *
     *  * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10021527
     *  * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10028127
     */
    var creativeTemplates = {
            'ad-feature-mpu': adFeatureMpuTpl,
            'ad-feature-mpu-large': adFeatureMpuLargeTpl,
            'ad-single-manual': adSingleManual

            /*{
             "name": "template",
             "params": {
             "creative": "ad-single-manual",
             "toneClass": "[%Toneclass%]",
             "omnitureId": "[%omnitureid%]",
             "baseUrl": "[%base__url%]",
             "relevance": "[%relevance%]",
             "title": "[%title%]",
             "viewAllText": "[%viewalltext%]",
             "offerTitle": "[%offertitle%]",
             "offerImage": "[%offerimage%]",
             "offerText": "[%offertext%]",
             "offerLinkText": "[%offerlinktext%]",
             "offerUrl": "[%offerurl%]",
             "seeMoreUrl": "[%seemoreurl%]",
             "showCtaLink": "[%showctalink%]",
             "clickMacro": "%%CLICK_URL_ESC%%"
             }
             }
            * */
        },
        Template = function ($adSlot, params) {
            this.$adSlot = $adSlot;
            this.params  = params;
        };

    Template.prototype.create = function () {
        var creativeHtml = template(creativeTemplates[this.params.creative], this.params);

        $.create(creativeHtml)
            .appendTo(this.$adSlot);
    };

    return Template;

});
