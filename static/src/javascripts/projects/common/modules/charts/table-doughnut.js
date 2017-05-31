import bonzo from 'bonzo';
import $ from 'lib/$';
import Doughnut from 'common/modules/charts/doughnut';

var TableDoughnut = function() {};

/**
 * @param {Element} el
 * @return {Bonzo} the SVG Element
 */
TableDoughnut.prototype.render = function(el) {
    var $doughnut, currentClasses,
        width = el.scrollWidth || el.getAttribute('data-chart-width'),
        headings = $('th', el),
        data = $('td', el).map(function(el, i) {
            return {
                label: headings[i].innerHTML,
                value: parseInt(el.getAttribute('data-chart-value'), 10),
                color: el.getAttribute('data-chart-color')
            };
        });

    bonzo(el).addClass('u-h');
    $doughnut = new Doughnut(data, {
        showValues: el.getAttribute('data-chart-show-values') === 'true',
        unit: el.getAttribute('data-chart-unit'),
        width: width
    });
    // can't use bonzo's class methods, don't play well in IE
    currentClasses = $doughnut.attr('class');
    return $doughnut
        .attr('class', currentClasses + ' ' + el.getAttribute('data-chart-class'))
        .insertAfter(el);
};

export default TableDoughnut; // define
