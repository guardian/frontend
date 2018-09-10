// @flow
import React, { Component } from 'preact-compat';
import { FollowButtonWrap } from 'common/modules/identity/follow/FollowButtonWrap';

/**
 * Things that are Followable, i.e. Consents and EmailNewsletters.
 */
export type Followable = {
    id: string,
    name: string,
    description: string,
};

export type Consent = {
    id: string,
    name: string,
    description: string,
    isOptOut: boolean,
    isChannel: boolean,
};

type FollowCardProps = {
    followable: Followable,
    hasFollowed: boolean,
    onToggleFollow: boolean => void,
};

class FollowCard extends Component<FollowCardProps, {}> {
    render() {
        const { hasFollowed } = this.props;
        return (
            <div className="identity-upsell-consent-card">
                <h1 className="identity-upsell-consent-card__title">
                    {this.props.followable.name}
                </h1>
                <p className="identity-upsell-consent-card__description">
                    {this.props.followable.description}
                </p>
                <FollowButtonWrap
                    following={hasFollowed}
                    onFollow={() => {
                        this.props.onToggleFollow(true);
                    }}
                    onUnfollow={() => {
                        this.props.onToggleFollow(false);
                    }}
                />
            </div>
        );
    }
}

export { FollowCard };
