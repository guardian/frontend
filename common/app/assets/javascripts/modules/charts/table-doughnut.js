define([
    'common/$',
    'bonzo',
    'common/modules/charts/doughnut'
], function(
    $,
    bonzo,
    Doughnut
) {

var TableDoughnut = function() {};

/**
 * @param {Element} el
 * @return {Bonzo} the SVG Element
 */
TableDoughnut.prototype.render = function(el) {
    var width = el.scrollWidth,
        headings = $('th', el),
        data = $('td', el).map(function(el, i) {
            return {
                label: headings[i].innerHTML,
                value: parseInt(el.getAttribute('data-chart-value'), 10),
                color: el.getAttribute('data-chart-color')
            };
        });

    bonzo(el).addClass('u-h');
    return new Doughnut(data, {
        showValues: el.getAttribute('data-chart-show-values') === 'true',
        unit: el.getAttribute('data-chart-unit'),
        width: width
    }).addClass(el.getAttribute('data-chart-class')).insertAfter(el);
};

return TableDoughnut;

}); // define
