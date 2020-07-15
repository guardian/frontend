// @flow

import appboy from '@braze/web-sdk';

const apiKey = 'XXX';
const brazeUuid = 'XXX';

export const init = () => {
    console.log("Initializing Braze", appboy);

    appboy.initialize(apiKey, {
        enableLogging: true,
        noCookies: true,
        baseUrl: 'https://sdk.fra-01.braze.eu/api/v3',
        enableHtmlInAppMessages: true
    });

    const f = function(configuration){
        console.log(configuration);
        appboy.display.showInAppMessage(configuration);
        return true;
    }

    appboy.subscribeToInAppMessage(f);

    appboy.changeUser(brazeUuid);
    appboy.openSession();

    return Promise.resolve();
}
