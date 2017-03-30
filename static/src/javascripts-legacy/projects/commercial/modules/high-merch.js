define([
    'Promise',
    'lib/config',
    'lib/fastdom-promise',
    'commercial/modules/dfp/create-slot',
    'commercial/modules/commercial-features'
], function (Promise, config, fastdom, createSlot, commercialFeatures) {
    return {
        init: init
    };

    function init() {
        if (commercialFeatures.highMerch) {
            var anchorSelector = config.page.commentable ? '#comments + *' : '.content-footer > :first-child';
            var anchor = document.querySelector(anchorSelector);
            var container = document.createElement('div');

            container.className = 'fc-container fc-container--commercial';
            container.appendChild(createSlot(config.page.isPaidContent ? 'high-merch-paid' : 'high-merch'));

            return fastdom.write(function () {
                if (anchor && anchor.parentNode) {
                    anchor.parentNode.insertBefore(container, anchor);
                }
            });
        }

        return Promise.resolve();
    }
});
