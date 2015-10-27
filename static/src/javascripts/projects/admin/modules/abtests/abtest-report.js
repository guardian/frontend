/*global google*/
/*
 Module: abtest-report.js
 Description: Displays headings for all tests
 */
define([
    'common/utils/_',
    'common/modules/component',
    'admin/modules/abtests/participation',
    'bonzo',
    'qwery',
    'bean'
], function (
    _,
    Component,
    Participation,
    bonzo,
    qwery,
    bean
) {

    function ABTestReport(config) {
        this.config = _.extend(_.clone(this.config), config);
        if (window.abCharts) {
            this.chart = window.abCharts['ab' + this.config.test.id];
        }
    }

    Component.define(ABTestReport);

    ABTestReport.prototype.config = {
        test: {},
        active: true
    };

    ABTestReport.prototype.templateName = 'abtest-report-template';
    ABTestReport.prototype.componentClass = 'abtest-report';
    ABTestReport.prototype.useBem = true;

    ABTestReport.prototype.renderChart = function () {
        if (this.chart) {
            new google.visualization.LineChart(this.getElem('chart'))
                .draw(google.visualization.arrayToDataTable(this.chart.data), {
                    colors: this.chart.colors,
                    curveType: 'function',
                    chartArea: {
                        width: '100%',
                        height: 160,
                        top: 0,
                        left: 15
                    },
                    legend: {
                        position: 'in'
                    },
                    vAxis: {
                        title: 'Pageviews/session',
                        textPosition: 'in',
                        titleTextStyle: {
                            fontSize: 11
                        }
                    },
                    fontName : 'Helvetica'
                });
        }
    };

    ABTestReport.prototype.prerender = function () {

        this.elem.className += this.config.active ? ' abtest-item--active' : ' abtest-item--expired';
        this.elem.setAttribute('data-abtest-name', this.config.test.id);
        bonzo(this.elem).addClass(window.abSwitches['ab' + this.config.test.id] ? 'abtest-item--switched-on' : 'abtest-item--switched-off');

    };

    ABTestReport.prototype.ready = function () {
        if (this.chart) {
            var redraw = this.renderChart.bind(this);
            redraw();
            var timerid;
            bean.on(window, 'resize', function () {
                if (timerid) { window.clearTimeout(timerid); }
                timerid = window.setTimeout(redraw, 150);
            });
        }
    };

    return ABTestReport;

});

