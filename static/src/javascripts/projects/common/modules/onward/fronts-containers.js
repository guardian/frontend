define([
    'fastdom',
    'bean',
    'qwery',
    'bonzo',
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
    bonzo,
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
    var sectionsToLoadSectionFronts = ['commentisfree', 'sport', 'football', 'fashion', 'lifeandstyle', 'education', 'culture', 'business', 'technology', 'politics', 'environment', 'travel', 'film', 'media', 'money', 'society', 'science', 'music', 'books', 'stage', 'cities', 'tv-and-radio', 'artanddesign', 'global-development'],
        loadSection = (contains(sectionsToLoadSectionFronts, config.page.section)) ? true : false,
        edition = (config.page.edition === 'INT') ? 'international' : config.page.edition.toLowerCase();

    function FrontsContainers() {
        moveComments();
        insertFirstTwo();
    }

    function insertFirstTwo() {
        if (loadSection) {
            insertContainers(config.page.section, $('.js-fronts-section'), 1, 0, 'original', function () {});
            insertContainers(edition, $('.js-fronts-network-1'), 1, 0, 'none', function () {
                insertFinalTwo();
            });
        } else {
            insertContainers(edition, $('.js-fronts-network-1'), 2, 0, 'none', function () {
                insertFinalTwo();
            });
        }
    }

    function insertFinalTwo() {
        var offset = (loadSection) ? 1 : 2,
            toFilter = (config.page.section === 'sport') ? 'sport' : 'none';

        insertContainers(edition, $('.js-fronts-network-2'), 2, offset, toFilter, function () {});
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
            var $comments = $('.js-comments');

            fastdom.write(function () {
                $('.submeta').append('<hr class=\'submeta__jump-to-comments-line\'/><button class=\'button button--large button--primary submeta__jump-to-comments js-move-comments\'>' + svgs('commentCount16icon') + '<span class=\'submeta__jump-to-comments-text\'>View comments</span></button>');
                $comments.insertAfter(qwery('.js-network-fronts-containers'));
            });

            bean.on(document.body, 'click', '.js-move-comments', function () {
                fastdom.write(function () {
                    $comments.insertBefore(qwery('.fc-container--commercial-high'));
                    $('.js-move-comments').hide();
                    fastdom.read(function () {
                        scroller.scrollToElement($comments, 300, 'easeInOutQuad');
                    });
                });
            });
        }
    }

    return FrontsContainers;

});
