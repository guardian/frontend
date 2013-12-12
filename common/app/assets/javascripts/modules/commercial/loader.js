/*
    Module: commercial/loader.js
    Description: Loads our commercial components
*/
define([
    '$',
    'utils/mediator',
    'utils/storage',
    'modules/lazyload',
    'modules/component'
], function (
    $,
    mediator,
    storage,
    LazyLoad,
    Component
) {

    /**
     * Loads commercial components.
     * 
     * ```
     *  require('modules/commercial/loader', function (CommercialComponent) {
     *   CommercialComponent.masterclasses().load();
     *  }
     * ```
     *
     * @constructor
     * @extends Component
     * @param {Element=} context
     * @param {Object=} options
     */
    var Loader = function(context, options) {
        this.keywords       = options.config.page.keywords;
        this.section        = options.config.page.section;
        this.oastoken       = options.oastoken || '';
        this.userSegments   = 'seg=' + (storage.local.get('gu.history').length <= 1 ? 'new' : 'repeat');
        this.host           = options.config.page.ajaxUrl + '/commercial/';
        this.breakPoints    = [300, 400, 500, 600];
        this.className      = 'commercial';
        this.context        = context || document;
        this.components     = {
          masterclasses: this.host + 'masterclasses.json?' + this.userSegments + '&' + this.section,
          travel:        this.host + 'travel/offers.json?' + this.userSegments + '&' + this.section + '&' + this.getKeywords(),
          jobs:          this.host + 'jobs.json?' + this.userSegments + '&' + this.section + '&' + this.getKeywords(),
          soulmates:     this.host + 'soulmates/mixed.json?' + this.userSegments + '&' + this.section
        };
        return this;
    };

    Component.define(Loader);

    Loader.prototype.getKeywords = function() {
        return this.keywords.split(',').map(function(keyword){
           return 'k=' + encodeURIComponent(keyword.replace(/\s/g, "-").toLowerCase());
        }).join('&');
    };

    /**
     * @param {Element}  target
     */
    Loader.prototype.load = function(component, target) {
        var url = this.components[component];
        new LazyLoad({
            url: url,
            container: target,
            beforeInsert: function (html) {
                return html.replace(/%OASToken%/g, this.oastoken)
            },
            error: function (req) {
                mediator.emit('module:error', 'Failed to load related: ' + req.statusText, 'modules/commercial/loader.js');
            }
        }).load();
        return this;
    };
   
    return Loader;
});
