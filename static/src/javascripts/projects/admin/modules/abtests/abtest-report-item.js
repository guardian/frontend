/*global google*/
/*
 Module: abtest-item.js
 Description: Displays information about a single test
 */
define([
    'common/utils/_',
    'common/modules/component',
    'admin/modules/abtests/participation',
    'bonzo',
    'qwery',
    'bean',
    'lodash/objects/assign',
    'lodash/objects/clone'
], function (
    _,
    Component,
    Participation,
    bonzo,
    qwery,
    bean,
    assign,
    clone) {

    function ABTestReportItem(config) {
        this.config = assign(clone(this.config), config);
        if (window.abCharts) {
            this.chart = window.abCharts['ab' + this.config.test.id];
        }
    }

    Component.define(ABTestReportItem);

    ABTestReportItem.prototype.config = {
        test: {},
        active: true
    };

    ABTestReportItem.prototype.templateName = 'abtest-item-template';
    ABTestReportItem.prototype.componentClass = 'abtest-item';
    ABTestReportItem.prototype.useBem = true;

    ABTestReportItem.prototype.renderChart = function () {
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

    ABTestReportItem.prototype.prerender = function () {

        this.elem.className += this.config.active ? ' abtest-item--active' : ' abtest-item--expired';
        this.elem.setAttribute('data-abtest-name', this.config.test.id);
        bonzo(this.elem).addClass(window.abSwitches['ab' + this.config.test.id] ? 'abtest-item--switched-on' : 'abtest-item--switched-off');

        this.getElem('description').textContent = this.config.test.description;

        this.getElem('name').textContent = this.config.test.id;
        var daysTillExpiry = (Date.parse(this.config.test.expiry) - new Date()) / (1000 * 60 * 60 * 24);
        this.getElem('expiry').textContent = Math.floor(daysTillExpiry).toString() + (daysTillExpiry === 1 ? ' day' : ' days');
        this.getElem('expiry').setAttribute('title', this.config.test.expiry);

        this.getElem('audience').textContent = (this.config.test.audience * 100) + '%';
        this.getElem('audience-offset').textContent = (this.config.test.audienceOffset * 100) + '%';

        var tableauUrl = 'https://tableau-datascience.gutools.co.uk/views/AutomatedMVTDashboard-MkII/MainMVTDashboard?:embed=y&id=' + this.config.test.id;
        this.getElem('tableau').innerHTML = '<a href="' + tableauUrl + '">view</a>';

        var ophanUrl = 'https://dashboard.ophan.co.uk/graph/breakdown?ab=' + this.config.test.id;
        this.getElem('ophan').innerHTML = '<a href="' + ophanUrl + '">graph</a>';

        this.getElem('hypothesis').textContent = this.config.test.hypothesis || '';

        var participation = new Participation({ test: this.config.test });
        participation.render(this.getElem('participation'));
    };

    ABTestReportItem.prototype.ready = function () {
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

    return ABTestReportItem;

});
