define([
    'common/utils/storage',
    'qwery',
    'common/$',
    'bean',
    'bonzo'
], function (
    store,
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
                var storageKey = 'gu.prototypes.expandedMenuItems';
                var navContainer = qwery('.new-navigation')[0];
                var toggleButtons = qwery('.global-navigation__toggle-children', navContainer);

                function toggleSubLinks(button){
                    var expandBtn = bonzo(button);
                    var subLinksContainer = bonzo(qwery('.global-navigation__children', expandBtn.parent()[0])[0]);

                    if (subLinksContainer.hasClass('global-navigation__children--collapsed')) {
                        subLinksContainer
                            .removeClass('global-navigation__children--collapsed')
                            .addClass('global-navigation__children--expanded');
                        expandBtn.html('less');
                        saveSelection(button, true);
                    } else {
                        subLinksContainer
                            .removeClass('global-navigation__children--expanded')
                            .addClass('global-navigation__children--collapsed');
                        expandBtn.html('more');
                        saveSelection(button, false);
                    }
                }

                function expandFromPreviousSession(toggleButtons){
                    var expandedItems = store.local.get(storageKey) || [];
                    expandedItems.forEach(function(idx){
                        toggleSubLinks(toggleButtons[idx]);
                    });
                }
                
                function saveSelection(expandBtn, isExpanded){
                    var expandedItems = store.local.get(storageKey) || [];
                    var btnIdx = toggleButtons.indexOf(expandBtn);

                    var storedIdx = expandedItems.indexOf(btnIdx);
                    if(isExpanded){
                        if (storedIdx === -1) {
                            // add to storage
                            expandedItems.push(btnIdx);
                            store.local.set(storageKey, expandedItems);
                        }
                    }
                    else {
                        // remove from storage
                        if (storedIdx > -1) {
                            expandedItems.splice(storedIdx, 1);
                            store.local.set(storageKey, expandedItems);
                        }
                    }
                }
                
                expandFromPreviousSession(toggleButtons);//

                bean.on(navContainer, 'click touchstart', '.global-navigation__toggle-children', function (e) {
                    var elem = e.currentTarget;
                    e.preventDefault();
                    toggleSubLinks(elem);
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
