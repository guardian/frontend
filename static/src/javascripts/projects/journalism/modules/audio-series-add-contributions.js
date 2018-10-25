// @flow

import fastdom from 'lib/fastdom-promise';
import audioContribBanner from 'raw-loader!journalism/views/audioSeriesContributions.html';

const renderContributionsBanner = el => {
    fastdom.write(() => {
        el.insertAdjacentHTML('afterend', audioContribBanner);
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
