// @flow
import bonzo from 'bonzo';
import $ from 'lib/$';
import { Doughnut } from 'common/modules/charts/doughnut';

const TableDoughnut = () => {};

TableDoughnut.prototype.render = (el: Element) => {
    const width = el.scrollWidth || el.getAttribute('data-chart-width');
    const headings = $('th', el);

    const data = $('td', el).map((td, i) => ({
        label: headings[i].innerHTML,
        value: parseInt(td.getAttribute('data-chart-value'), 10),
        color: td.getAttribute('data-chart-color'),
    }));

    bonzo(el).addClass('u-h');
    const $doughnut = new Doughnut(data, {
        showValues: el.getAttribute('data-chart-show-values') === 'true',
        unit: el.getAttribute('data-chart-unit'),
        width,
    });

    // can't use bonzo's class methods, don't play well in IE
    const currentClasses = $doughnut.attr('class');
    return $doughnut.attr(
        'class',
        `${currentClasses} ${el.getAttribute('data-chart-class') || ''}`
    )[0].outerHTML;
};

export { TableDoughnut };
