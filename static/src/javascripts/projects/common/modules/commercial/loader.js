/*
    Module: commercial/loader.js
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
         *
         * BEWARE that this code is depended upon by the ad server.
         *
         * ```
         * require(['common/modules/commercial/loader'], function (CommercialComponent) {
         *     var slot = document.querySelector('[data-base="SLOT_NAME"]');
         *     var c = new CommercialComponent({config: guardian, oastoken: '%%C%%?'}).init('COMPONENT_NAME', slot);
         * })
         * ```
         *
         * @constructor
         * @extends Component
         * @param {Object=} options
         */
        Loader = function (options) {
            var opts = defaults(options || {}, {
                    capi:             [],
                    capiAboutLinkUrl: '',
                    capiKeywords:     '',
                    capiLinkUrl:      '',
                    capiTitle:        '',
                    components:       [],
                    jobIds:           '',
                    logo:             '',
                    oastoken:         ''
                }),
                section = config.page.section,
                jobs    = opts.jobIds ? opts.jobIds.split(',') : [];

            this.oastoken   = opts.oastoken;
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
                multi:             buildComponentUrl('multi', { c: opts.components }),
                capiSingle:        buildComponentUrl('capi-single', defaults(options, { s: section })),
                capiSingleMerch:   buildComponentUrl('capi-single-merch', defaults(options, { s: section })),
                capi:              buildComponentUrl('capi', defaults(options, {
                    s:   section,
                    t:   opts.capi,
                    k:   opts.capiKeywords.split(','),
                    l:   opts.logo,
                    ct:  opts.capiTitle,
                    cl:  opts.capiLinkUrl,
                    cal: opts.capiAboutLinkUrl
                }))
            };
        };

    Component.define(Loader);

    Loader.prototype.postLoadEvents = {
        bestbuy: function (el) {
            new Tabs().init(el);
        }
    };

    /**
     * @param {Element} target
     */
    Loader.prototype.load = function (name, target) {
        new LazyLoad({
            url: this.components[name],
            container: target,
            beforeInsert: function (html) {
                // Currently we are replacing the OmnitureToken with nothing. This will change once
                // commercial components have properly been setup in the lovely mess that is Omniture!
                return html ? html.replace(/%OASToken%/g, this.oastoken).replace(/%OmnitureToken%/g, '') : html;
            }.bind(this),
            success: function () {
                this.postLoadEvents[name] && this.postLoadEvents[name](target);

                mediator.emit('modules:commercial:loader:loaded');
            }.bind(this)
        }).load();

        return this;
    };

    /**
     * @param {String}  name
     * @param {Element} el
     */
    Loader.prototype.init = function (name, el) {

        if (this.components[name] === undefined) {
            raven.captureMessage('Unknown commercial component: ' + name);
            return false;
        }

        return this.load(name, el);
    };

    return Loader;
});
