define([
    'common/utils/$',
    'common/utils/config',
    'common/utils/fetch-json',
    'common/utils/report-error',
    'common/utils/template',
    'common/views/svgs',
    'raw-loader!common/views/business/stock-value.html',
    'raw-loader!common/views/business/stocks.html',
    'lodash/collections/contains',
    'lodash/collections/map'
], function (
    $,
    config,
    fetchJson,
    reportError,
    template,
    svgs,
    stockValueTemplate,
    stocksTemplate,
    contains,
    map
) {
    function isBusinessFront() {
        return contains(['uk/business', 'us/business', 'au/business'], config.page.pageId);
    }

    function getStocksData() {
        return fetchJson('/business-data/stocks.json', {
            mode: 'cors'
        })
        .catch(function (ex) {
            reportError(ex, {
                feature: 'stocks'
            });
        });
    }

    function deltaString(n) { return n > 0 ? '+' + n : '' + n; }

    function renderData(data) {
        var stockValues = map(data.stocks, function (stockValue) {
            return template(stockValueTemplate, {
                name: stockValue.name,
                deltaClass: 'stocks__stock-value--' + stockValue.trend,
                price: stockValue.price,
                change: deltaString(stockValue.change),
                closed: stockValue.closed ? '<div class="stocks__closed">closed</div>' : '',
                closedInline: stockValue.closed ? '<div class="stocks__closed--inline">closed</div>' : '',
                marketDownIcon: svgs('marketDownIcon', ['stocks__icon', 'stocks__icon--down']),
                marketUpIcon: svgs('marketUpIcon', ['stocks__icon', 'stocks__icon--up']),
                marketSameIcon: svgs('marketSameIcon', ['stocks__icon', 'stocks__icon--same'])
            });
        }).join('');

        return template(stocksTemplate, {
            stocks: stockValues
        });
    }

    return function () {
        var $container = $('.js-container--first .js-container__header');

        if (isBusinessFront() && $container) {
            getStocksData().then(function (data) {
                if (data.stocks.length > 0) {
                    $container.append(renderData(data));
                }
            });
        }
    };
});
