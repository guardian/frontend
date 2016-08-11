/*
 Module: commercial/creatives/commercial-component.js
 Description: Loads our commercial components
 */
define([
    'fastdom',
    'Promise',
    'common/utils/$',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/lazyload',
    'common/modules/ui/toggles',
    'lodash/objects/isArray',
    'lodash/objects/pick',
    'lodash/objects/merge',
    'lodash/collections/map',
    'lodash/collections/reduce'
], function (
    fastdom,
    Promise,
    $,
    config,
    mediator,
    lazyload,
    Toggles,
    isArray,
    pick,
    merge,
    map,
    reduce
) {
    var urlBuilders = {
        soulmates:      defaultUrlBuilder('soulmates/mixed'),
        soulmatesTest:  defaultUrlBuilder('soulmates-test/mixed'),
        capiSingle:     complexUrlBuilder('capi-single', false, false, true),
        capi:           complexUrlBuilder('capi', false, false, true),
        paidforCard:    complexUrlBuilder('paid', '', false, true),
        books:          complexUrlBuilder('books/books', 'isbns'),
        jobs:           complexUrlBuilder('jobs', 'jobIds', true),
        masterclasses:  complexUrlBuilder('masterclasses', 'ids', true),
        liveevents:     complexUrlBuilder('liveevents/event', 'id', true),
        travel:         complexUrlBuilder('travel/offers', 'ids', true),
        multi:          complexUrlBuilder('multi', '', true),
        book:           bookUrlBuilder('books/book'),
        soulmatesGroup: soulmatesGroupUrlBuilder('soulmates/')
    };

    function defaultUrlBuilder(url) {
        return function (params) {
            return buildComponentUrl(url, params);
        };
    }

    function bookUrlBuilder(url) {
        return function (params) {
            var isbn = config.page.isbn || params.isbn;
            if (isbn) {
                return buildComponentUrl(url, merge(params, { t: isbn }));
            } else {
                return false;
            }
        };
    }

    function soulmatesGroupUrlBuilder(url) {
        return function (params) {
            return buildComponentUrl(url + params.soulmatesFeedName, params);
        };
    }

    function complexUrlBuilder(url, withSpecificId, withKeywords, withSection) {
        return function (params) {
            return buildComponentUrl(url, merge(
                params,
                withSpecificId && params[withSpecificId] ? { t: params[withSpecificId].split(',') } : {},
                withKeywords ? getKeywords() : {},
                withSection ? { s: config.page.section } : {}
            ));
        };
    }

    function createToggle(el) {
        if (el.querySelector('.popup__toggle')) {
            new Toggles(el).init();
        }
    }

    function adjustMostPopHeight(el) {
        var adSlotHeight;
        var $adSlot = $(el);
        var $mostPopTabs = $('.js-most-popular-footer .tabs__pane');
        var mostPopTabsHeight;

        if ($adSlot.hasClass('ad-slot--mostpop')) {
            fastdom.read(function () {
                adSlotHeight = $adSlot.dim().height;
                mostPopTabsHeight = $mostPopTabs.dim().height;

                if (adSlotHeight > mostPopTabsHeight) {
                    fastdom.write(function () {
                        $mostPopTabs.css('height', adSlotHeight);
                    });
                }
            });
        }
    }

    function setFluid(el) {
        if (el.classList.contains('ad-slot--container-inline')) {
            el.classList.add('ad-slot--fluid');
        }
    }

    function constructQuery(params) {
        return reduce(params, function (result, value, key) {
            var buildParam = function (value) {
                return key + '=' + encodeURIComponent(value);
            };

            if (result !== '?') {
                result += '&';
            }

            return result + (isArray(value) ? map(value, buildParam).join('&') : buildParam(value));
        }, '?');
    }

    function buildComponentUrl(url, params) {
        // filter out empty params
        var filteredParams = pick(params, function (v) {
            return isArray(v) ? v.length : v;
        });
        var query = Object.keys(filteredParams).length ? constructQuery(filteredParams) : '';
        return config.page.ajaxUrl + '/commercial/' + url + '.json' + query;
    }

    function getKeywords() {
        var keywords = config.page.keywordIds ?
            map(config.page.keywordIds.split(','), getKeyword) :
            getKeyword(config.page.pageId);
        return {
            k: keywords
        };

        function getKeyword(str) {
            return str.substring(str.lastIndexOf('/') + 1);
        }
    }

    /**
     * Loads commercial components.
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10023207
     *
     * @constructor
     * @extends Component
     * @param {Object=} adSlot
     * @param {Object=} params
     */
    function CommercialComponent(adSlot, params) {
        this.params = params || {};
        this.type = this.params.type;
        // remove type from params
        this.params.type = null;
        this.adSlot = adSlot.length ? adSlot[0] : adSlot;
        this.url = urlBuilders[this.type](this.params);
    }

    CommercialComponent.prototype.create = function () {
        return new Promise(function (resolve) {
            if (this.url) {
                lazyload({
                    url: this.url,
                    container: this.adSlot,
                    success: onSuccess.bind(this),
                    error: onError.bind(this)
                });
            } else {
                resolve(false);
            }

            function onSuccess() {
                if (this.postLoadEvents[this.type]) {
                    this.postLoadEvents[this.type](this.adSlot);
                }

                resolve(true);
            }

            function onError() {
                resolve(false);
            }
        }.bind(this));
    };

    CommercialComponent.prototype.postLoadEvents = {
        capi: createToggle,
        capiSingle: createToggle,
        paidforCard: function (el) {
            setFluid(el);
            adjustMostPopHeight(el);
            createToggle(el);
        }
    };

    return CommercialComponent;
});
