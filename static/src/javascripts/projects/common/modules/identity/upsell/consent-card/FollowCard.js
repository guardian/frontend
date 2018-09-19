// @flow
import React from 'preact-compat';
import { FollowButtonWrap } from 'common/modules/identity/follow/FollowButtonWrap';
import type { Consent } from '../store/consents';

export type FollowCardProps = {
    consent: Consent,
    onChange: boolean => void,
    hasConsented: boolean,
};

const FollowCard = (props: FollowCardProps) => {
    const { hasConsented } = props;
    const { name, description } = props.consent;
    return (
        <div className="identity-upsell-consent-card">
            <h1 className="identity-upsell-consent-card__title">{name}</h1>
            <p className="identity-upsell-consent-card__description">
                {description}
            </p>
            <FollowButtonWrap
                following={hasConsented}
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
