import { supportContributeURL } from 'common/modules/commercial/support-utilities';
import fastdom from 'lib/fastdom-promise';
import template from 'lodash/template';
import audioContribBanner from 'raw-loader!journalism/views/audioSeriesContributions.html';

const renderContributionsBanner = (el) => {
    const banner = template(audioContribBanner)({
        supportContributeURL: supportContributeURL(),
    });

    fastdom.mutate(() => {
        el.insertAdjacentHTML('afterend', banner);
    });
};

export const addContributionsBanner = () => {
    const allEpisodes = document.querySelectorAll('section.fc-container--tag');

    if (allEpisodes.length >= 5) {
        renderContributionsBanner(allEpisodes[4]);
    }
};
