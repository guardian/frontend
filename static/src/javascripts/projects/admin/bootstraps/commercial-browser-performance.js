// @flow
/* global $, Epoch*/
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import template from 'lodash/utilities/template';
import countBy from 'lodash/collections/countBy';
import find from 'lodash/collections/find';

// Globals that aren't imported
declare var $: any;
declare var Epoch: any;

type HeatmapDatapoint = { time: number, histogram: Array<Array<number>> };
type Chart = { push: (_: Array<HeatmapDatapoint>) => void };

let chart: Chart;
const FETCH_INTERVAL: number = 1000; // The frequency that we poll for report data.
const FETCH_DELAY: number = 10; // The delay which we wait before we ask for a time-based datapoint, eg. 10 seconds before the present moment.
const reportTemplateUrl: string = '/commercial-reports/<%=isoDate%>';

// Store the 1000 most recently fetched datapoints.
const commercialStartTimes: Array<number> = [];

const updateAverageStartTime = (startTimes: Array<number>): void => {
    // Push the new start times into the stored array to find an average.
    Array.prototype.push.apply(commercialStartTimes, startTimes);
    // Limit the size of the array to 1000.
    if (commercialStartTimes.length > 1000) {
        commercialStartTimes.splice(0, commercialStartTimes.length - 1000);
    }

    if (!commercialStartTimes.length) {
        return;
    }

    const sum: number = commercialStartTimes.reduce(
        (accum: number, num: number) => {
            // Disregard silly numbers, investigating why Date times are appearing in the array.
            if (num < 20000) {
                return accum + num;
            }
            return accum;
        },
        0
    );

    const averageStartTime: string = (sum /
        commercialStartTimes.length).toFixed(2);

    $('.graph__average-value').text(averageStartTime);
};

const fetchData = (): void => {
    const currentDate: Date = new Date();
    currentDate.setSeconds(currentDate.getSeconds() - FETCH_DELAY);
    const fetchUrl: string = template(reportTemplateUrl, {
        isoDate: currentDate.toISOString(),
    });

    fetchJson(config.page.beaconUrl + fetchUrl, {
        mode: 'cors',
    }).then(logs => {
        type StartTime = { name: string, startTime: number };
        type Report = {
            baselines: Array<StartTime>,
        };
        const reports: Array<Report> = logs.reports || [];
        const appStartTimes: Array<number> = reports.map(report => {
            const primaryBaseline: StartTime | void = find(
                report.baselines,
                baseline => baseline.name === 'primary'
            );
            return primaryBaseline ? primaryBaseline.startTime : 0;
        });

        // Filter the times array from silly numbers, investigating why Date times are appearing in the array.
        appStartTimes.filter(startTime => startTime < 20000);

        updateAverageStartTime(appStartTimes);

        const heatmapData: HeatmapDatapoint = {
            time: currentDate.getTime() / 1000,
            histogram: countBy(appStartTimes),
        };
        chart.push([heatmapData]);
    });
};

const initialise = (): void => {
    chart = $('#browser-live-performance-data').epoch({
        type: 'time.heatmap',
        buckets: 20,
        bucketRange: [0, 10000],
        axes: ['left', 'right', 'bottom'],
        tickFormats: {
            left: Epoch.Formats.regular,
            right: Epoch.Formats.regular,
        },
        data: [
            {
                label: 'Commercial Start Time',
                values: [],
            },
        ],
    });

    window.setInterval(fetchData, FETCH_INTERVAL);
};

export default {
    init: initialise,
};
