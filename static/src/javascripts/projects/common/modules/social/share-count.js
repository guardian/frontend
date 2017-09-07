// @flow

import fastdom from 'fastdom';
import reportError from 'lib/report-error';
import $ from 'lib/$';
import fetchJSON from 'lib/fetch-json';
import config from 'lib/config';
import { integerCommas } from 'lib/formatters';
import template from 'lodash/utilities/template';
import { inlineSvg } from 'common/views/svgs';
import shareCountTemplate from 'raw-loader!common/views/content/share-count.html';
import shareCountImmersiveTemplate from 'raw-loader!common/views/content/share-count-immersive.html';

const $shareCountEls = $('.js-sharecount');
const tooltip: string = 'Facebook: <%=facebook%>';
const counts: Object = {
    facebook: 'n/a',
};
let shareCount: number = 0;
let $fullValueEls;
let $shortValueEls;

const incrementShareCount = (amount: number): void => {
    if (amount !== 0) {
        shareCount += amount;

        const displayCount = parseInt(shareCount.toFixed(0), 10);
        const formattedDisplayCount = integerCommas(displayCount);
        const shortDisplayCount =
            displayCount > 10000
                ? `${Math.round(displayCount / 1000)}k`
                : displayCount;

        fastdom.write(() => {
            $fullValueEls.text(formattedDisplayCount);
            $shortValueEls.text(shortDisplayCount);
        });
    }
};

const updateTooltip = (): void => {
    $shareCountEls.attr('title', template(tooltip, counts));
};

const addToShareCount = (val: number): void => {
    const shareSvg = inlineSvg('share');
    const shareTemplate = $shareCountEls.hasClass('js-sharecount-immersive')
        ? shareCountImmersiveTemplate
        : shareCountTemplate;
    const html = template(shareTemplate, {
        icon: shareSvg,
    });

    $shareCountEls
        .removeClass('u-h')
        .html(html)
        .css('display', '');

    $shortValueEls = $('.sharecount__value--short', $shareCountEls[0]);
    $fullValueEls = $('.sharecount__value--full', $shareCountEls[0]);

    incrementShareCount(val);
};

const fetch = (): void => {
    const url = `${config.page.ajaxUrl}/sharecount/${config.page.pageId}.json`;

    fetchJSON(url, {
        mode: 'cors',
    }).then(res => {
        const count = res.share_count || 0;
        counts.facebook = count;
        addToShareCount(count);
        updateTooltip();
    });
};

const loadShareCounts = (): void => {
    /* asking for social counts in preview "leaks" upcoming URLs to social sites.
       when they then crawl them they get 404s which affects later sharing.
      don't call counts in preview */
    if (
        config.switches.serverShareCounts &&
        $shareCountEls.length &&
        !config.page.isPreview
    ) {
        try {
            fetch();
        } catch (e) {
            reportError(
                new Error(`Error retrieving share counts (${e.message})`),
                {
                    feature: 'share-count',
                },
                false
            );
        }
    }
};

export { loadShareCounts };
