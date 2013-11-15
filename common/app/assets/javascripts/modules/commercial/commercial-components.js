define([
    '$',
    'utils/mediator',
    'lodash/objects/assign',
    'qwery',
    'bonzo',
    'bean',
    'modules/adverts/document-write',
    'modules/storage'
], function (
    $,
    mediator,
    extend,
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
        context: document,
        elCls: 'commercial',
        smallAdWidth:  300,  // Up to, but excluding
        mediumAdWidth: 600
    };

    Commercial.prototype.init = function() {
        var self = this;

        mediator.addListener('window:resize', function() {
            self.applyClassnames();
        });

        mediator.on('modules:commercial:loaded', function() {
            self.applyClassnames();
        });

        this.applyClassnames();

        return this;
    };


    Commercial.prototype.applyClassnames = function() {
        var self = this,
            classname = this.options.elCls;

        $('.' + classname, this.options.context).each(function() {
            var $node = bonzo(this),
                width = $node.dim().width;

            $node.removeClass(classname + '--small ' + classname + '--medium');

            if (width > self.options.smallAdWidth) {
                $node.addClass(classname + '--medium');
            } else {
                $node.addClass(classname + '--small');
            }

            $node.attr('data-width', width);
        });

    };

    return Commercial;
});
