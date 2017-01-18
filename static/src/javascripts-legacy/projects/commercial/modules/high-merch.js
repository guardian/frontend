define([
    'Promise',
    'common/utils/config',
    'common/utils/fastdom-promise',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features'
], function (Promise, config, fastdom, createSlot, commercialFeatures) {
    return {
        init: init
    };

    function init() {
        if (!commercialFeatures.highMerch) {
            return Promise.resolve();
        }

        var anchorSelector = config.page.commentable ? '#comments + *' : '.content-footer > :first-child';
        var anchor = document.querySelector(anchorSelector);
        var container = document.createElement('div');

        container.className = 'fc-container fc-container--commercial';
        container.appendChild(createSlot(config.page.isAdvertisementFeature ? 'high-merch-paid' : 'high-merch'));

        return fastdom.write(function () {
            anchor.parentNode.insertBefore(container, anchor);
        })
    }
});
