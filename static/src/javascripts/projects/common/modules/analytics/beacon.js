// @flow

import config from 'lib/config';
import fetch from 'lib/fetch';

const fire = (path: string): Image => {
    const img = new Image();

    img.src = config.get('page.beaconUrl') + path;

    return img;
};

const postJson = (path: string, jsonString: string): void => {
    const url =
        config
            .get('page.beaconUrl', '')
            .replace(/^\/\//, `${window.location.protocol}//`) + path;

    fetch(url, {
        method: 'post',
        header: {
            'Content-Type': 'application/json',
        },
        body: jsonString,
        mode: 'cors',
    });
};

export { fire, postJson };
