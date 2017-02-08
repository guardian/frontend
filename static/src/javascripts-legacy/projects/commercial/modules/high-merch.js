define([
    'Promise',
    'common/utils/config',
    'common/utils/fastdom-promise',
    'common/modules/experiments/ab',
    'common/modules/commercial/dfp/add-slot',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/dfp/track-ad-render',
    'common/modules/commercial/commercial-features'
], function (Promise, config, fastdom, ab, addSlot, createSlot, trackAdRender, commercialFeatures) {
    return {
        init: init
    };

    function isLuckyBastard() {
        var testName = 'PaidContentVsOutbrain';
        return ab.testCanBeRun(testName) && ab.getTestVariantId(testName) === 'paid-content';
    }

    function init() {
        if (!commercialFeatures.highMerch) {
            return Promise.resolve();
        }

        var slotName = config.page.isAdvertisementFeature ? 'high-merch-paid' : 'high-merch';
        var anchorSelector = config.page.commentable ? '#comments + *' : '.content-footer > :first-child';
        var anchor = document.querySelector(anchorSelector);
        var container = document.createElement('div');

        container.className = 'fc-container fc-container--commercial';
        container.appendChild(createSlot(slotName));

        if (isLuckyBastard()) {
            insertAlternativeSlot(container);
        }

        return fastdom.write(function () {
            anchor.parentNode.insertBefore(container, anchor);
        });
    }

    function insertAlternativeSlot(container) {
        trackAdRender('dfp-ad--merchandising-high')
        .then(function (isHiResLoaded) {
            return Promise.all([
                isHiResLoaded,
                isHiResLoaded ? trackAdRender('dfp-ad--merchandising') : true
            ]);
        })
        .then(function (args) {
            var isHiResLoaded = args[0];
            var isLoResLoaded = args[1];

            if (!isHiResLoaded || !isLoResLoaded) {
                return [
                    createSlot('high-merch-lucky'),
                    isHiResLoaded ? document.querySelector('.js-container--commercial') : container
                ];
            }
        })
        .then(function (args) {
            if (args) {
                fastdom.write(function () {
                    args[1].appendChild(args[0]);
                    addSlot(args[0]);
                });
            }
        });
    }
});
