define([
    'bean',
    'bonzo',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/fastdom-promise',
    'lodash/utilities/template',
    'text!common/views/commercial/creatives/full-width-250.html'
], function (
    bean,
    bonzo,
    config,
    detect,
    fastdom,
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
        fastdom.write(function () {
            div.addClass('ad-slot--full-width-250 content__mobile-full-width');
        });
    }

    function renderCreative($adSlot, params) {
        var html = template(fullWidth250Html, params);
        var creative = bonzo.create(html);
        fastdom.write(function () {
            $adSlot.append(creative);
        });
        return bonzo(creative);
    }

    function attachExpander($creative) {
        var expandClass = 'creative--full-width-250--expanded';
        var isExpanded = false;

        function toggleExpansion() {
            fastdom.write(function () {
                if (!isExpanded) {
                    $creative.addClass(expandClass);
                } else {
                    $creative.removeClass(expandClass);
                }
                isExpanded = !isExpanded;
            });
        }

        bean.on($creative[0], 'click', toggleExpansion);
    }

    function isExpandable() {
        return config.page.isFront && detect.isBreakpoint({max: 'phablet'});
    }

    return FullWidth250;

});
