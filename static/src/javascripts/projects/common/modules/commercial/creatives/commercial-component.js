/*
 Module: commercial/creatives/commercial-component.js
 Description: Loads our commercial components
 */
define([
    'fastdom',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/lazyload',
    'common/modules/ui/tabs',
    'common/modules/ui/toggles',
    'lodash/objects/isArray',
    'lodash/objects/pick',
    'lodash/objects/merge',
    'lodash/collections/map',
    'lodash/collections/reduce'
], function (
    fastdom,
    config,
    mediator,
    LazyLoad,
    Tabs,
    Toggles,
    isArray,
    pick,
    merge,
    map,
    reduce
) {

    function constructQuery(params) {
        return reduce(params, function (result, value, key) {
            var buildParam = function(value) {
                return key + '=' + encodeURIComponent(value);
            };

            if (result !== '?') {
                result += '&';
            }

            return result + isArray(value) ?
                map(value, buildParam).join('&') :
                buildParam(value);
        }, '?');
    }

    function buildComponentUrl(url, params) {
        // filter out empty params
        var filteredParams = pick(params, function (v) {
            return isArray(v) ? v.length : v;
        });
        var query = filteredParams.length ? constructQuery(filteredParams) : '';
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

    function defaultUrlBuilder(url) {
        return function (params) {
            return buildComponentUrl(url, params);
        }
    }

    function bookUrlBuilder(url) {
        return function (params, component) {
            return buildComponentUrl(url, merge({}, params, { t: config.page.isbn || component.params.isbn }));
        }
    }

    function soulmatesGroupUrlBuilder(url) {
        return function (params) {
            return buildComponentUrl(url + params.soulmatesFeedName, params);
        }
    }

    function complexUrlBuilder(url, withT, withKeywords) {
        return function (params) {
            return buildComponentUrl(url, merge(
                params,
                withT && params[withT] ? { t: params[withT].split(',') } : {},
                withKeywords ? getKeywords() : {}
            ));
        }
    }

    var urlBuilders = {
        bestbuy:        defaultUrlBuilder('money/bestbuys'),
        soulmates:      defaultUrlBuilder('soulmates/mixed'),
        soulmatesTest:  defaultUrlBuilder('soulmates-test/mixed'),
        capiSingle:     defaultUrlBuilder('capi-single'),
        capi:           defaultUrlBuilder('capi'),
        paidforCard:    defaultUrlBuilder('paid'),
        book:           bookUrlBuilder('books/book'),
        books:          complexUrlBuilder('books/books', 'isbns'),
        jobs:           complexUrlBuilder('jobs', 'jobIds', true),
        masterclasses:  complexUrlBuilder('masterclasses', 'ids', true),
        soulmatesGroup: soulmatesGroupUrlBuilder('soulmates/'),
        travel:         complexUrlBuilder('travel/offers', '', true),
        multi:          complexUrlBuilder('multi', '', true)
    };

    /**
     * Loads commercial components.
     * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10023207
     *
     * @constructor
     * @extends Component
     * @param (Object=) adSlot
     * @param {Object=} params
     */
    function CommercialComponent(adSlot, params) {
        this.params = params || {};
        this.type = this.params.type;
        // remove type from params
        this.params.type = null;
        this.adSlot = adSlot.length ? adSlot[0] : adSlot;
        this.url = urlBuilders[this.type](this.params, this);
    }

    function createToggle(el) {
        if (el.querySelector('.popup__toggle')) {
            new Toggles(el).init();
        }
    }

    function adjustMostPopHeight(el) {
        var height;
        var $adSlot = $(el);
        var $mostPopTabs = $('.js-most-popular-footer .tabs__pane');

        if ($adSlot.hasClass('ad-slot--mostpop')) {
            fastdom.read(function () {
                height = $adSlot.dim().height;
            });

            fastdom.write(function () {
                $mostPopTabs.css('height', height);
            });
        }
    }

    CommercialComponent.prototype.postLoadEvents = {
        bestbuy: function (el) {
            new Tabs().init(el);
        },
        capi: createToggle,
        capiSingle: createToggle,
        paidforCard: function (el) {
            adjustMostPopHeight(el);
            createToggle(el);
        }
    };

    CommercialComponent.prototype.create = function () {
        new LazyLoad({
            url: this.url,
            container: this.adSlot,
            success: function () {
                if (this.postLoadEvents[this.type]) {
                    this.postLoadEvents[this.type](this.adSlot);
                }

                mediator.emit('modules:commercial:creatives:commercial-component:loaded');
            }.bind(this),
            error: function () {
                fastdom.write(function {
                    this.adSlot.style.display = 'none';
                }, this);
            }.bind(this)
        }).load();

        return this;
    };

    return CommercialComponent;
});
