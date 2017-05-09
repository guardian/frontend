import $ from 'lib/$';
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import reportError from 'lib/report-error';
import template from 'lodash/utilities/template';
import svgs from 'common/views/svgs';
import stockValueTemplate from 'raw-loader!common/views/business/stock-value.html';
import stocksTemplate from 'raw-loader!common/views/business/stocks.html';
import contains from 'lodash/collections/contains';
import map from 'lodash/collections/map';

function isBusinessFront() {
    return contains(['uk/business', 'us/business', 'au/business'], config.page.pageId);
}

function getStocksData() {
    return fetchJson('/business-data/stocks.json', {
            mode: 'cors'
        })
        .catch(function(ex) {
            reportError(ex, {
                feature: 'stocks'
            });
        });
}

function deltaString(n) {
    return n > 0 ? '+' + n : '' + n;
}

function renderData(data) {
    var stockValues = map(data.stocks, function(stockValue) {
        return template(stockValueTemplate, {
            name: stockValue.name,
            deltaClass: 'stocks__stock-value--' + stockValue.trend,
            price: stockValue.price,
            change: deltaString(stockValue.change),
            closed: stockValue.closed ? '<div class="stocks__closed">closed</div>' : '',
            closedInline: stockValue.closed ? '<div class="stocks__closed--inline">closed</div>' : '',
            marketDownIcon: svgs.inlineSvg('marketDownIcon', ['stocks__icon', 'stocks__icon--down']),
            marketUpIcon: svgs.inlineSvg('marketUpIcon', ['stocks__icon', 'stocks__icon--up']),
            marketSameIcon: svgs.inlineSvg('marketSameIcon', ['stocks__icon', 'stocks__icon--same'])
        });
    }).join('');

    return template(stocksTemplate, {
        stocks: stockValues
    });
}

export default function() {
    var $container = $('.js-container--first .js-container__header');

    if (isBusinessFront() && $container) {
        getStocksData().then(function(data) {
            if (data.stocks.length > 0) {
                $container.append(renderData(data));
            }
        });
    }
};
