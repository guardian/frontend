// @flow
import React, { Component } from 'react';
import { render } from 'react-dom';
import {
    getPopularFiltered,
    deleteFromSummary,
    showInMegaNav,
    showInMegaNavEnable,
    showInMegaNavEnabled,
} from 'common/modules/onward/history';

class SummaryTagsList extends Component<*, *> {
    constructor() {
        super();
        this.state = {
            popular: getPopularFiltered(),
        };
    }

    handleRemove(tag: string) {
        deleteFromSummary(tag);
        this.setState({
            popular: getPopularFiltered({ flush: true }),
        });
        showInMegaNav();
    }

    render() {
        const tagElements = this.state.popular.map(tag => (
            <span
                className="button button--small button--tag button--secondary"
                key={tag[0]}>
                <button
                    onClick={this.handleRemove.bind(this, tag[0])}
                    data-link-name={`remove | ${tag[1]}`}>
                    X
                </button>
                <a href={`/${tag[0]}`}>{tag[1]}</a>
            </span>
        ));

        let helperText;

        if (!tagElements.length) {
            helperText = "(You don't have any recently visited topics.)";
        } else {
            helperText =
                "Remove individual topics by clicking 'X' or switch off the functionality below. We respect your privacy and your shortcuts will never be made public.";
        }
        tagElements.push(<p key="helper-text">{helperText}</p>);

        return <div>{tagElements}</div>;
    }
}

class SummaryTagsSettings extends Component<*, *> {
    constructor() {
        super();
        this.state = {
            enabled: showInMegaNavEnabled(),
        };
    }

    handleToggle() {
        const isEnabled = !this.state.enabled;

        this.setState({
            enabled: isEnabled,
        });
        showInMegaNavEnable(isEnabled);
    }

    render() {
        const toggleAction = this.state.enabled ? 'OFF' : 'ON';

        return (
            <div data-link-name="suggested links">
                <p>
                    These are based on the topics you visit most. You can access
                    them at any time by opening the &quot;all sections&quot;
                    menu.
                </p>
                {this.state.enabled ? <SummaryTagsList /> : null}
                <button
                    onClick={this.handleToggle.bind(this)}
                    className="button button--medium button--primary"
                    data-link-name={toggleAction}>
                    Switch recently visited links {toggleAction}
                </button>
            </div>
        );
    }
}

const init = (): void => {
    const placeholder: ?HTMLElement = document.getElementById(
        'preferences-history-tags'
    );

    if (placeholder) {
        render(<SummaryTagsSettings />, placeholder);
    }
};

export { init };
