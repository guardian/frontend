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
            var section = config.page.section,
                jobs    = params.jobIds ? params.jobIds.split(',') : [];

            this.params = params;
            this.$adSlot = $adSlot;
            this.type = params.type;
            this.components = {
                bestbuy:           buildComponentUrl('money/bestbuys'),
                bestbuyHigh:       buildComponentUrl('money/bestbuys-high'),
                book:              buildComponentUrl('books/book', { t: config.page.isbn }),
                books:             buildComponentUrl('books/bestsellers'),
                booksMedium:       buildComponentUrl('books/bestsellers-medium'),
                booksHigh:         buildComponentUrl('books/bestsellers-high'),
                jobs:              buildComponentUrl('jobs', { t: jobs }),
                jobsHigh:          buildComponentUrl('jobs-high'),
                masterclasses:     buildComponentUrl('masterclasses'),
                masterclassesHigh: buildComponentUrl('masterclasses-high'),
                soulmates:         buildComponentUrl('soulmates/mixed'),
                soulmatesHigh:     buildComponentUrl('soulmates/mixed-high'),
                travel:            buildComponentUrl('travel/offers', { s: section }),
                travelHigh:        buildComponentUrl('travel/offers-high', { s: section }),
                multi:             buildComponentUrl('multi', { c: params.components }),
                capiSingle:        buildComponentUrl('capi-single', defaults(params, { s: section })),
                capiSingleMerch:   buildComponentUrl('capi-single-merch', defaults(params, { s: section })),
                capi:              buildComponentUrl('capi', defaults(params, { s: section }))
            };
        };

    CommercialComponent.prototype.postLoadEvents = {
        bestbuy: function (el) {
            new Tabs().init(el);
        }
    };

    /**
     * @param {Element} target
     */
    CommercialComponent.prototype.load = function () {
        new LazyLoad({
            url: this.components[this.type],
            container: this.$adSlot,
            success: function () {
                this.postLoadEvents[this.type] && this.postLoadEvents[this.type](this.$adSlot);

                mediator.emit('modules:commercial:creatives:commercial-component:loaded');
            }.bind(this)
        }).load();

        return this;
    };

    /**
     * @param {String}  name
     * @param {Element} el
     */
    CommercialComponent.prototype.create = function () {
        if (this.components[this.type] === undefined) {
            raven.captureMessage('Unknown commercial component: ' + name);
            return false;
        }

        return this.load();
    };

    return CommercialComponent;
});
