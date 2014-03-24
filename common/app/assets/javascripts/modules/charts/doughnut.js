/*
 * Inspired by
 * - http://www.chartjs.org/
 * - http://codepen.io/githiro/pen/ICfFE
 * - https://github.com/mbostock/d3/blob/master/src/svg/arc.js
 */
define([
    'common/$',
    'lodash/objects/assign'
], function(
    $,
    assign
) {
    function svgEl(type) {
        return $.create(document.createElementNS('http://www.w3.org/2000/svg', type));
    }

    function translate(v) {
        return 'translate('+v+')';
    }

    var Doughnut = function(data, o) {
        o = assign({
            percentCutout: 35,
            unit: '',
            showValues: false
        }, o || {});

        var w = o.width,
            h = o.height || w,
            radius = Math.min(h/2, w/2),
            cutoutRadius = radius*(o.percentCutout/100),
            totalValue = data.reduce(function(a, b) { return { value: a.value+ b.value }; }).value,
            halfPI = Math.PI/2,
            doublePI = Math.PI*2,
            c = [w/2, h/2],
            center = {
                x: w/2,
                y: h/2
            },
            svg = $.create('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>')
                .attr({ width: w, height: h, viewbox: '0 0 '+ [w, h].join(' ') })
                .addClass('chart chart--doughnut');

        // Segments
        var segmentAngle, endRadius, arc, outer, inner, g, t, r, a, d,
            startRadius = -halfPI;

        data.forEach(function(datum) {
            segmentAngle = (datum.value/totalValue * doublePI);
            endRadius = startRadius + segmentAngle;
            arc = ((endRadius - startRadius) % doublePI) > Math.PI ? 1 : 0;
            // TODO (jamesgorrie): functionalise
            outer = {
                start: {
                    x: center.x + Math.cos(startRadius) * radius,
                    y: center.y + Math.sin(startRadius) * radius
                },
                end: {
                    x: center.x + Math.cos(endRadius) * radius,
                    y: center.y + Math.sin(endRadius) * radius
                }
            };
            inner = {
                start: {
                    x: center.x + Math.cos(endRadius) * cutoutRadius,
                    y: center.y + Math.sin(endRadius) * cutoutRadius
                },
                end: {
                    x: center.x + Math.cos(startRadius) * cutoutRadius,
                    y: center.y + Math.sin(startRadius) * cutoutRadius
                }
            };

            r = (cutoutRadius+radius)/2;
            a = (startRadius+endRadius)/2;
            /**
             * M: Move pointer
             * A: Outer arc
             * L: Connect outer and inner arc
             * A: Inner arc
             * Z: Close path
             */
            d = [
                'M', outer.start.x, outer.start.y,
                'A', radius, radius, 0, arc, 1, outer.end.x, outer.end.y,
                'L', inner.start.x, inner.start.y,
                'A', cutoutRadius, cutoutRadius, 0, arc, 0, inner.end.x, inner.end.y,
                'Z'
            ];
            g = svgEl('g').addClass('chart__arc');
            svgEl('path').attr({
                'd': d.join(' '),
                'fill': datum.color
            }).appendTo(g);

            // labels
            t = svgEl('text');
            if (o.showValues) {
                t.append(svgEl('tspan')
                    .text(datum.label)
                    .attr({ x: 0, dy: '0' })
                    .addClass('chart__label-text'))
                 .append(svgEl('tspan')
                    .text(datum.value)
                    .attr({ x: 0, dy: '1em' })
                    .addClass('chart__label-value'));
            } else {
                t.text(datum.label);
            }
            t.attr({ transform: translate([(Math.cos(a)*r)+center.x, (Math.sin(a)*r)+center.y]) })
                .addClass('chart__label')
                .appendTo(g);

            g.appendTo(svg);
            startRadius += ((datum.value/totalValue)*doublePI);
        });

        // Unit of measurement
        svgEl('text')
            .text(o.unit)
            .addClass('chart__unit')
            .attr({
                transform: translate(c),
                dy: '0.4em'
            })
            .appendTo(svg);

        return svg;
    };

    return Doughnut;
}); // define