define([
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/template',
    'text!common/views/business/stock-value.html',
    'text!common/views/business/stocks.html'
], function (
    _,
    ajax,
    template,
    stockValue,
    stocks
) {
    function getStocksData(onComplete) {
        return ajax({
            url: '/business-data/stocks.json',
            type: 'json',
            method: 'get',
            crossOrigin: true,
            onComplete: onComplete
        });
    }

    function deltaString(n) { return n > 0 ? "+" + n : "" + n; }

    function renderData(data) {
        var stockValues = _.map(data.stocks, function (stockValue) {
            return template(stockValue, {
                name: stockValue.name,
                deltaClass: "stocks__stock-value--" + stockValue.trend,
                price: stockValue.price,
                change: deltaString(stockValue.change)
            });
        }).join("");

        return template(stocks, {
            stocks: stockValues
        })
    }

    return function () {
        var $container = $('.js-stocks-data-container');

        getStocksData(function (data) {
            $container.html(renderData(data))
        });
    };
});
