// @flow

import React, { Component } from 'react';
import { render } from 'react-dom';
import fastdom from 'lib/fastdom-promise';
import {
    getProviderState,
    setProviderState,
    adProviders,
} from './ad-prefs.lib';

const rootSelector: string = '.js-manage-account__ad-prefs';

class ConsentRadioButton extends Component<*, *> {
    handleChange(event) {
        if (event.target.checked) {
            this.props.onToggle();
        }
    }
    render() {
        const id = `gu-ad-prefs-${this.props.value.toString()}-${
            this.props.provider.id
        }`;
        const name = `gu-ad-prefs-${this.props.provider.id}`;

        return (
            <div>
                <label htmlFor={id}>
                    <input
                        type="radio"
                        name={name}
                        id={id}
                        value={this.props.value.toString()}
                        checked={this.props.checked}
                        onChange={this.handleChange.bind(this)}
                    />
                    {this.props.label}
                </label>
            </div>
        );
    }
}

class ConsentBox extends Component<*, *> {
    constructor(props) {
        super(props);
        this.state = {
            providerState: getProviderState(this.props.provider.id),
        };
    }

    setProviderState(state: boolean) {
        setProviderState(this.props.provider.id, state);
        this.setState({
            providerState: getProviderState(this.props.provider.id),
        });
    }

    render() {
        return (
            <fieldset>
                <legend>
                    Allow personalised ads from {this.props.provider.label}
                </legend>
                <div>
                    <ConsentRadioButton
                        label="Turn on"
                        value
                        checked={this.state.providerState === true}
                        provider={this.props.provider}
                        onToggle={() => this.setProviderState(true)}
                    />
                    <ConsentRadioButton
                        label="Turn off"
                        value={false}
                        checked={this.state.providerState === false}
                        provider={this.props.provider}
                        onToggle={() => this.setProviderState(false)}
                    />
                </div>
            </fieldset>
        );
    }
}

class ConsentBoxes extends Component<*, *> {
    render() {
        return (
            <div>
                {adProviders.map(provider => (
                    <ConsentBox provider={provider} key={provider.id} />
                ))}
            </div>
        );
    }
}

const enhanceAdPrefs = (): void => {
    fastdom
        .read(() => document.querySelectorAll(rootSelector))
        .then((wrapperEls: HTMLElement[]) => {
            wrapperEls.forEach(_ => {
                fastdom.write(() => {
                    _.classList.remove('is-hidden');
                    render(<ConsentBoxes />, _);
                });
            });
        });
};

export { enhanceAdPrefs };
