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
    'common/views/svgs',
    'common/modules/experiments/ab'
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
    svgs,
    ab
) {
    var sectionsToLoadSectionFronts = ['commentisfree', 'sport', 'football', 'fashion', 'lifeandstyle', 'education', 'culture', 'business', 'technology', 'politics', 'environment', 'travel', 'film', 'media', 'money', 'society', 'science', 'music', 'books', 'stage', 'cities', 'tv-and-radio', 'artanddesign', 'global-development'],
        loadSection = (contains(sectionsToLoadSectionFronts, config.page.section)) ? true : false,
        edition = (config.page.edition === 'INT') ? 'international' : config.page.edition.toLowerCase(),
        isOneAndThree = ab.getParticipations().FrontsOnArticles && ab.getParticipations().FrontsOnArticles.variant === 'oneAndThree';

    function FrontsContainers() {
        moveComments();
        insertFirstFew();
    }

    function insertFirstFew() {
        var numToLoad = (isOneAndThree) ? 1 : 2;

        if (loadSection) {
            insertContainers(config.page.section, $('.js-fronts-section'), 1, 0, 'none', function () {});

            if (!isOneAndThree) {
                insertContainers(edition, $('.js-fronts-network-1'), 1, 0, 'none', function () {
                    insertFinalFew();
                });
            } else {
                insertFinalFew();
            }
        } else {
            insertContainers(edition, $('.js-fronts-network-1'), numToLoad, 0, 'none', function () {
                insertFinalFew();
            });
        }
    }

    function insertFinalFew() {
        var toFilter = (config.page.section === 'sport') ? 'sport' : 'none',
            offset,
            numberToLoad = (isOneAndThree) ? 3 : 2;

        if (isOneAndThree && loadSection) {
            offset = 0;
        } else if ((isOneAndThree && !loadSection) || (!isOneAndThree && loadSection)) {
            offset = 1;
        } else {
            offset = 2;
        }

        insertContainers(edition, $('.js-fronts-network-2'), numberToLoad, offset, toFilter, function () {});
    }

    function insertContainers(section, $el, num, offset, sectionToFilter, callback) {
        proximityLoader.add($el, 1500, function () {
            fastdom.write(function () {
                injectContainer.injectContainer('/container/' + section + '/some/' + num + '/' + offset + '/' + sectionToFilter + '/' + edition + '.json', $el, 'inject-network-front-' + num, callback);
            });
        });
    }

    function moveComments() {
        if (!identity.isUserLoggedIn() && config.page.commentable) {
            var $comments = $('.js-comments');

            fastdom.write(function () {
                $('.submeta').append('<hr class=\'submeta__jump-to-comments-line\'/><button class=\'button button--large button--primary submeta__jump-to-comments js-move-comments\' data-link-name=\'ab-jump-to-comments-button\'>' + svgs('commentCount16icon') + '<span class=\'submeta__jump-to-comments-text\'>View comments</span></button>');
                $comments.insertAfter(qwery('.js-fronts-network-2'));
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
