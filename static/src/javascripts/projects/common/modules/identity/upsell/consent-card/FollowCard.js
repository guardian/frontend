// @flow
import React, { Component } from 'preact-compat';
import { FollowButtonWrap } from 'common/modules/identity/follow/FollowButtonWrap';

/**
 * Type for things that can be rendered in a Follow Card
 */
export type CardLike = {
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

export type Followable<T: CardLike> = {
    value: T,
    onChange: boolean => void,
};

type FollowCardProps<T: CardLike> = {
    followable: Followable<T>,
    hasFollowed: boolean,
};

class FollowCard<T: CardLike> extends Component<FollowCardProps<T>, {}> {
    render() {
        const { hasFollowed } = this.props;
        return (
            <div className="identity-upsell-consent-card">
                <h1 className="identity-upsell-consent-card__title">
                    {this.props.followable.value.name}
                </h1>
                <p className="identity-upsell-consent-card__description">
                    {this.props.followable.value.description}
                </p>
                <FollowButtonWrap
                    following={hasFollowed}
                    onFollow={() => {
                        this.props.followable.onChange(
                            true,
                            this.props.followable.value
                        );
                    }}
                    onUnfollow={() => {
                        this.props.followable.onChange(
                            false,
                            this.props.followable.value
                        );
                    }}
                />
            </div>
        );
    }
}

export { FollowCard };
