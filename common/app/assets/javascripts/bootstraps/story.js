/* global: Swipe */

define([
    "common",
    "bean",
    "ajax",

    "modules/expandable",
    "modules/story/continue-reading",
    "modules/autoupdate",
    "modules/tabs",
    
    "swipe"
], function(
    common,
    bean,
    ajax,

    Expandable,
    ContinueReading,
    AutoUpdate,
    Tabs
) {

    var modules = {
        
        initLiveBlogging: function() {
            common.mediator.on('page:story:ready', function(config, context) {
                if (context.querySelector('#live .update')) {
                    var a = new AutoUpdate({
                        path: context.querySelector('#live').getAttribute('data-source'),
                        delay: 60000,
                        attachTo: context.querySelector(".story-live"),
                        switches: config.switches,
                        loadOnInitialise: true
                    }).init();
                }
            });
        },
        
        initTimeline: function() {
            common.mediator.on('page:story:ready', function(config, context) {
                var $ = common.$g,
                    timeline = context.querySelector('.timeline'),
                    hidden = true,
                    text = {
                        show: 'View more',
                        hide: 'View less'
                    };

                if(timeline) {
                    bean.on(timeline, 'click', '.js-more', function(e) {
                        var block = $(this).parent(),
                            linkText = text[hidden ? 'hide' : 'show'];

                        $('.chapter__articles', block).toggleClass('h');
                        $(block[0]).toggleClass('is-open');
                        $('.cta-new__text', block).text(linkText);
                        $('.cta-new', block).attr('data-link-name', linkText);
                        hidden = !hidden;
                    });
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
                        var hasContactSheet = document.querySelector('.story-pictures') && common.$g('figure', '.story-pictures').length;
                        common.$g('#container').css('overflow', 'hidden');

                        if(hasContactSheet) {
                            common.$g('.story-pictures').removeClass('h');
                        }

                        Array.prototype.forEach.call(swipeContainers, function(el){

                            var numOfPictures = el.querySelectorAll('figure').length,
                                hasPictureSheet = el.querySelector('.story-picture--sheet'),
                                swipeCallback = function(index, elem) {
                                    var controls = elem.parentNode.parentNode.parentNode.querySelector('.js-swipe__controls'),
                                    text = common.$g('.cta-new__text', controls),
                                    button = common.$g('.cta-new__btn--left', controls),
                                    centreClass = 'cta-new__text--center';
    
                                    if(hasContactSheet && index === 0) {
                                        button.addClass('h');
                                        text.removeClass(centreClass).text('View complete gallery');
                                    } else {
                                       button.removeClass('h');
                                       // if there's a contact sheet, don't include it in the count
                                       index = (hasPictureSheet) ? index : index + 1;
                                       text.addClass(centreClass).text(index + '/' + numOfPictures);
                                    }
                                },
                                mySwipe = new Swipe(el, {
                                     speed: 100,
                                     continuous: true,
                                     disableScroll: false,
                                     stopPropagation: true,
                                     callback: swipeCallback,
                                     transitionEnd: function(index, elem) {}
                                });

                            bean.on(el.parentNode, 'click', '.cta-new__btn--left', mySwipe.prev);
                            bean.on(el.parentNode, 'click', '.cta-new__btn--right', mySwipe.next);

                            if(hasContactSheet) { common.$g(el.querySelector('.cta-new__btn--left')).addClass('h'); }

                            common.$g('.js-swipe__controls', el.parentNode).removeClass('h');
                            
                            // init gallery (for text)
                            swipeCallback(0, el.querySelector('figure'));
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
        },
            
        initTabs: function () {
            var tabs = new Tabs();
            common.mediator.on('page:story:ready', function(config, context) {
                tabs.init(context);
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
            modules.initLiveBlogging();
            modules.initTabs();
        }
        common.mediator.emit("page:story:ready", config, context);
    };

    return {
        init: ready
    };

});
