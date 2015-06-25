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
    'bean'
], function (
    _,
    Component,
    Participation,
    bonzo,
    qwery,
    bean
) {

    function ABTestReportItem(config) {
        this.config = _.extend(_.clone(this.config), config);
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

    ABTestReportItem.prototype.renderChart = function() {
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

    ABTestReportItem.prototype.prerender = function() {

        this.elem.className += this.config.active ? ' abtest-item--active' : ' abtest-item--expired';
        this.elem.setAttribute('data-abtest-name', this.config.test.id);
        bonzo(this.elem).addClass(window.abSwitches['ab' + this.config.test.id] ? 'abtest-item--switched-on' : 'abtest-item--switched-off');

        this.getElem('name').textContent = this.config.test.id;
        var daysTillExpiry = (Date.parse(this.config.test.expiry) - new Date()) / (1000 * 60 * 60 * 24);
        this.getElem('expiry').textContent = Math.floor(daysTillExpiry).toString() + (daysTillExpiry === 1 ? ' day' : ' days');
        this.getElem('expiry').setAttribute('title', this.config.test.expiry);

        this.getElem('audience').textContent = (this.config.test.audience * 100) + '%';
        this.getElem('audience-offset').textContent = (this.config.test.audienceOffset * 100) + '%';

        var tableauUrl = 'https://tableau-datascience.gutools.co.uk/#/views/AutomatedMVTDashboard/MainMVTDashboard?id=' + this.config.test.id;
        this.getElem('tableau').innerHTML = '<a href="' + tableauUrl + '">view</a>';

        var ophanUrl = 'https://dashboard.ophan.co.uk/graph/breakdown?ab=' + this.config.test.id;
        this.getElem('ophan').innerHTML = '<a href="' + ophanUrl + '"">graph</a>';

        if (window.abConfigSwitches.abShowHypothesesDashboard) {
            var hypothesis;
            var criteria = this.config.test.audienceCriteria ? true : false;
            var description = this.config.test.description ? true : false;
            var reason = this.config.test.reason ? true : false;
            var success = this.config.test.successMeasure ? true : false;
            var outcome = this.config.test.idealOutcome ? true : false;
            if (criteria && description && reason && success && outcome) {
                hypothesis = 'We believe that ' + this.config.test.audienceCriteria;
                hypothesis += ' has a need for ' + this.config.test.description;
                hypothesis += ' because ' + this.config.test.reason;
                hypothesis += '. We will know this when ' + this.config.test.successMeasure;
                hypothesis += ' has ' + this.config.test.idealOutcome;
                hypothesis += '.';
            } else {
                hypothesis = 'Hypothesis incomplete: Test definition lacks sufficient criteria';
            }
            this.getElem('hypothesis').textContent = hypothesis;
        }

        var participation = new Participation({ test: this.config.test });
        participation.render(this.getElem('participation'));
    };

    ABTestReportItem.prototype.ready = function() {
        if (this.chart) {
            var redraw = this.renderChart.bind(this);
            redraw();
            var timerid;
            bean.on(window, 'resize', function() {
                if (timerid) { window.clearTimeout(timerid); }
                timerid = window.setTimeout(redraw, 150);
            });
        }
    };

    return ABTestReportItem;

});
