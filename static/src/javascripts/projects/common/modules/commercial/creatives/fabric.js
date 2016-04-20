define([
    'bean',
    'bonzo',
    'common/modules/commercial/creatives/add-tracking-pixel',
    'common/utils/config',
    'common/utils/detect',
    'lodash/utilities/template',
    'text!common/views/commercial/creatives/fabric.html',
    'text!common/views/commercial/creatives/fabric-label.html'
], function (
    bean,
    bonzo,
    addTrackingPixel,
    config,
    detect,
    template,
    fabricTemplate,
    fabricLabelTemplate
) {
    function Fabric($adSlot, params) {
        var isExpandable = config.page.isFront && detect.isBreakpoint({max: 'phablet'});

        this.create = function () {
            renderContainer($adSlot);
            renderLabel($adSlot);
            var $creative = renderCreative($adSlot, params);
            if (isExpandable) addExpander($creative);
            if (params.trackingPixel) addTrackingPixel($adSlot, params.trackingPixel + params.cacheBuster);
        };
    }

    function renderContainer($adSlot) {
        $adSlot.addClass('ad-slot--fabric content__mobile-full-width');
    }

    function renderLabel($adSlot) {
        var html = template(fabricLabelTemplate, {});
        $adSlot.append(html);
    }

    function renderCreative($adSlot, params) {
        var html = template(fabricTemplate, params);
        var creative = bonzo.create(html);
        $adSlot.append(creative);
        return bonzo(creative);
    }

    function addExpander($creative) {
        var expandClass = 'fabric--expanded';
        var isExpanded = false;

        function toggleExpansion() {
            !isExpanded ? $creative.addClass(expandClass) : $creative.removeClass(expandClass);
            isExpanded = !isExpanded;
        }

        bean.on($creative[0], 'click', toggleExpansion);
    }

    return Fabric;

});
