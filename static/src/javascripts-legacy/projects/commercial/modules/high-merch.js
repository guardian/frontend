define([
    'Promise',
    'common/utils/config',
    'common/utils/fastdom-promise',
    'common/modules/experiments/ab',
    'common/modules/commercial/dfp/add-slot',
    'common/modules/commercial/dfp/create-slot',
    'common/modules/commercial/dfp/track-ad-render',
    'commercial/modules/commercial-features'
], function (Promise, config, fastdom, ab, addSlot, createSlot, trackAdRender, commercialFeatures) {
    return {
        init: init
    };

    function isLuckyBastard() {
        var testName = 'PaidContentVsOutbrain';
        console.log(ab.testCanBeRun(testName));
        console.log(ab.getTestVariantId(testName) === 'paid-content');
        return ab.testCanBeRun(testName) && ab.getTestVariantId(testName) === 'paid-content';
    }

    function init() {
        if (!commercialFeatures.highMerch) {
            return Promise.resolve();
        }

        var slotName = config.page.isPaidContent ? 'high-merch-paid' : 'high-merch';
        var anchorSelector = config.page.commentable ? '#comments + *' : '.content-footer > :first-child';
        var anchor = document.querySelector(anchorSelector);
        var container = document.createElement('div');

        container.className = 'fc-container fc-container--commercial';
        container.appendChild(createSlot(config.page.isPaidContent ? 'high-merch-paid' : 'high-merch'));

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
                var container = document.querySelector(isHiResLoaded ?
                    '.js-container--commercial' :
                    !(config.page.seriesId || config.page.blogIds) ?
                    '.js-related, .js-outbrain-anchor' :
                    '.js-outbrain-anchor'
                );
                return [
                    createSlot('high-merch-lucky'),
                    container
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
