// @flow
import React, { Component } from 'preact-compat';
import { FollowButtonWrap } from 'common/modules/identity/follow/FollowButtonWrap';
import { setConsent } from 'common/modules/identity/api';

export type Consent = {
    id: string,
    name: string,
    description: string,
    isOptOut: boolean,
    isChannel: boolean,
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
        setConsent(this.props.consent.id, !hasConsented).then(() => {
            this.setState({
                hasConsented: !hasConsented,
            });
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
                    {this.props.consent.description}
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
