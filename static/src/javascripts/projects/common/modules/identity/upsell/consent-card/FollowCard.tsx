
import React from "preact-compat";
import { FollowButtonWrap } from "common/modules/identity/upsell/button/FollowButtonWrap";
import { Consent } from "../store/types";

export type FollowCardProps = {
  consent: Consent;
  onChange: (arg0: boolean) => void;
  hasConsented: boolean;
};

const FollowCard = (props: FollowCardProps) => {
  const {
    hasConsented
  } = props;
  const {
    name,
    description
  } = props.consent;
  return <div className="identity-upsell-consent-card">
            <h1 className="identity-upsell-consent-card__title">{name}</h1>
            <p className="identity-upsell-consent-card__description">
                {description}
            </p>
            <div className="identity-upsell-consent-card__footer">
                <FollowButtonWrap trackingName={name} following={hasConsented} onFollow={() => {
        props.onChange(true);
      }} onUnfollow={() => {
        props.onChange(false);
      }} />
            </div>
        </div>;
};

export { FollowCard };