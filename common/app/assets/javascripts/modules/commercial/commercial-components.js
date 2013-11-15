define([
    '$',
    'utils/mediator',
    'lodash/objects/assign',
    'lodash/functions/debounce',
    'qwery',
    'bonzo',
    'bean',
    'modules/adverts/document-write',
    'modules/storage'
], function (
    $,
    mediator,
    extend,
    debounce,
    qwery,
    bonzo,
    bean,
    documentWrite,
    storage
) {

    var Commercial = function(options) {
        this.options        = extend(this.DEFAULTS, options);
        this.keywords       = this.options.config.page.keywords.split(',');
        this.keywordsParams = documentWrite.getKeywords(this.options.config.page);
        this.userSegments   = 'seg=' + (storage.local.get('gu.history').length <= 1 ? 'new' : 'repeat');
    };


    Commercial.prototype.DEFAULTS = {
        context:     document,
        className:   'commercial',
        breakpoints: [300, 400, 500, 600]
    };

    Commercial.prototype.init = function() {
        var self = this;

        bean.on(window, 'resize', debounce(function() {
            self.applyBreakpointClassnames();
        }, 250));

        mediator.on('modules:commercial:loaded', function() {
            self.applyBreakpointClassnames();
        });

        this.applyBreakpointClassnames();

        return this;
    };


    Commercial.prototype.applyBreakpointClassnames = function() {
        var self = this,
            $nodes = bonzo(document.getElementsByClassName(this.options.className)),
            regex = new RegExp('('+self.options.className+'--w\\d{1,3})', 'g');

        $nodes.each(function(el) {
            var width = el.offsetWidth;
            el.className = el.className.replace(regex, '');
            self.options.breakpoints.forEach(function(breakpointWidth) {
                if (width >= breakpointWidth) {
                    bonzo(el).addClass(self.options.className+'--w' + breakpointWidth);
                }
            });

            el.setAttribute('data-width', width);
        });
    };

    return Commercial;
});
