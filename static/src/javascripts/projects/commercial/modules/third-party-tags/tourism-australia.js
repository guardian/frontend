// @flow
import config from 'lib/config';

const getUrl = location => {
    const taPartner = 'partner:guardian-uk';
    const taAccount = config.page.isDev
        ? 'tuata-dev-internal'
        : 'tuatourism-australia-global';
    const taPageName = `${taPartner}:${location.pathname}`;
    const taServer = location.hostname;
    const taUrl = location.href;
    const taCachebreak = new Date().getTime();

    return `//tourismaustralia.sc.omtrdc.net/b/ss/${taAccount}/1/H.26.2/s${taCachebreak}?AQB=1&ndh=0&ns=tourismaustralia&pageName=${encodeURIComponent(
        taPageName
    )}&g= ${encodeURIComponent(taUrl)}&server=${encodeURIComponent(
        taServer
    )}&v11=${encodeURIComponent(taPartner)}&AQE=1`;
};

const shouldRun: boolean =
    config.page.section === 'ashes-australia-travel' &&
    config.switches.tourismAustralia;

const url: string = getUrl(window.location);

export const tourismAustralia: ThirdPartyTag = {
    shouldRun,
    url,
    useImage: true,
};
