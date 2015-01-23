// Include any images needed in templates here.
// This file is only required by core, and so has a long cache time.

define(function (require) {
    var svgs = {
        marque_36_icon: require('inlineSvg!svgs/marque-36!icon'),
        share_twitter_icon: require('inlineSvg!svgs/share-twitter!icon'),
        share_facebook_icon: require('inlineSvg!svgs/share-facebook!icon'),
        share_pinterest_icon: require('inlineSvg!svgs/share-pinterest!icon')
    }

    return function (name, classes) {
        var svg = svgs[name];

        // Only mess with classes if we actually need to.
        if(classes) {
            svg = svg.replace(/class="/, '$&' + classes.join(' ') + ' ');
        }

        return svg;
    }
})
