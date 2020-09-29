

/*
 Module: abtest-item.js
 Description: Displays information about a single test
 */
import { Component } from "common/modules/component";
import { Participation } from "admin/modules/abtests/participation";
import bonzo from "bonzo";
import debounce from "lodash/debounce";

class ABTestReportItem extends Component {

  constructor(config: Object): void {
    super();

    this.templateName = 'abtest-item-template';
    this.componentClass = 'abtest-item';
    this.useBem = true;
    this.config = {test: {},
      active: true, ...config};

    if (window.abCharts) {
      this.chart = window.abCharts[`ab${this.config.test.id}`];
    }
  }

  chart: Object;

  config: Object;

  ready(): void {
    if (this.chart) {
      const redraw = this.renderChart.bind(this);

      redraw();

      window.addEventListener('resize', debounce(redraw, 150));
    }
  }

  prerender(): void {
    if (this.elem && this.elem instanceof HTMLElement) {
      this.elem.className += this.config.active ? ' abtest-item--active' : ' abtest-item--expired';
      this.elem.setAttribute('data-abtest-name', this.config && this.config.test && this.config.test.id);
    }

    bonzo(this.elem).addClass(window.abSwitches[`ab${this.config.test.id}`] ? 'abtest-item--switched-on' : 'abtest-item--switched-off');

    const elements = {
      expiry: this.getElem('expiry'),
      audience: this.getElem('audience'),
      audienceOffset: this.getElem('audience-offset'),
      description: this.getElem('description'),
      hypothesis: this.getElem('hypothesis'),
      name: this.getElem('name'),
      ophan: this.getElem('ophan'),
      participation: this.getElem('participation'),
      tableau: this.getElem('tableau')
    };
    const daysTillExpiry = (Date.parse(this.config.test.expiry) - new Date()) / (1000 * 60 * 60 * 24);
    const tableauUrl = `https://tableau-datascience.gutools.co.uk/views/AutomatedMVTDashboard-MkII/MainMVTDashboard?:embed=y&id=${this.config.test.id}`;
    const ophanUrl = `https://dashboard.ophan.co.uk/graph/breakdown?ab=${this.config.test.id}`;

    if (elements.description) {
      elements.description.textContent = this.config.test.description;
    }

    if (elements.name) {
      elements.name.textContent = this.config.test.id;
    }

    if (elements.expiry) {
      // $FlowFixMe Go home flow, you are drunk
      elements.expiry.textContent = Math.floor(daysTillExpiry).toString() + (daysTillExpiry === 1 ? ' day' : ' days');
    }

    if (elements.expiry) {
      elements.expiry.setAttribute('title', this.config.test.expiry);
    }

    if (elements.audience) {
      elements.audience.textContent = `${this.config.test.audience * 100}%`;
    }

    if (elements.audienceOffset) {
      elements.audienceOffset.textContent = `${this.config.test.audienceOffset * 100}%`;
    }

    if (elements.tableau) {
      elements.tableau.innerHTML = `<a href="${tableauUrl}">view</a>`;
    }

    if (elements.ophan) {
      elements.ophan.innerHTML = `<a href="${ophanUrl}">graph</a>`;
    }

    if (elements.hypothesis) {
      elements.hypothesis.textContent = this.config.test.hypothesis || '';
    }

    if (elements.participation) {
      const participation = new Participation({
        test: this.config.test
      });

      participation.render(elements.participation);
    }
  }

  renderChart(): void {
    if (this.chart) {
      new window.google.visualization.LineChart(this.getElem('chart')).draw(window.google.visualization.arrayToDataTable(this.chart.data), {
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
        fontName: 'Helvetica'
      });
    }
  }
}

export { ABTestReportItem };