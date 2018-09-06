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
            hasConsented: props.hasConsented
        }
    }

    follow = () => {
        this.setState({
            hasCreatedAccount: true,
        });
    };

    unFollow = () => {
        this.setState({
            hasCreatedAccount: true,
        });
    };

    render(parent?: HTMLElement) {
        const { consent, hasConsented } = this.state;
        return (
            <div className="identity-upsell-consent-card">
                {consent.name} <br />
                {consent.text} <br />
                <FollowButtonWrap
                    initiallyFollowing={hasConsented}
                    onFollow={() => {
                        this.follow();
                    }}
                    onUnfollow={() => {
                        this.unFollow();
                    }}
                />
            </div>
        );
    }
}

export { ConsentCard, Consent };
