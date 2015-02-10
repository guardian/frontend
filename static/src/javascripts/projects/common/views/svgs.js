// Include any images needed in templates here.
// This file is only required by core, and so has a long cache time.

define([
    'bonzo',
    'inlineSvg!svgs/marque-36!icon'
], function (
    bonzo,
    marque36icon
) {
    var svgs = {
        marque36icon: marque36icon
    };

    return function (name, classes, attributes) {
        var svg = svgs[name];

        // Only mess with classes if we actually need to.
        if (classes) {
            svg = svg.replace(/class="/, '$&' + classes.join(' ') + ' ');
        }

        // Only mess with attributes if we actually need to.
        if (attributes) {
            svg = bonzo(svg).attr('test', 'something');
        }

        return svg;
    };
});
