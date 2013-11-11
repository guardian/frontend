define([
    'common',
    'qwery',
    'bonzo',
    'bean',
    'modules/adverts/document-write',
    'modules/storage'
], function (
    common,
    qwery,
    bonzo,
    bean,
    documentWrite,
    storage
) {

    var Commercial = function(options) {
        this.options        = common.extend(this.DEFAULTS, options);
        this.keywords       = this.options.config.page.keywords.split(',');
        this.keywordsParams = documentWrite.getKeywords(this.options.config.page);
        this.userSegments   = 'seg=' + (storage.local.get('gu.history').length <= 1 ? 'new' : 'repeat');
    };


    Commercial.prototype.DEFAULTS = {
        context: document,
        elCls: 'commercial',
        smallAdWidth:  300,  // Up to, but excluding
        mediumAdWidth: 600,
        breakpoints: [300, 600] // Just testing this
    };

    Commercial.prototype.init = function() {
        var self = this;

        bean.on(window, 'resize', common.debounce(function() {
            self.applyClassnames();
        }, 250));

        common.mediator.on('modules:commercial:loaded', function() {
            self.applyClassnames();
        });

        this.applyClassnames();

        return this;
    };


    Commercial.prototype.applyClassnames = function() {
        var self = this,
            classname = this.options.elCls;

        common.$g('.' + classname, this.options.context).each(function() {
            var $node = bonzo(this),
                width = $node.dim().width;

            // Predefined breakpoint names
            $node.removeClass(classname + '--small ' + classname + '--medium');

            if (width > self.options.smallAdWidth) {
                $node.addClass(classname + '--medium');
            } else {
                $node.addClass(classname + '--small');
            }


            // Specific width classnames
            $node[0].className = $node[0].className.replace(/(commercial--w\d{1,3})\s?/g, '');

            var matchedWidth = 0;
            self.options.breakpoints.forEach(function(breakpointWidth) {
                if (width >= breakpointWidth) {
                    matchedWidth = breakpointWidth;
                }
            });

            if (matchedWidth > 0) {
                $node.addClass(classname + '--w' + matchedWidth);
            }

            $node.attr('data-width', width);
        });

    };

    return Commercial;
});
