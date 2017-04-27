define([
    'Promise',
    'lib/config',
    'lib/fastdom-promise',
    'common/modules/experiments/ab',
    'commercial/modules/dfp/add-slot',
    'commercial/modules/dfp/create-slot',
    'commercial/modules/dfp/track-ad-render',
    'commercial/modules/commercial-features'
], function (Promise, config, fastdom, ab, addSlot, createSlot, trackAdRender, commercialFeatures) {
    return {
        init: init
    };

    function isLuckyBastard() {
        var testName = 'PaidContentVsOutbrain2';
        return ab.testCanBeRun(testName) && ab.getTestVariantId(testName) === 'paid-content';
    }

    function init() {
        if (commercialFeatures.highMerch) {
            var anchorSelector = config.page.commentable ? '#comments + *' : '.content-footer > :first-child';
            var anchor = document.querySelector(anchorSelector);
            var container = document.createElement('div');

            container.className = 'fc-container fc-container--commercial';
            container.appendChild(createSlot(config.page.isPaidContent ? 'high-merch-paid' : 'high-merch'));
            
            if (commercialFeatures.outbrain && isLuckyBastard()) {
                trackAdRender('dfp-ad--merchandising-high')
                    .then(insertAlternativeSlot);
            }
            
            return fastdom.write(function () {
                if (anchor && anchor.parentNode) {
                    anchor.parentNode.insertBefore(container, anchor);
                }
            });
        } else if (commercialFeatures.outbrain && isLuckyBastard()) {
            insertAlternativeSlot(false);
        }

        return Promise.resolve();
    }

    function insertAlternativeSlot(isHiResLoaded) {
        if (isHiResLoaded) {
            return;
        }

        var container = document.querySelector(
            !(config.page.seriesId || config.page.blogIds) ?
            '.js-related, .js-outbrain-anchor' :
            '.js-outbrain-anchor'
        );
        var slot = createSlot('high-merch-lucky');

        fastdom.write(function () {
            container.parentNode.insertBefore(slot, container.nextSibling);
        })
        .then(function () {
            addSlot(slot, true);
        });
    }
});
