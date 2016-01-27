/*
 * Inspired by
 * - http://www.chartjs.org/
 * - http://codepen.io/githiro/pen/ICfFE
 * - https://github.com/mbostock/d3/blob/master/src/svg/arc.js
 */
define([
    'common/utils/$',
    'lodash/objects/assign'
], function (
    $,
    assign
) {
    /**
     * @param {string} type
     * @return {Bonzo}
     */
    function svgEl(type) {
        return $.create(document.createElementNS('http://www.w3.org/2000/svg', type));
    }

    /**
     * @param {Array} v
     * @return {string}
     */
    function translate(v) {
        return 'translate(' + v + ')';
    }

    /**
     * @param {Object.<string, *>} data in the format { label: string, value: number, color: HEX }
     * @param {Object.<string, *>} o the options
     * @return {Bonzo} SVG Element
     */
    var Doughnut = function (data, o) {
        o = assign({
            percentCutout: 35,
            unit: '',
            showValues: false
        }, o || {});

        var w = o.width,
            h = o.height || w,
            radius = Math.min(h / 2, w / 2),
            cutoutRadius = radius * (o.percentCutout / 100),
            totalValue = data.reduce(function (a, b) { return { value: a.value + b.value }; }).value,
            halfPI = Math.PI / 2,
            doublePI = Math.PI * 2,
            c = [w / 2, h / 2],
            center = {
                x: w / 2,
                y: h / 2
            },
            $svg = $.create('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="chart chart--doughnut"></svg>')
                .attr({ width: w, height: h, viewbox: '0 0 ' + [w, h].join(' ') }),
            // Segments
            segmentAngle, endRadius, arc, outer, inner, r, a, d, $g, $t,
            startRadius = -halfPI;

        data.forEach(function (datum) {
            segmentAngle = (datum.value / totalValue * doublePI);
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

            r = (cutoutRadius + radius) / 2;
            a = (startRadius + endRadius) / 2;
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
            $g = svgEl('g')
                .attr('class', 'chart__arc')
                .append(svgEl('path').attr({
                    'd': d.join(' '),
                    'fill': datum.color
                }));

            // labels
            $t = svgEl('text')
                .attr('class', 'chart__label');
            if (o.showValues) {
                $t.append(svgEl('tspan')
                    .attr('class', 'chart__label-text')
                    .text(datum.label)
                    .attr({ x: 0, dy: '0' }))
                 .append(svgEl('tspan')
                    .attr('class', 'chart__label-value')
                    .text(datum.value)
                    .attr({ x: 0, dy: '1em' }));
            } else {
                $t.text(datum.label);
            }
            $t.attr({ transform: translate([(Math.cos(a) * r) + center.x, (Math.sin(a) * r) + center.y]) })
                .appendTo($g);

            $g.appendTo($svg);
            startRadius += ((datum.value / totalValue) * doublePI);
        });

        // Unit of measurement
        return $svg.append(svgEl('text')
            .attr('class', 'chart__unit')
            .text(o.unit)
            .attr({
                transform: translate(c),
                dy: '0.4em'
            }));
    };

    return Doughnut;
}); // define
