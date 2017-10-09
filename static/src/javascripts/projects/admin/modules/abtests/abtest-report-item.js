// @flow

/*
 Module: abtest-item.js
 Description: Displays information about a single test
 */
import { Component } from 'common/modules/component';
import { Participation } from 'admin/modules/abtests/participation';
import bonzo from 'bonzo';
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

    ready(): void {
        if (this.chart) {
            const redraw = this.renderChart.bind(this);

            redraw();

            window.addEventListener('resize', debounce(redraw, 150));
        }
    }

    prerender(): void {
        this.elem.className += this.config.active
            ? ' abtest-item--active'
            : ' abtest-item--expired';
        this.elem.setAttribute('data-abtest-name', this.config.test.id);
        bonzo(this.elem).addClass(
            window.abSwitches[`ab${this.config.test.id}`]
                ? 'abtest-item--switched-on'
                : 'abtest-item--switched-off'
        );

        this.getElem('description').textContent = this.config.test.description;

        this.getElem('name').textContent = this.config.test.id;
        const daysTillExpiry =
            (Date.parse(this.config.test.expiry) - new Date()) /
            (1000 * 60 * 60 * 24);
        this.getElem('expiry').textContent =
            Math.floor(daysTillExpiry).toString() +
            (daysTillExpiry === 1 ? ' day' : ' days');
        this.getElem('expiry').setAttribute('title', this.config.test.expiry);

        this.getElem('audience').textContent = `${this.config.test.audience *
            100}%`;
        this.getElem('audience-offset').textContent = `${this.config.test
            .audienceOffset * 100}%`;

        const tableauUrl = `https://tableau-datascience.gutools.co.uk/views/AutomatedMVTDashboard-MkII/MainMVTDashboard?:embed=y&id=${this
            .config.test.id}`;
        this.getElem('tableau').innerHTML = `<a href="${tableauUrl}">view</a>`;

        const ophanUrl = `https://dashboard.ophan.co.uk/graph/breakdown?ab=${this
            .config.test.id}`;
        this.getElem('ophan').innerHTML = `<a href="${ophanUrl}">graph</a>`;

        this.getElem('hypothesis').textContent =
            this.config.test.hypothesis || '';

        const participation = new Participation({
            test: this.config.test,
        });
        participation.render(this.getElem('participation'));
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
