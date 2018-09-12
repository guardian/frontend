// @flow
import React from 'preact-compat';
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

const FollowCard = <T: CardLike>(props: Followable<T>) => {
    const { isFollowing } = props;
    const { name, description } = props.value;
    return (
        <div className="identity-upsell-consent-card">
            <h1 className="identity-upsell-consent-card__title">{name}</h1>
            <p className="identity-upsell-consent-card__description">
                {description}
            </p>
            <FollowButtonWrap
                following={isFollowing}
                onFollow={() => {
                    props.onChange(true);
                }}
                onUnfollow={() => {
                    props.onChange(false);
                }}
            />
        </div>
    );
};

export { FollowCard };
