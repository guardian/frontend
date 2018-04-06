// @flow
/*
 * Inspired by
 * - http://www.chartjs.org/
 * - http://codepen.io/githiro/pen/ICfFE
 * - https://github.com/mbostock/d3/blob/master/src/svg/arc.js
 */
import $ from 'lib/$';
import type { bonzo } from 'bonzo';

const svgEl = (type: string): bonzo =>
    $.create(document.createElementNS('http://www.w3.org/2000/svg', type));

const translate = (v: Array<number>): string => `translate(${v.toString()})`;

/**
 * @param {Object.<string, *>} data in the format { label: string, value: number, color: HEX }
 * @param {Object.<string, *>} o the options
 * @return {Bonzo} SVG Element
 */
const Doughnut = (data: Object, o: Object): bonzo => {
    const obj: Object = Object.assign(
        {
            percentCutout: 35,
            unit: '',
            showValues: false,
        },
        o || {}
    );

    const w = obj.width;
    const h = obj.height || w;
    const radius = Math.min(h / 2, w / 2);
    const cutoutRadius = radius * (obj.percentCutout / 100);

    const totalValue = data.reduce((a, b) => ({
        value: a.value + b.value,
    })).value;

    const halfPI = Math.PI / 2;
    const doublePI = Math.PI * 2;
    const c = [w / 2, h / 2];

    const center = {
        x: w / 2,
        y: h / 2,
    };

    const $svg = $.create(
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMinYMin" class="chart chart--doughnut"></svg>'
    ).attr({
        width: w,
        height: h,
        viewbox: `0 0 ${[w, h].join(' ')}`,
    });

    // Segments
    let segmentAngle;
    let endRadius;
    let arc;
    let outer;
    let inner;
    let r;
    let a;
    let d;
    let $g;
    let $t;
    let startRadius = -halfPI;

    data.forEach(datum => {
        segmentAngle = datum.value / totalValue * doublePI;
        endRadius = startRadius + segmentAngle;
        arc = (endRadius - startRadius) % doublePI > Math.PI ? 1 : 0;
        // TODO (jamesgorrie): functionalise
        outer = {
            start: {
                x: center.x + Math.cos(startRadius) * radius,
                y: center.y + Math.sin(startRadius) * radius,
            },
            end: {
                x: center.x + Math.cos(endRadius) * radius,
                y: center.y + Math.sin(endRadius) * radius,
            },
        };
        inner = {
            start: {
                x: center.x + Math.cos(endRadius) * cutoutRadius,
                y: center.y + Math.sin(endRadius) * cutoutRadius,
            },
            end: {
                x: center.x + Math.cos(startRadius) * cutoutRadius,
                y: center.y + Math.sin(startRadius) * cutoutRadius,
            },
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
            'M',
            outer.start.x,
            outer.start.y,
            'A',
            radius,
            radius,
            0,
            arc,
            1,
            outer.end.x,
            outer.end.y,
            'L',
            inner.start.x,
            inner.start.y,
            'A',
            cutoutRadius,
            cutoutRadius,
            0,
            arc,
            0,
            inner.end.x,
            inner.end.y,
            'Z',
        ];
        $g = svgEl('g')
            .attr('class', 'chart__arc')
            .append(
                svgEl('path').attr({
                    d: d.join(' '),
                    fill: datum.color,
                })
            );

        // labels
        $t = svgEl('text').attr('class', 'chart__label');
        if (obj.showValues) {
            $t
                .append(
                    svgEl('tspan')
                        .attr('class', 'chart__label-text')
                        .text(datum.label)
                        .attr({
                            x: 0,
                            dy: '0',
                        })
                )
                .append(
                    svgEl('tspan')
                        .attr('class', 'chart__label-value')
                        .text(datum.value)
                        .attr({
                            x: 0,
                            dy: '.9em',
                        })
                );
        } else {
            $t.text(datum.label);
        }
        $t
            .attr({
                transform: translate([
                    Math.cos(a) * r + center.x,
                    Math.sin(a) * r + center.y,
                ]),
            })
            .appendTo($g);

        $g.appendTo($svg);
        startRadius += datum.value / totalValue * doublePI;
    });

    // Unit of measurement
    return $svg.append(
        svgEl('text')
            .attr('class', 'chart__unit')
            .text(obj.unit)
            .attr({
                transform: translate(c),
                dy: '0.4em',
            })
    );
};

export { Doughnut };
