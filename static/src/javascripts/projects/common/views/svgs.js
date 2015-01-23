// Include any images needed in templates here

define(function (require) {
    var svgs = {
        marque_36_icon: require('inlineSvg!svgs/marque-36!icon'),
    }

    return function (name, classes) {
        var svg = svgs[name];
        if(classes) {
            svg = svg.replace(/class="/, '$&' + classes.join(' ') + ' ');
        }
        return svg;
    }
})
