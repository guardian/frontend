define([
    'fastdom',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/ajax',
    'common/utils/proximity-loader',
    'common/modules/onward/inject-container',
    'lodash/collections/contains'
], function (
    fastdom,
    qwery,
    $,
    config,
    ajax,
    proximityLoader,
    injectContainer,
    contains
) {

    var sectionsToLoadSectionFronts = ['sport', 'football', 'fashion', 'lifestyle', 'culture', 'business', 'technology', 'environment'],
        loadSection = (contains(sectionsToLoadSectionFronts, config.page.section)) ? true : false,
        edition = (config.page.edition === 'INT') ? 'international' : config.page.edition.toLowerCase();

    function FrontsContainers() {
        moveComments();
        insertFirstThree();
        insertFinalThree();
    }

    function insertFirstThree() {
        var front = (loadSection) ? config.page.section : edition;

        insertContainers(front, $('.js-fronts-containers'), 3, 0, 'original', function () {});
    }

    function insertFinalThree() {
        var offset = (loadSection) ? 0 : 3;
        insertContainers(edition, $('.js-network-fronts-containers'), 3, offset, 'original', function () {});
    }

    function insertContainers(section, $el, num, offset, size, callback) {
        proximityLoader.add($el, 1500, function () {
            fastdom.write(function () {
                injectContainer.injectContainer('/container/' + section + '/some/' + num + '/' + offset + '/' + size + '.json', $el, 'inject-network-front-' + num, callback);
            });
        });
    }

    function moveComments() {
        if (config.page.commentable) {
            fastdom.write(function () {
                $('.submeta').before('<a href=\'#comments\' class=\'button button--small submeta__jump-to-comments\'><span class=\'submeta__jump-to-comments-text\'>Jump to comments</span></a>');
                $('.js-comments').insertAfter(qwery('.js-network-fronts-containers'));
            });
        }
    }

    return FrontsContainers;

});
