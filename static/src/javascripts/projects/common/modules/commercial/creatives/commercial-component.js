/*
 Module: commercial/creatives/commercial-component.js
 Description: Loads our commercial components
 */
define([
    'bean',
    'bonzo',
    'raven',
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/lazyload',
    'common/modules/ui/tabs'
], function (
    bean,
    bonzo,
    raven,
    $,
    _,
    config,
    mediator,
    LazyLoad,
    Tabs
) {

    var constructQuery = function (params) {
            return _(params)
                .pairs()
                .map(function (param) {
                    var key    = param[0],
                        values = _.isArray(param[1]) ? param[1] : [param[1]];
                    return _.map(values, function (value) {
                        return [key, '=', encodeURIComponent(value)].join('');
                    }).join('&');
                }).join('&');
        },
        getKeywords = function () {
            var keywords = (config.page.keywordIds) ?
                _.map(config.page.keywordIds.split(','), function (keywordId) {
                    return keywordId.split('/').pop();
                }) :
                config.page.pageId.split('/').pop();
            return {
                k: keywords
            };
        },
        buildComponentUrl = function (url, params) {
            // filter out empty params
            var filteredParams = _.pick(params || {}, function (v) {
                    return _.isArray(v) ? v.length : v;
                }),
                query = _.size(filteredParams) ? '?' + constructQuery(filteredParams) : '';
            return [config.page.ajaxUrl, '/commercial/', url, '.json', query].join('');
        },
        /**
         * Loads commercial components.
         * * https://www.google.com/dfp/59666047#delivery/CreateCreativeTemplate/creativeTemplateId=10023207
         *
         * @constructor
         * @extends Component
         * @param (Object=) $adSlot
         * @param {Object=} params
         */
        CommercialComponent = function ($adSlot, params) {
            this.params = params || {};
            this.type   = this.params.type;
            // remove type from params
            delete this.params.type;
            this.$adSlot    = $adSlot;
            this.components = {
                bestbuy:        buildComponentUrl('money/bestbuys', this.params),
                book:           buildComponentUrl('books/book', _.merge({}, this.params, { t: config.page.isbn || this.params.isbn })),
                books:          buildComponentUrl('books/books', _.merge({}, this.params, { t: this.params.isbns ? this.params.isbns.split(',') : [] })),
                jobs:           buildComponentUrl('jobs', _.merge({}, this.params, { t: this.params.jobIds ? this.params.jobIds.split(',') : [] }, getKeywords())),
                masterclasses:  buildComponentUrl('masterclasses', _.merge({}, this.params, { t: this.params.ids ? this.params.ids.split(',') : [] }, getKeywords())),
                soulmates:      buildComponentUrl('soulmates/mixed', this.params),
                soulmatesGroup: buildComponentUrl('soulmates/' + this.params.soulmatesFeedName, this.params),
                travel:         buildComponentUrl('travel/offers', _.merge({}, this.params, getKeywords())),
                multi:          buildComponentUrl('multi', _.merge({}, this.params, getKeywords())),
                capiSingle:     buildComponentUrl('capi-single', _.merge({}, this.params, getKeywords())),
                capi:           buildComponentUrl('capi', this.params)
            };
        };

    CommercialComponent.prototype.postLoadEvents = {
        bestbuy: function (el) {
            new Tabs().init(el);
        }
    };

    CommercialComponent.prototype.create = function () {
        new LazyLoad({
            url: this.components[this.type],
            container: this.$adSlot,
            beforeInsert: function (html) {
                // Currently we are replacing the OmnitureToken with nothing. This will change once
                // commercial components have properly been setup in the lovely mess that is Omniture!
                return html ? html.replace(/%OASToken%/g, this.params.clickMacro).replace(/%OmnitureToken%/g, '') : html;
            }.bind(this),
            success: function () {
                if (this.postLoadEvents[this.type]) {
                    this.postLoadEvents[this.type](this.$adSlot);
                }

                mediator.emit('modules:commercial:creatives:commercial-component:loaded');
            }.bind(this),
            error: function () {
                this.$adSlot.hide();
            }.bind(this)
        }).load();

        return this;
    };

    return CommercialComponent;
});
