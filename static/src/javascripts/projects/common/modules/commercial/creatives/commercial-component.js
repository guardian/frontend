/*
 Module: commercial/creatives/commercial-component.js
 Description: Loads our commercial components
 */
define([
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/fastdom-promise',
    'common/modules/lazyload',
    'common/modules/ui/tabs',
    'lodash/objects/isArray',
    'lodash/collections/map',
    'lodash/objects/pick',
    'lodash/objects/merge',
    'lodash/collections/reduce'
], function (
    config,
    mediator,
    fastdom,
    LazyLoad,
    Tabs,
    isArray,
    map,
    pick,
    merge,
    reduce
) {

    function constructQuery(params) {
        return reduce(params, function (result, value, key) {
            function buildParam(value) {
                return key + '=' + encodeURIComponent(value);
            }

            if (result.length) {
                result += '&';
            }

            return result + isArray(value) ?
                map(value, buildParam).join('&') :
                buildParam(value);
        }, '?');
    }

    function buildComponentUrl(url, params) {
        var query = '';
        if (params) {
            // filter out empty params
            var filteredParams = pick(params, function (v) {
                return isArray(v) ? v.length : v;
            });
            if (filteredParams.length) {
                query = constructQuery(filteredParams);
            }
        }
        return [config.page.ajaxUrl, '/commercial/', url, '.json', query].join('');
    }

    function getKeyword(str) {
        return str.substring(str.lastIndexOf('/') + 1);
    }

    function getKeywords() {
        var keywords = config.page.keywordIds ?
            map(config.page.keywordIds.split(','), getKeyword) :
            getKeyword(config.page.pageId);
        return {
            k: keywords
        };
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

    function booksUrlBuilder(url) {
        return function (params) {
            return buildComponentUrl(url, merge({}, params, { t: params.isbns ? params.isbns.split(',') : [] }));
        }
    }

    function jobsUrlBuilder(url) {
        return function (params) {
            return buildComponentUrl(url, merge({}, params, { t: params.jobIds ? params.jobIds.split(',') : [] }, getKeywords()));
        }
    }

    function masterclassesUrlBuilder(url) {
        return function (params) {
            return buildComponentUrl(url, merge({}, params, { t: params.ids ? params.ids.split(',') : [] }, getKeywords()));
        }
    }

    function soulmatesGroupUrlBuilder(url) {
        return function (params) {
            return buildComponentUrl(url + params.soulmatesFeedName, params);
        }
    }

    function keywordsUrlBuilder(url) {
        return function (params) {
            return buildComponentUrl(url, merge({}, params, getKeywords()));
        }
    }

    var urlBuilders = {
        bestbuy:        defaultUrlBuilder('money/bestbuys'),
        soulmates:      defaultUrlBuilder('soulmates/mixed'),
        soulmatesTest:  defaultUrlBuilder('soulmates-test/mixed'),
        capiSingle:     defaultUrlBuilder('capi-single'),
        capi:           defaultUrlBuilder('capi'),
        book:           bookUrlBuilder('books/book'),
        books:          booksUrlBuilder('books/books'),
        jobs:           jobsUrlBuilder('jobs'),
        masterclasses:  masterclassesUrlBuilder('masterclasses'),
        soulmatesGroup: soulmatesGroupUrlBuilder('soulmates/'),
        travel:         keywordsUrlBuilder('travel/offers'),
        multi:          keywordsUrlBuilder('multi')
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
        this.type   = this.params.type;
        // remove type from params
        this.params.type = null;
        this.adSlot    = adSlot;
        this.url = urlBuilders[this.type](this.params, this);
    }

    CommercialComponent.prototype.postLoadEvents = {
        bestbuy: function (el) {
            new Tabs().init(el);
        }
    };

    CommercialComponent.prototype.create = function () {
        new LazyLoad({
            url: this.url,
            container: this.adSlot,
            beforeInsert: function (html) {
                // Currently we are replacing the OmnitureToken with nothing. This will change once
                // commercial components have properly been setup in the lovely mess that is Omniture!
                return html ? html.replace('%OASToken%', this.params.clickMacro).replace('%OmnitureToken%', '') : html;
            }.bind(this),
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
