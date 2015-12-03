define([
    'fastdom',
    'bean',
    'qwery',
    'common/utils/$',
    'common/utils/config',
    'common/utils/ajax',
    'common/utils/proximity-loader',
    'common/modules/onward/inject-container',
    'lodash/collections/contains',
    'common/modules/identity/api',
    'common/utils/scroller',
    'common/views/svgs'
], function (
    fastdom,
    bean,
    qwery,
    $,
    config,
    ajax,
    proximityLoader,
    injectContainer,
    contains,
    identity,
    scroller,
    svgs
) {

    var sectionsToLoadSectionFronts = ['sport', 'football', 'fashion', 'lifestyle', 'culture', 'business', 'technology', 'environment'],
        loadSection = (contains(sectionsToLoadSectionFronts, config.page.section)) ? true : false,
        edition = (config.page.edition === 'INT') ? 'international' : config.page.edition.toLowerCase();

    function FrontsContainers() {
        moveComments();
        insertFirstTwo();
        insertFinalTwo();
    }

    function insertFirstTwo() {
        var front = (loadSection) ? config.page.section : edition;

        insertContainers(front, $('.js-fronts-containers'), 2, 0, 'original', function () {});
    }

    function insertFinalTwo() {
        var offset = (loadSection) ? 0 : 2;
        insertContainers(edition, $('.js-network-fronts-containers'), 2, offset, 'original', function () {});
    }

    function insertContainers(section, $el, num, offset, size, callback) {
        proximityLoader.add($el, 1500, function () {
            fastdom.write(function () {
                injectContainer.injectContainer('/container/' + section + '/some/' + num + '/' + offset + '/' + size + '.json', $el, 'inject-network-front-' + num, callback);
            });
        });
    }

    function moveComments() {
        if (!identity.isUserLoggedIn() && config.page.commentable) {
            fastdom.write(function () {
                $('.submeta').append('<hr class=\'submeta__jump-to-comments-line\'/><button class=\'button button--large button--primary submeta__jump-to-comments js-move-comments\'>' + svgs('commentCount16icon') + '<span class=\'submeta__jump-to-comments-text\'>View comments</span></button>');
                $('.js-comments').insertAfter(qwery('.js-network-fronts-containers'));
            });

            bean.on(document.body, 'click', '.js-move-comments', function () {
                fastdom.write(function () {
                    $('.js-comments').insertBefore(qwery('.fc-container--commercial-high'));
                    $('.js-move-comments').hide();
                    fastdom.read(function () {
                        scroller.scrollToElement(qwery('.js-comments'), 300, 'easeInOutQuad');
                    });
                });
            });
        }
    }

    return FrontsContainers;

});
