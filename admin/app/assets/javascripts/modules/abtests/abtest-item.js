/*
 Module: abtest-item.js
 Description: Displays information about a single test
 */
define([
    'lodash/main',
    'common/modules/component',
    'modules/abtests/participation',
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

    function ABTestItem(config) {
        this.config = _.extend(_.clone(this.config), config);
        if (window.abCharts) {
            this.chart = window.abCharts["ab" + this.config.test.id];
        }
    }

    Component.define(ABTestItem);

    ABTestItem.prototype.config = {
        test: {},
        active: true
    };

    ABTestItem.prototype.templateName = 'abtest-item-template';
    ABTestItem.prototype.componentClass = 'abtest-item';
    ABTestItem.prototype.useBem = true;

    ABTestItem.prototype.renderChart = function() {
        if (this.chart) {
            new google.visualization.LineChart(this.getElem('chart'))
                .draw(google.visualization.arrayToDataTable(this.chart.data), {
                    colors: this.chart.colors,
                    curveType: 'function',
                    chartArea: {
                        width: "100%",
                        height: 160,
                        top: 0,
                        left: 15
                    },
                    legend: {
                        position: "in"
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

    ABTestItem.prototype.prerender = function() {

        this.elem.className += this.config.active ? " abtest-item--active" : " abtest-item--expired";
        this.elem.setAttribute('data-abtest-name', this.config.test.id);
        bonzo(this.elem).addClass(window.abSwitches['ab'+this.config.test.id] ? 'abtest-item--switched-on' : 'abtest-item--switched-off');

        this.getElem('name').textContent = this.config.test.id;
        this.getElem('description').textContent = " " + this.config.test.description;
        var daysTillExpiry = (Date.parse(this.config.test.expiry) - new Date()) / (1000*60*60*24);
        this.getElem('expiry').textContent = Math.floor(daysTillExpiry).toString() + (daysTillExpiry == 1 ? " day" : " days");
        this.getElem('expiry').setAttribute('title', this.config.test.expiry);

        this.getElem('audience').textContent = (this.config.test.audience * 100) + "%";
        this.getElem('audience-offset').textContent = (this.config.test.audienceOffset * 100) + "%";

        var participation = new Participation({ test: this.config.test });
        participation.render(this.getElem('participation'));
    };

    ABTestItem.prototype.ready = function() {
        if (this.chart) {
            var redraw = this.renderChart.bind(this);
            redraw();
            var timerid;
            bean.on(window, 'resize', function() {
                if (timerid) { window.clearTimeout(timerid); }
                timerid = window.setTimeout(redraw, 150);
            })
        }
    };

    return ABTestItem;

});
