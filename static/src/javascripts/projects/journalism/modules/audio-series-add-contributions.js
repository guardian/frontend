// @flow

import fastdom from 'lib/fastdom-promise';
import template from 'lodash/template';
import audioContribBanner from 'raw-loader!journalism/views/audioSeriesContributions.html';
import { supportContributeURL } from 'common/modules/commercial/support-utilities';

const renderContributionsBanner = el => {
    const banner = template(audioContribBanner)({
        supportContributeURL: supportContributeURL(),
    });

    fastdom.write(() => {
        el.insertAdjacentHTML('afterend', banner);
    });
};

export const addContributionsBanner = () => {
    const allEpisodes = document.querySelectorAll('section.fc-container--tag');

    if (allEpisodes.length >= 5) {
        renderContributionsBanner(allEpisodes[4]);
    }
};
