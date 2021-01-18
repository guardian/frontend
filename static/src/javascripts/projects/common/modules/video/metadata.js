import config from 'lib/config';
import fetch from 'lib/fetch';
import fetchJSON from 'lib/fetch-json';


const isGeoBlocked = (el) => {
    const source = el.currentSrc;

    // we currently only block to the uk
    // these files are placed in a special location
    if (!source.includes('/ukonly/')) {
        return Promise.resolve(false);
    }

    return new Promise(resolve => {
        fetch(source, {
            mode: 'cors',
            method: 'head',
        })
            .then(() => resolve(false))
            .catch(res => resolve(res.status === 403));
    });
};

const getVideoInfo = (el) => {
    const dataset = el.dataset;
    const embedPath = dataset.embedPath;
    const canonicalUrl = dataset.canonicalUrl || (embedPath || null);
    const defaultVideoInfo = {
        expired: false,
        shouldHideAdverts: dataset.blockVideoAds !== 'false',
    };

    if (!canonicalUrl) {
        return Promise.resolve(defaultVideoInfo);
    }

    // We only have the canonical URL in videos embedded in articles / main media.
    // These are set to the safest defaults that will always play video.
    const url = `${config.get('page.ajaxUrl')}/${canonicalUrl}/info.json`;

    return new Promise(resolve => {
        fetchJSON(url, {
            mode: 'cors',
        })
            .then(resolve)
            .catch(() => resolve(defaultVideoInfo));
    });
};

export { getVideoInfo, isGeoBlocked };
