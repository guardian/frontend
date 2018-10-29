// @flow

import fastdom from 'lib/fastdom-promise';
import template from 'lodash/template';
import audioContribBanner from 'raw-loader!journalism/views/audioSeriesContributions.html';
import { supportContributeURL } from '../../common/modules/commercial/support-utilities';

const renderContributionsBanner = el => {
    const banner = template(audioContribBanner)({ supportContributeURL });

    fastdom.write(() => {
        el.insertAdjacentHTML('afterend', banner);
    });
};

export const addContributionsBanner = () => {
    const fifthEpisode = document.querySelector(
        'section.fc-container--tag:nth-of-type(5)'
    );

    if (fifthEpisode) {
        renderContributionsBanner(fifthEpisode);
    }
};
