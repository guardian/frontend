define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/template',
    'text!common/views/business/stock-value.html',
    'text!common/views/business/stocks.html'
], function (
    $,
    _,
    ajax,
    config,
    template,
    stockValueTemplate,
    stocksTemplate
) {
    function isBusinessFront() {
        return _.contains(['uk/business', 'us/business', 'au/business'], config.page.pageId);
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
        var stockValues = _.map(data.stocks, function (stockValue) {
            return template(stockValueTemplate, {
                name: stockValue.name,
                deltaClass: 'stocks__stock-value--' + stockValue.trend,
                price: stockValue.price,
                change: deltaString(stockValue.change),
                closed: stockValue.closed ? '<div class="stocks__closed">closed</div>' : '',
                closedInline: stockValue.closed ? '<div class="stocks__closed--inline">closed</div>' : ''
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
