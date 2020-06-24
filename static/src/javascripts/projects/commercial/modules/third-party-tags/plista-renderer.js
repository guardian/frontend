// @flow

import externalContentContainerStr from 'raw-loader!common/views/commercial/external-content.html';
import { plista } from 'commercial/modules/third-party-tags/plista';
import template from 'lodash/template';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';

const findAnchor = (): Promise<HTMLElement | null> => {
    const selector = !(
        config.get('page.seriesId') || config.get('page.blogIds')
    )
        ? '.js-related, .js-outbrain-anchor'
        : '.js-outbrain-anchor';
    return Promise.resolve(document.querySelector(selector));
};

const renderWidget = (widgetType: string, init: any): Promise<void> => {
    const externalTpl = template(externalContentContainerStr);
    return findAnchor()
        .then(anchorNode =>
            fastdom.write(() => {
                $(anchorNode).after(
                    externalTpl({
                        widgetType,
                    })
                );
            })
        )
        .then(init);
};

const init = (): Promise<void> => {
    /*
        The `config.set` instances in this function are injecting debuging information into window.guardian.config.debug
        This will be used for investigations
    */

    const edition = config.get('page.edition', '').toLowerCase();
    const isSwitchOn = config.get('switches.plistaForAu');
    const shouldUsePlista: boolean = isSwitchOn && edition === 'au';

    if (shouldUsePlista) {
        return renderWidget('plista', plista.init);
    }

    return Promise.resolve();
};

export { init };
