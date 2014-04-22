define([
    // Common libraries
    'common/$',
    'common/utils/ajax',
    'common/utils/mediator',
    'bonzo',
    'qwery',
    'lodash/collections/find',
    // Modules
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/to-array',
    'common/modules/ui/collection-show-more',
    'modules/ui/container-show-more',
    'modules/ui/container-toggle'
], function (
    $,
    ajax,
    mediator,
    bonzo,
    qwery,
    find,
    detect,
    storage,
    toArray,
    CollectionShowMore,
    ContainerShowMore,
    ContainerToggle
) {
    function setSnapPoint(el, prefix) {
        prefix = prefix || '';
        var breakpoints = [
            { width: 0, name: 'tiny' },
            { width: 240, name: 'small' },
            { width: 300, name: 'medium' },
            { width: 480, name: 'large' },
            { width: 940, name: 'full' }
        ];

        breakpoints.forEach(function(breakpoint) {
            el.classList.remove(prefix + breakpoint.name);
        });

        el.classList.add(prefix + find(breakpoints, function(breakpoint, i, arr) {
            return !arr[i+1] || (el.offsetWidth >= breakpoint.width && el.offsetWidth < arr[i+1].width);
        }).name);
    }

    function getSnaps() {
        return $('.fromage, .item, .linkslist__item, .headline-column__item');
    }

    function resizeSnaps() {
        getSnaps().each(function(el) {
            setSnapPoint(el, 'facia-snap--');
        });
    }

    function fetchSnaps() {
        $('.facia-snap').each(function(el) {
            ajax({
                url: el.getAttribute('data-snap-uri')
            }).then(function(resp) {
                $.create(resp[el.getAttribute('data-snap-content-key')]).each(function(html) {
                    bonzo(el)
                        .empty()
                        .append(html);

                    setSnapPoint(el, 'facia-snap--');
                });
            });
        });
    }

    var modules = {

        makeEverythingSnaps: function() {
            var testTypes = {
                table: '/football/premierleague/table.json',
                matches: '/football/match-day/premierleague/2014/apr/19.json'
            };

            getSnaps().each(function(el) {
                el.classList.add('facia-snap');
                el.classList.add('facia-snap--football');
                el.setAttribute('data-snap-type', 'football');
                el.setAttribute('data-snap-uri', testTypes.matches);
                el.setAttribute('data-snap-content-key', 'html');
            });
            fetchSnaps();
            mediator.on('window:resize', resizeSnaps);
        },

        showCollectionShowMore: function () {
            var collectionShowMoreAdd = function(config, context) {
                var c = context || document;
                $('.container', c).each(function(container) {
                    $('.js-collection--show-more', container).each(function(collection) {
                        new CollectionShowMore(collection).addShowMore();
                    });
                });
                $('.js-container--show-more', c).each(function(container) {
                    new ContainerShowMore(container).addShowMore();
                });
            };
            mediator.addListeners({
                'page:front:ready': collectionShowMoreAdd,
                'ui:collection-show-more:add':  collectionShowMoreAdd
            });
        },

        showContainerToggle: function () {
            var containerToggleAdd = function(config, context) {
                var c = context || document;
                $('.js-container--toggle', c).each(function(container) {
                    new ContainerToggle(container).addToggle();
                });
            };
            mediator.addListeners({
                'page:front:ready': containerToggleAdd,
                'ui:container-toggle:add':  containerToggleAdd
            });
            mediator.on(/page:front:ready|ui:container-toggle:add/, function(config, context) {
                $('.js-container--toggle', context).each(function(container) {
                    new ContainerToggle(container).addToggle();
                });
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.makeEverythingSnaps();
            modules.showCollectionShowMore();
            modules.showContainerToggle();
        }
        mediator.emit('page:front:ready', config, context);
    };

    return {
        init: ready
    };

});
