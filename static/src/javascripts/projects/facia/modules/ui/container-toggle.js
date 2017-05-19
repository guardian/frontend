// @flow
import bonzo from 'bonzo';
import fastdom from 'fastdom';
import $ from 'lib/$';
import mediator from 'lib/mediator';
import userPrefs from 'common/modules/user-prefs';
import template from 'lodash/utilities/template';
import { inlineSvg } from 'common/views/svgs';
import btnTmpl from 'raw-loader!facia/views/button-toggle.html';

type ToggleState = 'hidden' | 'displayed';
export class ContainerToggle {
    $container: bonzo;
    state: ToggleState;
    constructor(container: Element) {
        this.$container = bonzo(container);
        this.addToggle();
    }

    static $button = bonzo(
        bonzo.create(
            template(btnTmpl, {
                text: 'Hide',
                dataLink: 'Show',
                icon: inlineSvg('arrowicon'),
            })
        )
    );
    static buttonText = $(
        '.fc-container__toggle__text',
        ContainerToggle.$button[0]
    );
    static prefName = 'container-states';
    static toggleText = {
        hidden: 'Show',
        displayed: 'Hide',
    };

    updatePref = (id: string): void => {
        // update user prefs
        let prefs = userPrefs.get(ContainerToggle.prefName);
        const prefValue = id;
        if (this.state === 'displayed') {
            delete prefs[prefValue];
        } else {
            if (!prefs) {
                prefs = {};
            }
            prefs[prefValue] = 'closed';
        }
        userPrefs.set(ContainerToggle.prefName, prefs);
    };

    setState = (newState: ToggleState): void => {
        this.state = newState;

        fastdom.write(() => {
            // add/remove rolled class
            this.$container[
                this.state === 'displayed' ? 'removeClass' : 'addClass'
            ]('fc-container--rolled-up');
            // data-link-name is inverted, as happens before clickstream
            ContainerToggle.$button.attr(
                'data-link-name',
                ContainerToggle.toggleText[
                    this.state === 'displayed' ? 'hidden' : 'displayed'
                ]
            );
            ContainerToggle.buttonText.text(
                ContainerToggle.toggleText[this.state]
            );
        });
    };

    readPrefs = (id: string): void => {
        // update user prefs
        const prefs = userPrefs.get(ContainerToggle.prefName);
        if (prefs && prefs[id]) {
            this.setState('hidden');
        }
    };

    addToggle = (): void => {
        // append toggle button
        const id = this.$container.attr('data-id');
        const $containerHeader = $('.js-container__header', this.$container[0]);

        fastdom.write(() => {
            $containerHeader.append(ContainerToggle.$button);
            this.$container
                .removeClass('js-container--toggle')
                .addClass('fc-container--has-toggle');
            this.readPrefs(id);
        });

        mediator.on('module:clickstream:click', clickSpec => {
            if (clickSpec.target === ContainerToggle.$button[0]) {
                this.setState(
                    this.state === 'displayed' ? 'hidden' : 'displayed'
                );
                this.updatePref(id);
            }
        });
    };
}
