define([
    'Promise',
    'common/utils/config',
    'common/utils/fastdom-promise',
    'common/modules/experiments/ab',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/commercial-features'
], function (Promise, config, fastdom, ab, createSlot, commercialFeatures) {
    return {
        init: init
    };

    function isLuckyBastard() {
        var testName = 'PaidContentVsOutbrain';
        return ab.testCanBeRun(testName) && ab.getTestVariantId(testName) === 'lucky-bastards';
    }

    function init() {
        if (!commercialFeatures.highMerch) {
            return Promise.resolve();
        }

        var anchorSelector = config.page.commentable ? '#comments + *' : '.content-footer > :first-child';
        var anchor = document.querySelector(anchorSelector);
        var container = document.createElement('div');

        container.className = 'fc-container fc-container--commercial';
        container.appendChild(createSlot(config.page.isAdvertisementFeature ?
            'high-merch-paid' :
            isLuckyBastard() ?
            'high-merch-lucky' :
            'high-merch'
        ));

        return fastdom.write(function () {
            anchor.parentNode.insertBefore(container, anchor);
        })
    }
});
