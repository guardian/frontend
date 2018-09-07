// @flow
import React, { Component } from 'preact-compat';
import { FollowButtonWrap } from 'common/modules/identity/follow/FollowButtonWrap';

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
    onToggleConsent: boolean => void,
};

class ConsentCard extends Component<ConsentCardProps, {}> {
    render() {
        const { hasConsented } = this.props;
        return (
            <div className="identity-upsell-consent-card">
                <h1 className="identity-upsell-consent-card__title">
                    {this.props.consent.name}
                </h1>
                <p className="identity-upsell-consent-card__description">
                    {this.props.consent.description}
                </p>
                <FollowButtonWrap
                    following={hasConsented}
                    onFollow={() => {
                        this.props.onToggleConsent(true);
                    }}
                    onUnfollow={() => {
                        this.props.onToggleConsent(false);
                    }}
                />
            </div>
        );
    }
}

export { ConsentCard };
