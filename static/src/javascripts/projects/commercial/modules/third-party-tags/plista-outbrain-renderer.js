// @flow

import externalContentContainerStr from 'raw-loader!common/views/commercial/external-content.html';
import { plista } from 'commercial/modules/third-party-tags/plista';
import { initOutbrain } from 'commercial/modules/third-party-tags/outbrain';
import template from 'lodash/template';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';

export class PlistaOutbrainRenderer {
    edition: string;
    isSwitchOn: boolean;

    constructor() {
        this.edition = config.get('page.edition', '').toLowerCase();
        this.isSwitchOn = config.get('switches.plistaForOutbrainAu');
    }

    findAnchor = (): Promise<HTMLElement | null> => {
        const selector = !(
            config.get('page.seriesId') || config.get('page.blogIds')
        )
            ? '.js-related, .js-outbrain-anchor'
            : '.js-outbrain-anchor';
        return Promise.resolve(document.querySelector(selector));
    };

    renderWidget(widgetType: string, init: any): void {
        const externalTpl = template(externalContentContainerStr);

        this.findAnchor()
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
    }

    render(): void {
        const shouldServePlistaOrOutbrain: boolean =
            this.isSwitchOn && this.edition === 'au';
        if (shouldServePlistaOrOutbrain) {
            const possibleWidgets = ['plista', 'outbrain'];
            const randomWidget =
                possibleWidgets[
                    Math.floor(Math.random() * possibleWidgets.length)
                ];

            if (randomWidget === 'plista') {
                this.renderWidget('plista', plista.init);
            } else {
                this.renderWidget('outbrain', initOutbrain);
            }
        } else {
            this.renderWidget('outbrain', initOutbrain);
        }
    }
}
