define([
    'bean',
    'common/utils/fastdom-promise',
    'lodash/utilities/template',
    'text!common/views/commercial/creatives/full-width-250.html'
], function (
    bean,
    fastdom,
    template,
    fullWidth250Html
) {
    function FullWidth250($adSlot, params) {
        this.create = function () {
            renderContainer($adSlot);
            renderCreative($adSlot, params);
        };
    }

    function renderContainer(div) {
        fastdom.write(function () {
            div.addClass('ad-slot--full-width-250 content__mobile-full-width');
        });
    }

    function renderCreative($adSlot, params) {
        var html = template(fullWidth250Html, params);
        fastdom.write(function () {
            $adSlot.append(html);
        });
    }

    return FullWidth250;

});
