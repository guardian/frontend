define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/utils/config',
    'common/modules/experiments/ab'
], function (
    fastDom,
    $,
    _,
    ajax,
    mediator,
    config,
    ab
) {
    var tests = [
            {
                id: 'TruncationWithFacebook',
                variant: 'variant',
                endpoint: '/most-read-facebook.json',
                title: 'Trending on Facebook'
            },
            {
                id: 'TruncationWithRelevant',
                variant: 'variant',
                endpoint: '/most-relevant-container/' + (config.page.edition + '/' + config.page.section).toLowerCase() + '.json',
                title: 'More from ' + config.page.sectionName
            }
        ],
        targetEl = '.js-related';

    return {
        getTest: function () {
            return _.find(tests, function (test) {
                return ab.shouldRunTest(test.id, test.variant);
            });
        },

        applyTest: function (test) {
            ajax({
                url: test.endpoint,
                type: 'json',
                crossOrigin: true
            })
            .then(function (res) {
                var el;

                if (res.html) {
                    el = $.create(res.html);

                    if (test.title) {
                        $('.fc-container__header__title', el).html(test.title);
                    }

                    $('.js-show-more-button', el).remove();

                    fastDom.write(function () {
                        $(targetEl).append(el);
                        mediator.emit('page:new-content', el);
                    });
                }
            });
        }
    };
});
