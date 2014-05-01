define([
    'common/$',
    'bonzo',
    'common/utils/ajax',
    'common/utils/mediator',
    'common/utils/to-array',
    'lodash/collections/find'
], function(
    $,
    bonzo,
    ajax,
    mediator,
    toArray,
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
            { width: 180, name: 'mini' },
            { width: 220, name: 'small' },
            { width: 300, name: 'medium' },
            { width: 700, name: 'large' }
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
            setSnapPoint(el, 'facia-snap-point--');
        });
    }

    function fetchSnaps(selector) {
        toArray($(selector))
            .filter(function(el) { return el.getAttribute('data-snap-uri'); })
            .forEach(function(el) {
                ajax({
                    url: el.getAttribute('data-snap-uri'),
                    crossOrigin: true
                }).then(function(resp) {
                    $.create(resp.html).each(function(html) {
                        bonzo(el)
                            .empty()
                            .append(html);

                        setSnapPoint(el, 'facia-snap-point--');
                    });
                });
            });
    }

    return {
        init: snaps
    };
});
