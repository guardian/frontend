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

export type Followable<T: CardLike> = {
    value: T,
    onChange: boolean => void,
    isFollowing: boolean,
};

class FollowCard<T: CardLike> extends Component<Followable<T>, {}> {
    render() {
        const { isFollowing } = this.props;
        const { name, description } = this.props.value;
        return (
            <div className="identity-upsell-consent-card">
                <h1 className="identity-upsell-consent-card__title">{name}</h1>
                <p className="identity-upsell-consent-card__description">
                    {description}
                </p>
                <FollowButtonWrap
                    following={isFollowing}
                    onFollow={() => {
                        this.props.onChange(true);
                    }}
                    onUnfollow={() => {
                        this.props.onChange(false);
                    }}
                />
            </div>
        );
    }
}

export { FollowCard };
