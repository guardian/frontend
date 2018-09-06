// @flow
import React, { Component } from 'preact-compat';
import { FollowButtonWrap } from 'common/modules/identity/follow/FollowButtonWrap';

type Consent = {
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
                {this.props.consent.name} <br />
                {this.props.consent.text} <br />
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
