define([
    'Promise',
    'lib/$',
    'lib/$css',
    'lib/config',
    'lib/mediator',
    'lib/fastdom-promise',
    'commercial/modules/commercial-features'
], function (
    Promise,
    $,
    $css,
    config,
    mediator,
    fastdom,
    commercialFeatures
) {
    var minArticleHeight = 1300;
    var minImmersiveArticleHeight = 600;

    var mainColumnSelector = '.js-content-main-column';
    var rhColumnSelector = '.js-secondary-column';
    var adSlotSelector = '.js-ad-slot';

    function minContentHeight() {
      return config.page.isImmersive ? minImmersiveArticleHeight : minArticleHeight;
    }

    function init(start, stop) {
        start();

        var $col = $(rhColumnSelector);
        var $mainCol, $adSlot;

        // are article aside ads disabled, or secondary column hidden?
        if (!(commercialFeatures.articleAsideAdverts && $col.length && $css($col, 'display') !== 'none')) {
            stop();
            return Promise.resolve(false);
        }

        $mainCol = $(mainColumnSelector);
        $adSlot = $(adSlotSelector, $col);

        if (!$adSlot.length) {
            stop();
            return Promise.resolve(false);
        }

        return fastdom.read(function () {
            return $mainCol.dim().height;
        })
        .then(function (mainColHeight) {

            // Should switch to 'right-small' MPU for short articles
            if (mainColHeight < minContentHeight()) {
              fastdom.write(function () {
                  $adSlot.removeClass('right-sticky js-sticky-mpu is-sticky');
                  $adSlot[0].setAttribute('data-mobile', '1,1|2,2|300,250|fluid');
              });
            }
            return $adSlot[0];
        })
        .then(function (adSlot) {
            stop();
            mediator.emit('page:commercial:right', adSlot);
        });
    }

    return {
        init: init
    };
});
