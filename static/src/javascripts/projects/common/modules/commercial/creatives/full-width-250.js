define([
    'bean',
    'bonzo',
    'common/utils/config',
    'common/utils/detect',
    'lodash/utilities/template',
    'text!common/views/commercial/creatives/full-width-250.html',
    'text!common/views/commercial/creatives/full-width-250-label.html'
], function (
    bean,
    bonzo,
    config,
    detect,
    template,
    fullWidth250Template,
    fullWidth250LabelTemplate
) {
    function FullWidth250($adSlot, params) {
        this.create = function () {
            renderContainer($adSlot);
            renderLabel($adSlot);
            var $creative = renderCreative($adSlot, params);
            if (isExpandable()) {
                attachExpander($creative);
            }
        };
    }

    function renderContainer($adSlot) {
        $adSlot.addClass('ad-slot--full-width-250 content__mobile-full-width');
    }

    function renderLabel($adSlot) {
        var html = template(fullWidth250LabelTemplate, {});
        $adSlot.append(html);
    }

    function renderCreative($adSlot, params) {
        var html = template(fullWidth250Template, params);
        var creative = bonzo.create(html);
        $adSlot.append(creative);
        return bonzo(creative);
    }

    function attachExpander($creative) {
        var expandClass = 'full-width-250--expanded';
        var isExpanded = false;

        function toggleExpansion() {
            !isExpanded ? $creative.addClass(expandClass) : $creative.removeClass(expandClass);
            isExpanded = !isExpanded;
        }

        bean.on($creative[0], 'click', toggleExpansion);
    }

    function isExpandable() {
        return config.page.isFront && detect.isBreakpoint({max: 'phablet'});
    }

    return FullWidth250;

});
