// @flow
import qwery from 'qwery';
import picturefill from 'lib/picturefill';
import mediator from 'lib/mediator';

const upgradePictures = function(context: any): void {
    picturefill({
        elements: qwery('img[srcset], picture img', context || document),
    });
};

const listen = function(): void {
    mediator.addListeners({
        'ui:images:upgradePictures': upgradePictures,
    });
};

export { upgradePictures, listen };
