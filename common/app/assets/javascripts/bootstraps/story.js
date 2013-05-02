/* global: Swipe */

define([
    "common",
    "bean",
    "ajax",

    "modules/expandable",
    "modules/story/continue-reading",
    
    "swipe"
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
                    eventType = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click',
                    hidden = true,
                    text = {
                        show: 'View more',
                        hide: 'View less'
                    };

                if(timeline) {
                    bean.on(timeline, eventType, '.js-more', function(e) {
                        var block = $(this).parent(),
                            linkText = text[hidden ? 'hide' : 'show'];

                        $('.chapter__articles', block).toggleClass('h');
                        $(block[0]).toggleClass('is-open');
                        $('.cta-new__text', block).text(linkText);
                        $('.cta-new', block).attr('data-link-name', linkText);
                        hidden = !hidden;
                    });

                    //Open first block by default
                    //bean.fire(timeline.querySelector('.event__title'), 'click');
                }
            });
        },

        initAgents: function() {
            common.mediator.on('page:story:ready', function(config, context) {
                var eventType = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click',
                    agents = context.querySelector('.story-agents');

                if(agents) {
                    common.$g('.agent-body', agents).addClass('h');
                    common.$g('button', agents).removeClass('h');

                    common.$g('.agent-body', agents).first().removeClass('h');
                    common.$g('i', agents).first().toggleClass('is-open');

                    bean.on(agents, eventType, 'button', function() {
                        var agent = this.parentNode;
                        common.$g('.agent-body', agent).toggleClass('h');
                        common.$g('i', agent).toggleClass('is-open');
                    });
                }
            });
        },

        initExpandables: function() {
            common.mediator.on('page:story:ready', function(config, context) {
                Array.prototype.forEach.call(context.querySelectorAll('.expandable'), function(el){
                    var e = new Expandable({dom: el, expanded: false}).init();
                });
            });
        },

        initSwipe: function() {
            common.mediator.on('page:story:ready', function(config, context) {
                var swipeContainers = context.querySelectorAll('.js-swipe__items');

                if(swipeContainers) {
                    var swipeLib = ['js!swipe'];

                    require(swipeLib, function() {

                        common.$g('#container').css('overflow', 'hidden');
                        if(common.$g('figure', '.story-pictures').length) {
                            common.$g('.story-pictures').removeClass('h');
                        }

                        Array.prototype.forEach.call(swipeContainers, function(el){

                            var numOfPictures = el.querySelectorAll('figure').length,
                                mySwipe = new Swipe(el, {
                                 speed: 100,
                                 continuous: true,
                                 disableScroll: false,
                                 stopPropagation: true,
                                 callback: function(index, elem) {
                                     common.$g('.cta-new__text', el).text(index+1 + '/' + numOfPictures);
                                 },
                                 transitionEnd: function(index, elem) {}
                            });

                            var controls = common.$g(el).next()[0];

                            bean.on(controls.querySelector('.cta-new__btn--left'), 'click', function() {
                                mySwipe.prev();
                            });

                            bean.on(controls.querySelector('.cta-new__btn--right'), 'click', function() {
                                mySwipe.next();
                            });

                            common.$g('.cta-new__text--center', controls).text('1/' + numOfPictures);
                            common.$g(controls).removeClass('h');
                        });
                    });
                }
            });
        },

        initContinueReading: function() {
            common.mediator.on('page:story:ready', function(config, context) {
                Array.prototype.forEach.call(context.querySelectorAll('.js-continue'), function(el){
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
            modules.initSwipe();
        }
        common.mediator.emit("page:story:ready", config, context);
    };

    return {
        init: ready
    };

});
