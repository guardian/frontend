define([
    'qwery',
    'common/$',
    'bean',
    'bonzo'
], function (
    qwery,
    $,
    bean,
    bonzo
) {
    var NewNavigation = {
        init: function(){
            // toggle mega nav
            qwery('.js-new-navigation-toggle').forEach(function(elem) {
                bean.on(elem, 'click touchstart', function (e) {
                    e.preventDefault();
                    if ($('.new-navigation--expanded').length > 0) {
                        $('.new-navigation').removeClass('new-navigation--expanded')
                                            .addClass('new-navigation--collapsed');
                    } else {
                        $('.new-navigation').addClass('new-navigation--expanded')
                                            .removeClass('new-navigation--collapsed');
                    }
                });
            });
            NewNavigation.initAccordion();
        },

        initAccordion: function(){
            function accordionToggle(){
                bean.on(qwery('.new-navigation')[0], 'click touchstart', '.global-navigation__toggle-children', function (e) {
                    var elem = e.currentTarget;
                    e.preventDefault();

                    var expandLink = bonzo(elem);
                    var subLinksContainer = bonzo(qwery('.global-navigation__children', expandLink.parent()[0])[0]);

                    if (subLinksContainer.hasClass('global-navigation__children--collapsed')) {
                        subLinksContainer
                            .removeClass('global-navigation__children--collapsed')
                            .addClass('global-navigation__children--expanded');
                        expandLink.html('less');
                    } else {
                        subLinksContainer
                            .removeClass('global-navigation__children--expanded')
                            .addClass('global-navigation__children--collapsed');
                        expandLink.html('more');
                    }
                });
            }
            function accordionAddLinks(){
                if(qwery('.js-accordion').length > 0){
                    $('.js-accordion .global-navigation__section .global-navigation__children')
                        .addClass('global-navigation__children--collapsed');

                    qwery('.js-accordion .global-navigation__section').forEach(function(elem){
                        if(qwery('.global-navigation__child', elem).length > 0){
                            bonzo(elem).prepend('<a href="javascript://" class="global-navigation__toggle-children">more</a>');
                        }
                    });
                    accordionToggle();
                }
            }
            accordionAddLinks();
        }
    };

    return NewNavigation;
});
