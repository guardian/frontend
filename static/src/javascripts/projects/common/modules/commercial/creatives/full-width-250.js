define([
    'bean',
    'bonzo',
    'common/utils/config',
    'common/utils/detect',
    'lodash/utilities/template',
    'text!common/views/commercial/creatives/full-width-250.html'
], function (
    bean,
    bonzo,
    config,
    detect,
    template,
    fullWidth250Html
) {
    function FullWidth250($adSlot, params) {
        this.create = function () {
            renderContainer($adSlot);
            var $creative = renderCreative($adSlot, params);
            if (isExpandable()) {
                attachExpander($creative);
            }
        };
    }

    function renderContainer(div) {
        div.addClass('ad-slot--full-width-250 content__mobile-full-width');
    }

    function renderCreative($adSlot, params) {
        var html = template(fullWidth250Html, params);
        var creative = bonzo.create(html);
        $adSlot.append(creative);
        return bonzo(creative);
    }

    function attachExpander($creative) {
        var expandClass = 'full-width-250--expanded';
        var isExpanded = false;

        function toggleExpansion() {
            if (!isExpanded) {
                $creative.addClass(expandClass);
            } else {
                $creative.removeClass(expandClass);
            }
            isExpanded = !isExpanded;
        }

        bean.on($creative[0], 'click', toggleExpansion);
    }

    function isExpandable() {
        return config.page.isFront && detect.isBreakpoint({max: 'phablet'});
    }

    return FullWidth250;

});
