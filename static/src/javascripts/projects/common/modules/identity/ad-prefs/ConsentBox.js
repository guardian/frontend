import React, { Component } from 'preact-compat';
import { getConsentWording } from './wordings';



class ConsentRadioButton extends Component {
    handleChange(event) {
        if (event.target.checked) {
            this.props.onToggle();
        }
    }
    render() {
        const id = `gu-ad-prefs-${this.props.value.toString()}-${
            this.props.consent.cookie
        }`;
        const name = `gu-ad-prefs-${this.props.consent.cookie}`;

        return (
            <div className="identity-ad-prefs-input identity-ad-prefs-manager">
                <label className="identity-ad-prefs-input__label" htmlFor={id}>
                    <input
                        type="radio"
                        name={name}
                        id={id}
                        data-link-name={`ad-prefs - ${
                            this.props.consent.cookie
                        } - ${this.props.value.toString()}`}
                        value={this.props.value.toString()}
                        checked={this.props.checked}
                        onChange={this.handleChange.bind(this)}
                    />
                    <span>{this.props.wording.title}</span>
                </label>
                {this.props.wording.text && (
                    <span
                        className="identity-ad-prefs-input__wording"
                        dangerouslySetInnerHTML={{
                            __html: this.props.wording.text,
                        }}
                    />
                )}
            </div>
        );
    }
}

class ConsentBox extends Component {
    render() {
        const wording = getConsentWording(this.props.consent);

        return (
            <fieldset>
                <legend className="identity-title identity-title--small">
                    {wording.question.title}
                </legend>
                {wording.question.text && (
                    <div className="identity-ad-prefs-input__wording">
                        {wording.question.text}
                    </div>
                )}

                <div className="identity-ad-prefs-options">
                    <ConsentRadioButton
                        value="true"
                        wording={wording.yesCheckbox}
                        checked={this.props.state === true}
                        consent={this.props.consent}
                        onToggle={() => this.props.onUpdate(true)}
                    />
                    <ConsentRadioButton
                        value="false"
                        wording={wording.noCheckbox}
                        checked={this.props.state === false}
                        consent={this.props.consent}
                        onToggle={() => this.props.onUpdate(false)}
                    />
                </div>
            </fieldset>
        );
    }
}

export { ConsentBox };
