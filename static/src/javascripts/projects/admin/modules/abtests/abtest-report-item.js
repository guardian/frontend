// @flow

/*
 Module: abtest-item.js
 Description: Displays information about a single test
 */
import { Component } from 'common/modules/component';
import { Participation } from 'admin/modules/abtests/participation';
import debounce from 'lodash/functions/debounce';

class ABTestReportItem extends Component {
    constructor(config: Object): void {
        super();

        this.templateName = 'abtest-item-template';
        this.componentClass = 'abtest-item';
        this.useBem = true;
        this.config = Object.assign(
            {
                test: {},
                active: true,
            },
            config
        );

        if (window.abCharts) {
            this.chart = window.abCharts[`ab${this.config.test.id}`];
        }
    }

    config: Object;
    chart: Object;

    ready(): void {
        if (this.chart) {
            const redraw = this.renderChart.bind(this);

            redraw();

            window.addEventListener('resize', debounce(redraw, 150));
        }
    }

    prerender(): void {
        const { active, test } = this.config;
        const activeClass = active
            ? ' abtest-item--active'
            : ' abtest-item--expired';
        const switchClass = window.abSwitches[`ab${test.id}`]
            ? 'abtest-item--switched-on'
            : 'abtest-item--switched-off';
        const daysTillExpiry =
            (Date.parse(test.expiry) - new Date()) / (1000 * 60 * 60 * 24);
        const tableauLink = `<a href="https://tableau-datascience.gutools.co.uk/views/AutomatedMVTDashboard-MkII/MainMVTDashboard?:embed=y&id=${test.id}">view</a>`;
        const ophanLink = `<a href="https://dashboard.ophan.co.uk/graph/breakdown?ab=${test.id}">graph</a>`;
        const expiry =
            Math.floor(daysTillExpiry).toString() +
            (daysTillExpiry === 1 ? ' day' : ' days');
        const audienceOffset = `${test.audienceOffset * 100}%`;

        if (this.elem && this.elem instanceof HTMLElement) {
            this.elem.setAttribute('data-abtest-name', test.id);
            this.elem.classList.add(switchClass);
            this.elem.classList.add(activeClass);
        }

        this.getElem('description').textContent = test.description;
        this.getElem('name').textContent = test.id;
        this.getElem('expiry').textContent = expiry;
        this.getElem('expiry').setAttribute('title', test.expiry);
        this.getElem('audience').textContent = `${test.audience * 100}%`;
        this.getElem('audience-offset').textContent = audienceOffset;
        this.getElem('tableau').innerHTML = tableauLink;
        this.getElem('ophan').innerHTML = ophanLink;
        this.getElem('hypothesis').textContent = test.hypothesis || '';

        new Participation({
            test,
        }).render(this.getElem('participation'));
    }

    renderChart(): void {
        if (this.chart) {
            new window.google.visualization.LineChart(
                this.getElem('chart')
            ).draw(
                window.google.visualization.arrayToDataTable(this.chart.data),
                {
                    colors: this.chart.colors,
                    curveType: 'function',
                    chartArea: {
                        width: '100%',
                        height: 160,
                        top: 0,
                        left: 15,
                    },
                    legend: {
                        position: 'in',
                    },
                    vAxis: {
                        title: 'Pageviews/session',
                        textPosition: 'in',
                        titleTextStyle: {
                            fontSize: 11,
                        },
                    },
                    fontName: 'Helvetica',
                }
            );
        }
    }
}

export { ABTestReportItem };
