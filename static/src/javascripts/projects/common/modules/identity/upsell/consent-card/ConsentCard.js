// @flow
import React, { Component } from 'preact-compat';
import { FollowButtonWrap } from 'common/modules/identity/follow/FollowButtonWrap';

export type Consent = {
    id: string,
    name: string,
    text: string,
};

type ConsentCardProps = {
    consent: Consent,
    hasConsented: boolean,
};

class ConsentCard extends Component<
    ConsentCardProps,
    {
        hasConsented: boolean,
    }
> {
    constructor(props: ConsentCardProps) {
        super(props);
        this.state = {
            hasConsented: props.hasConsented,
        };
    }

    toggleConsent = () => {
        const { hasConsented } = this.state;
        this.setState({
            hasConsented: !hasConsented,
        });
    };

    render() {
        const { hasConsented } = this.state;
        return (
            <div className="identity-upsell-consent-card">
                <h1 className="identity-upsell-consent-card__title">
                    {this.props.consent.name}
                </h1>
                <p className="identity-upsell-consent-card__description">
                    {this.props.consent.text}
                </p>
                <FollowButtonWrap
                    initiallyFollowing={hasConsented}
                    onFollow={() => {
                        this.toggleConsent();
                    }}
                    onUnfollow={() => {
                        this.toggleConsent();
                    }}
                />
            </div>
        );
    }
}

export { ConsentCard };
