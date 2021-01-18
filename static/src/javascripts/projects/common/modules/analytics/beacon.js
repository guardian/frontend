import config from 'lib/config';
import fetch from 'lib/fetch';

const fire = (path) => {
    const img = new Image();

    img.src = config.get('page.beaconUrl') + path;

    return img;
};

const postJson = (path, jsonString) => {
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
