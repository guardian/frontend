// @flow
import fastdom from 'fastdom';
import { $ } from 'lib/$';
import mediator from 'lib/mediator';
import userPrefs from 'common/modules/user-prefs';

type ToggleState = 'hidden' | 'displayed';

const prefName = 'container-states';
const toggleText = {
    hidden: 'Show',
    displayed: 'Hide',
};

const btnTmpl = ({ text, dataLink }) => `
    <button class="fc-container__toggle" data-link-name="${dataLink}">
        <span class="fc-container__toggle__text">${text}</span>
    </button>
`;

export class ContainerToggle {
    $container: $;
    state: ToggleState;
    $button: $;
    constructor(container: Element) {
        this.$container = $(container);
        this.$button = $(
            $.create(
                btnTmpl({
                    text: 'Hide',
                    dataLink: 'Show',
                })
            )
        );
        this.state = 'displayed';
    }

    buttonText(): $ {
        return $('.fc-container__toggle__text', this.$button);
    }

    updatePref(id: string): void {
        // update user prefs
        let prefs = userPrefs.get(prefName);
        const prefValue = id;

        if (this.state === 'displayed') {
            delete prefs[prefValue];
        } else {
            if (!prefs) {
                prefs = {};
            }
            prefs[prefValue] = 'closed';
        }
        userPrefs.set(prefName, prefs);
    }

    setState(newState: ToggleState): void {
        this.state = newState;

        fastdom.write(() => {
            // add/remove rolled class
            this.$container[
                this.state === 'displayed' ? 'removeClass' : 'addClass'
            ]('fc-container--rolled-up');
            // data-link-name is inverted, as happens before clickstream
            this.$button.attr(
                'data-link-name',
                toggleText[this.state === 'displayed' ? 'hidden' : 'displayed']
            );
            this.buttonText().text(toggleText[this.state]);
        });
    }

    readPrefs(id: string): void {
        // update user prefs
        const prefs = userPrefs.get(prefName);
        if (prefs && prefs[id]) {
            this.setState('hidden');
        }
    }

    addToggle(): void {
        // append toggle button
        const id = this.$container.attr('data-id');
        const $containerHeader = $('.js-container__header', this.$container[0]);

        fastdom.write(() => {
            $containerHeader.append(this.$button);
            this.$container
                .removeClass('js-container--toggle')
                .removeClass('fc-container--will-have-toggle')
                .addClass('fc-container--has-toggle');

            this.readPrefs(id);
        });

        mediator.on('module:clickstream:click', clickSpec => {
            if (clickSpec.target === this.$button[0]) {
                this.setState(
                    this.state === 'displayed' ? 'hidden' : 'displayed'
                );
                this.updatePref(id);
            }
        });
    }
}
