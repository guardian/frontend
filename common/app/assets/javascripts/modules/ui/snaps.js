define([
    'common/$',
    'bonzo',
    'common/utils/ajax',
    'common/utils/mediator',
    'lodash/collections/find'
], function(
    $,
    bonzo,
    ajax,
    mediator,
    find
) {

    function snaps(selector) {
        fetchSnaps(selector);
        mediator.on('window:resize', function() {
            resizeSnaps(selector);
        });
    }

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

    function resizeSnaps(selector) {
        $(selector).each(function(el) {
            setSnapPoint(el, 'facia-snap--');
        });
    }

    function fetchSnaps(selector) {
        $(selector).each(function(el) {
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

    return {
        init: snaps
    };
});