// @flow

import mediator from 'lib/mediator';

const GOOGLETAG_CMD_STUBBED = 'googletag-cmd-stubbed';

export const stubGoogletagCmd = (): void => {
    window.googletag = {
        cmd: []
    };
    mediator.emit(GOOGLETAG_CMD_STUBBED);
};

export const awaitGoogletagCmd: Promise<void> = new Promise(resolve => mediator.once(GOOGLETAG_CMD_STUBBED, resolve));
