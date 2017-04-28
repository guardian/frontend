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

let chart;
const FETCH_INTERVAL = 1000; // The frequency that we poll for report data.
const FETCH_DELAY = 10; // The delay which we wait before we ask for a time-based datapoint, eg. 10 seconds before the present moment.
const reportTemplateUrl = '/commercial-reports/<%=isoDate%>';

// Store the 1000 most recently fetched datapoints.
const commercialStartTimes = [];

const updateAverageStartTime = startTimes => {
    // Push the new start times into the stored array to find an average.
    Array.prototype.push.apply(commercialStartTimes, startTimes);
    // Limit the size of the array to 1000.
    if (commercialStartTimes.length > 1000) {
        commercialStartTimes.splice(0, commercialStartTimes.length - 1000);
    }

    if (!commercialStartTimes.length) {
        return;
    }

    const sum = commercialStartTimes.reduce((accum, num) => {
        // Disregard silly numbers, investigating why Date times are appearing in the array.
        if (num < 20000) {
            return accum + num;
        }
        return accum;
    });

    const averageStartTime = (sum / commercialStartTimes.length).toFixed(2);

    $('.graph__average-value').text(averageStartTime);
};

const fetchData = () => {
    const currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() - FETCH_DELAY);
    const fetchUrl = template(reportTemplateUrl, {
        isoDate: currentDate.toISOString(),
    });

    fetchJson(config.page.beaconUrl + fetchUrl, {
        mode: 'cors',
    }).then(logs => {
        type Reports = {
            baselines: Array<{ name: string, startTime: number }>,
        };
        const reports: Array<Reports> = logs.reports || [];
        let appStartTimes: Array<number> = reports.map(report => {
            const primaryBaseline = find(
                report.baselines,
                baseline => baseline.name === 'primary'
            );
            return primaryBaseline ? primaryBaseline.startTime : 0;
        });

        // Filter the times array from silly numbers, investigating why Date times are appearing in the array.
        appStartTimes = appStartTimes.filter(startTime => startTime < 20000);

        updateAverageStartTime(appStartTimes);

        const heatmapData = {
            time: currentDate.getTime() / 1000,
            histogram: countBy(appStartTimes),
        };
        chart.push([heatmapData]);
    });
};

const initialise = () => {
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
