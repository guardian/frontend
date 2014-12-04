/*
 Module: commercial/creatives/commercial-component.js
 Description: Loads our commercial components
 */
define([
    'bean',
    'bonzo',
    'raven',
    'lodash/collections/map',
    'lodash/collections/size',
    'lodash/objects/defaults',
    'lodash/objects/isArray',
    'lodash/objects/merge',
    'lodash/objects/pick',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/component',
    'common/modules/lazyload',
    'common/modules/ui/tabs'
], function (
    bean,
    bonzo,
    raven,
    map,
    size,
    defaults,
    isArray,
    merge,
    pick,
    $,
    _,
    config,
    mediator,
    Component,
    LazyLoad,
    Tabs
) {

    var constructQuery = function (params) {
            return _(params)
                .pairs()
                .map(function (param) {
                    var key    = param[0],
                        values = isArray(param[1]) ? param[1] : [param[1]];
                    return map(values, function (value) {
                        return [key, '=', encodeURIComponent(value)].join('');
                    }).join('&');
                }).join('&');
        },
        getKeywords = function () {
            var keywords = (config.page.keywordIds) ?
                map(config.page.keywordIds.split(','), function (keywordId) {
                    return keywordId.split('/').pop();
                }) :
                config.page.pageId.split('/').pop();
            return {
                k: keywords
            };
        },
        buildComponentUrl = function (url, params) {
            // filter out empty params
            var filteredParams = pick(defaults(params || {}, getKeywords()), function (v) {
                    return isArray(v) ? v.length : v;
                }),
                query = size(filteredParams) ? '?' + constructQuery(filteredParams) : '';
            return [config.page.ajaxUrl, '/commercial/', url, '.json', query].join('');
        },
        /**
         * Loads commercial components.
         *         * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10023207
         *
         * @constructor
         * @extends Component
         * @param (Object=) $adSlot
         * @param {Object=} params
         */
        CommercialComponent = function ($adSlot, params) {
            var urlParams = merge(params, { s: config.page.section });

            this.params = params;
            this.$adSlot = $adSlot;
            this.type = params.type;
            this.components = {
                bestbuy:           buildComponentUrl('money/bestbuys', urlParams),
                bestbuyHigh:       buildComponentUrl('money/bestbuys-high', urlParams),
                book:              buildComponentUrl('books/book', merge(urlParams, { t: config.page.isbn || params.isbn })),
                books:             buildComponentUrl('books/bestsellers', urlParams),
                booksMedium:       buildComponentUrl('books/bestsellers-medium', urlParams),
                booksHigh:         buildComponentUrl('books/bestsellers-high', urlParams),
                jobs:              buildComponentUrl('jobs', merge(urlParams, { t: params.jobIds ? params.jobIds.split(',') : [] })),
                jobsHigh:          buildComponentUrl('jobs-high', urlParams),
                masterclasses:     buildComponentUrl('masterclasses', urlParams),
                masterclassesHigh: buildComponentUrl('masterclasses-high', urlParams),
                soulmates:         buildComponentUrl('soulmates/mixed', urlParams),
                soulmatesHigh:     buildComponentUrl('soulmates/mixed-high', urlParams),
                travel:            buildComponentUrl('travel/offers', urlParams),
                travelHigh:        buildComponentUrl('travel/offers-high', urlParams),
                multi:             buildComponentUrl('multi', urlParams),
                capiSingle:        buildComponentUrl('capi-single', urlParams),
                capi:              buildComponentUrl('capi', urlParams)
            };
        };

    CommercialComponent.prototype.postLoadEvents = {
        bestbuy: function (el) {
            new Tabs().init(el);
        }
    };

    CommercialComponent.prototype.load = function () {
        new LazyLoad({
            url: this.components[this.type],
            container: this.$adSlot,
            beforeInsert: function (html) {
                // Currently we are replacing the OmnitureToken with nothing. This will change once
                // commercial components have properly been setup in the lovely mess that is Omniture!
                return html ? html.replace(/%OASToken%/g, this.params.clickMacro).replace(/%OmnitureToken%/g, '') : html;
            }.bind(this),
            success: function () {
                this.postLoadEvents[this.type] && this.postLoadEvents[this.type](this.$adSlot);

                mediator.emit('modules:commercial:creatives:commercial-component:loaded');
            }.bind(this)
        }).load();

        return this;
    };

    CommercialComponent.prototype.create = function () {
        if (this.components[this.type] === undefined) {
            raven.captureMessage('Unknown commercial component: ' + name);
            return false;
        }

        return this.load();
    };

    return CommercialComponent;
});
