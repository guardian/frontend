define([
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/analytics/register',
    'common/utils/proximity-loader',
    'common/modules/onward/inject-container',
    'common/modules/commercial/third-party-tags/outbrain',
    'lodash/collections/contains',
    'common/modules/identity/api'
], function (
    fastdom,
    qwery,
    $,
    config,
    mediator,
    ajax,
    register,
    proximityLoader,
    injectContainer,
    outbrain,
    contains,
    identity
) {

    var sectionsToLoadSectionFronts = ['sport', 'football', 'fashion', 'lifestyle'],
        loadSection = (contains(sectionsToLoadSectionFronts, config.page.section)) ? true : false;

    function FrontsContainers() {
        insertFirstThree();
        insertFinalThree();
    }

    function insertFirstThree() {
        var front = (loadSection) ? config.page.section : 'uk';

        moveComments();

        if (!config.page.hasStoryPackage && !(config.page.seriesId || config.page.blogIds) && config.page.showRelatedContent && outbrain.canRun() && !outbrain.hasHighRelevanceComponent()) {
            insertContainers(front, $('.js-related'), 1, 0, 'small', function () {
                insertContainers(front, $('.js-fronts-containers'), 2, 1, 'original', function () {});
            });
        } else {
            insertContainers(front, $('.js-fronts-containers'), 3, 0, 'original', function () {});
        }
    }

    function insertFinalThree() {
        var offset = (loadSection) ? 0 : 3;

        insertContainers('uk', $('.js-network-fronts-containers'), 3, offset, 'original', function () {});
    }

    function insertContainers(section, $el, num, offset, size, callback) {
        proximityLoader.add($el, 1500, function () {
            injectContainer.injectContainer('/container/' + section + '/some/' + num + '/' + offset + '/' + size + '.json', $el, 'inject-network-front-' + num, callback);
        });
    }

    function moveComments() {
        if(!identity.isUserLoggedIn() && config.page.commentable) {
            $(".js-comments").insertAfter(qwery(".js-network-fronts-containers"));
        }
    }

    return FrontsContainers;

});
