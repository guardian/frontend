import highchartsGlobals from 'highcharts';

var Highcharts = highchartsGlobals.Highcharts;

var sparklinesDefaults = {
    chart: {
        renderTo: null,
        backgroundColor: null,
        borderWidth: 0,
        type: 'area',
        margin: [0, 0, 0, 0],
        width: 125,
        height: 34,
        style: {
            overflow: 'visible'
        },
        skipClone: true
    },
    title: {
        text: '',
        style: {
            fontSize: '10px'
        },
        align: 'right',
        verticalAlign: 'bottom'
    },
    credits: {
        enabled: false
    },
    xAxis: {
        labels: {
            enabled: false
        },
        title: {
            text: null
        },
        startOnTick: false,
        endOnTick: false,
        tickPositions: []
    },
    yAxis: {
        endOnTick: false,
        startOnTick: false,
        labels: {
            enabled: false
        },
        title: {
            text: null
        },
        tickPositions: [0]
    },
    legend: {
        enabled: false
    },
    tooltip: {
        backgroundColor: null,
        borderWidth: 0,
        shadow: false,
        useHTML: true,
        hideDelay: 0,
        shared: true,
        padding: 0,
        positioner: function (w, h, point) {
            return { x: point.plotX - w / 2, y: point.plotY - h};
        }
    },
    plotOptions: {
        series: {
            animation: false,
            lineWidth: 1,
            shadow: false,
            marker: {
                radius: 1
            },
            fillOpacity: 0.2
        },
        column: {
            borderColor: 'silver'
        }
    }
};

Highcharts.CONFIG_DEFAULTS = {
    sparklines: sparklinesDefaults
};

export default Highcharts;
