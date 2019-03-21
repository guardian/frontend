// @flow
import $ from 'lib/$';
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import reportError from 'lib/report-error';
import template from 'lodash/template';
import { inlineSvg } from 'common/views/svgs';
import stockValueTemplate from 'raw-loader!common/views/business/stock-value.html';
import stocksTemplate from 'raw-loader!common/views/business/stocks.html';

const isBusinessFront = () =>
    ['uk/business', 'us/business', 'au/business'].indexOf(
        config.get('page.pageId')
    ) !== -1;

const getStocksData = () =>
    fetchJson('/business-data/stocks.json', {
        mode: 'cors',
    }).catch(ex => {
        reportError(ex, {
            feature: 'stocks',
        });
    });

const deltaString = n => (n > 0 ? `+${n}` : `${n}`);

const renderData = data => {
    const stockValues = data.stocks
        .map(stockValue =>
            template(stockValueTemplate)({
                name: stockValue.name,
                deltaClass: `stocks__stock-value--${stockValue.trend}`,
                price: stockValue.price,
                change: deltaString(stockValue.change),
                closed: stockValue.closed
                    ? '<div class="stocks__closed">closed</div>'
                    : '',
                closedInline: stockValue.closed
                    ? '<div class="stocks__closed--inline">closed</div>'
                    : '',
                marketDownIcon: inlineSvg('marketDownIcon', [
                    'stocks__icon',
                    'stocks__icon--down',
                ]),
                marketUpIcon: inlineSvg('marketUpIcon', [
                    'stocks__icon',
                    'stocks__icon--up',
                ]),
                marketSameIcon: inlineSvg('marketSameIcon', [
                    'stocks__icon',
                    'stocks__icon--same',
                ]),
            })
        )
        .join('');

    return template(stocksTemplate)({
        stocks: stockValues,
    });
};

export default () => {
    const $container = $('.js-container--first .js-container__header');

    if (isBusinessFront() && $container) {
        getStocksData().then(data => {
            if (data && data.stocks && data.stocks.length > 0) {
                $container.append(renderData(data));
            }
        });
    }
};
