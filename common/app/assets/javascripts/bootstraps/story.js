define([
    "common",
    "bean",
    "ajax",

    "modules/expandable",
    "modules/story/continue-reading"
], function(
    common,
    bean,
    ajax,

    Expandable,
    ContinueReading
) {

    var modules = {
        initTimeline: function() {
            common.mediator.on('page:story:ready', function(config, context) {
                var $ = common.$g,
                    timeline = context.querySelector('.timeline'),
                    eventType = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';

                if(timeline) {
                    $('.event-children', timeline).addClass('h');
                    bean.on(timeline, eventType, '.event-title', function(e) {
                        var block = $(this).parent();
                        $('.event-summary', block).toggleClass('h');
                        $('.event-children', block).toggleClass('h');
                        $('i', block).toggleClass('is-open');
                    });
                }
            });
        },

        initAgents: function() {
            common.mediator.on('page:story:ready', function(config, context) {
                var eventType = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click',
                    agents = context.querySelector('.story-agents');

                common.$g('.agent-body', agents).addClass('h');
                common.$g('button', agents).removeClass('h');

                common.$g('.agent-body', agents).first().removeClass('h');
                common.$g('i', agents).first().toggleClass('is-open');

                bean.on(agents, eventType, 'button', function() {
                    var agent = this.parentNode;
                    common.$g('.agent-body', agent).toggleClass('h');
                    common.$g('i', agent).toggleClass('is-open');
                });
            });
        },

        initExpandables: function() {
            common.mediator.on('page:story:ready', function(config, context) {
                Array.prototype.forEach.call(context.querySelectorAll('.expandable'), function(el){
                    var e = new Expandable({dom: el, expanded: false}).init();
                });
            });
        },

        initContinueReading: function() {
            common.mediator.on('page:story:ready', function(config, context) {
                Array.prototype.forEach.call(context.querySelectorAll('a.continue'), function(el){
                    new ContinueReading(el).init();
                });
            });
        }
    };

    var ready = function(config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.initTimeline();
            modules.initAgents();
            modules.initExpandables();
            modules.initContinueReading();
        }
        common.mediator.emit("page:story:ready", config, context);
    };

    return {
        init: ready
    };

});
