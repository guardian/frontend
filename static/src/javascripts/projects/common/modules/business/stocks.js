define([
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/template',
    'common/views/svgs',
    'text!common/views/business/stock-value.html',
    'text!common/views/business/stocks.html',
    'lodash/collections/contains',
    'lodash/collections/map'
], function (
    $,
    ajax,
    config,
    template,
    svgs,
    stockValueTemplate,
    stocksTemplate,
    contains,
    map) {
    function isBusinessFront() {
        return contains(['uk/business', 'us/business', 'au/business'], config.page.pageId);
    }

    function getStocksData() {
        return ajax({
            url: '/business-data/stocks.json',
            type: 'json',
            method: 'get',
            crossOrigin: true
        });
    }

    function deltaString(n) { return n > 0 ? '+' + n : '' + n; }

    function renderData(data) {
        var stockValues = map(data.stocks, function (stockValue) {
            return stockValueTemplate({
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

        return stocksTemplate({
            stocks: stockValues
        });
    }

    return function () {
        var $container = $('.js-container--first .js-container__header');
        if (typeof stockValueTemplate === 'string') {
            stockValueTemplate = template(stockValueTemplate);
        }

        if (isBusinessFront() && $container) {
            getStocksData().then(function (data) {
                if (data.stocks.length > 0) {
                    $container.append(renderData(data));
                }
            });
        }
    };
});
