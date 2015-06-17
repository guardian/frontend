/*eslint-disable consistent-return*/
import * as vars from 'modules/vars';
import ko from 'knockout';
import _ from 'underscore';
import $ from 'jquery';
import numeral from 'numeral';
import authedAjax from 'modules/authed-ajax';
import Highcharts from 'utils/highcharts';
import mediator from 'utils/mediator';
import parseQueryParams from 'utils/parse-query-params';
import urlAbsPath from 'utils/url-abs-path';

var subscribedFronts = [],
    pollingId;

function goodEnoughSeries (totalHits, series) {
    return series && series.length && totalHits >= 10;
}

function createSparklikes (element, totalHits, series) {
    var lineWidth = Math.min(Math.ceil(totalHits / 2000), 4);

    return new Highcharts.Chart($.extend(true, Highcharts.CONFIG_DEFAULTS.sparklines, {
        chart: {
            renderTo: element
        },
        title: {
            text: numeral(totalHits).format(',')
        },
        plotOptions: {
            series: {
                lineWidth: lineWidth
            }
        },
        series: series
    }));
}

function getWebUrl (article) {
    var url = urlAbsPath(article.props.webUrl());
    if (url) {
        return '/' + url;
    }
}

function showSparklinesInArticle (element, article) {
    var front = article.front,
        webUrl = getWebUrl(article),
        $element = $(element),
        data, series, chart = $element.data('sparklines');

    if (!front || !front.sparklines || !webUrl) {
        return;
    }

    data = front.sparklines.data()[webUrl] || {};
    series = data.series;

    if (chart) {
        // dispose the chart even if there's no series because the new update means
        // there's no data for it. Don't show stale data
        chart.destroy();
        $element.removeData('sparklines');
    }

    if (!goodEnoughSeries(data.totalHits, series)) {
        return;
    }
    chart = createSparklikes(element, data.totalHits, _.map(series, function (value) {
        return {
            name: value.name,
            data: _.map(value.data, function (point) {
                return point.count;
            })
        };
    }));
    $element.data('sparklines', chart);
    return chart;
}

ko.bindingHandlers.sparklines = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        showSparklinesInArticle(element, bindingContext.$data);

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            var $element = $(element),
                chart = $element.data('sparklines');
            if (chart) {
                chart.destroy();
                $element.removeData('sparklines');
            }
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        showSparklinesInArticle(element, bindingContext.$data);
    }
};

function isEnabled () {
    var disabledFromSwitch = vars.model.switches()['facia-tool-sparklines'] === false,
        enabledFromParam = parseQueryParams().sparklines === 'please';

    return !disabledFromSwitch || enabledFromParam;
}

function allWebUrls (front) {
    var all = [];
    _.each(front.collections(), function (collection) {
        collection.eachArticle(function (article) {
            var webUrl = getWebUrl(article);
            if (webUrl) {
                all.push(webUrl);
            }
        });
    });
    return all;
}

function serializeParams (front, articles, options) {
    var params = [];

    params.push('referring-path=/' + front);
    _.map(articles, function (article) {
        return params.push('path=' + article);
    });
    params.push('hours=' + (options.hours || '1'));
    params.push('interval=' + (options.interval || '10'));

    return params.join('&');
}

function reduceRequest (memo, front, articles, options) {
    var deferred = new $.Deferred();

    authedAjax.request({
        url: '/ophan/histogram?' + serializeParams(front, articles, options)
    }).then(function (data) {
        _.each(data, function (content) {
            memo[content.path] = content;
        });

        deferred.resolve(memo);
    }).fail(function (error) {
        deferred.reject(error);
    });

    return deferred.promise();
}

function getHistogram (front, articles, options) {
    var deferred = new $.Deferred().resolve({});

    // Allow max articles in one request or the GET request is too big
    var maxArticles = vars.CONST.sparksBatchQueue;
    _.each(_.range(0, articles.length, maxArticles), function (limit) {
        deferred = deferred.then(function (memo) {
            return reduceRequest(
                memo,
                front,
                articles.slice(limit, Math.min(limit + maxArticles, articles.length)),
                options
            );
        });
    });

    return deferred;
}

function differential (collection) {
    var front = collection.front,
        data, newArticles = [];

    if (!front || !front.sparklines || front.sparklines.promise.state() !== 'resolved') {
        return;
    }

    data = front.sparklines.data();
    collection.eachArticle(function (article) {
        var webUrl = getWebUrl(article);
        if (webUrl && !data[webUrl]) {
            newArticles.push(webUrl);
        }
    });

    if (newArticles.length) {
        var deferred = new $.Deferred(),
            referrerFront = front.front();

        getHistogram(
            front.front(),
            newArticles,
            front.sparklinesOptions()
        ).then(function (newData) {
            if (referrerFront !== front.front()) {
                deferred.reject();
            } else {
                _.each(newArticles, function (webUrl) {
                    data[webUrl] = newData[webUrl];
                });
                front.sparklines.data(data);
                deferred.resolve(data);
            }
        });

        front.sparklines.promise = deferred.promise();
    }
}

function loadSparklinesForFront (front) {
    if (!front.front() || !isEnabled()) {
        return;
    }

    var deferred = new $.Deferred(),
        referrerFront = front.front();

    $.when.apply($, _.map(front.collections(), function (collection) {
        return collection.loaded;
    })).then(function () {
        if (referrerFront !== front.front()) {
            deferred.reject();
            return;
        }

        getHistogram(
            front.front(),
            allWebUrls(front),
            front.sparklinesOptions()
        ).then(function (data) {
            if (referrerFront !== front.front()) {
                deferred.reject();
            } else {
                front.sparklines.data(data);
                deferred.resolve(data);
            }
        });
    });

    if (!front.sparklines) {
        front.sparklines = {
            data: ko.observable({})
        };
    }
    front.sparklines.promise = deferred.promise();
}

function startPolling () {
    if (!pollingId) {
        var period = vars.CONST.sparksRefreshMs || 60000;
        setInterval(function () {
            _.each(subscribedFronts, function (front) {
                loadSparklinesForFront(front, true);
            });
        }, period);
    }
}

function stopPolling () {
    if (pollingId) {
        clearInterval(pollingId);
    }
}

function subscribe (widget) {
    if (subscribedFronts.length === 0) {
        startPolling();
        mediator.on('collection:populate', differential);
    }
    subscribedFronts.push(widget);
    loadSparklinesForFront(widget);
    widget.collections.subscribe(function () {
        loadSparklinesForFront(widget);
    });
    widget.sparklinesOptions.subscribe(function () {
        loadSparklinesForFront(widget);
    });
}

function unsubscribe (widget) {
    subscribedFronts = _.without(subscribedFronts, widget);
    if (subscribedFronts.length === 0) {
        stopPolling();
        mediator.on('collection:populate', differential);
    }
}

export {
    subscribe,
    unsubscribe,
    isEnabled
};
