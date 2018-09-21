// @flow
import React, { Component } from 'preact-compat';

type FollowButtonWrapProps = {
    following: boolean,
    onFollow: () => Promise<void>,
    onUnfollow: () => Promise<void>,
    trackingName: ?string,
};

type FollowButtonWrapState = {
    mousedOutOnce: boolean,
};

class FollowButtonWrap extends Component<
    FollowButtonWrapProps,
    FollowButtonWrapState
> {
    constructor(props: FollowButtonWrapProps) {
        super(props);
        this.setState({
            mousedOutOnce: false,
        });
    }

    onMouseOut = () => {
        this.setState({
            mousedOutOnce: true,
        });
    };

    updateFollowing = (to: boolean) => {
        if (to) {
            this.props.onFollow();
        } else {
            this.props.onUnfollow();
        }
        this.setState({
            mousedOutOnce: false,
        });
    };

    render() {
        const { following, trackingName } = this.props;
        const { mousedOutOnce } = this.state;
        if (following) {
            return (
                <div
                    aria-live="polite"
                    className={[
                        'identity-upsell-follow-button-wrap',
                        mousedOutOnce
                            ? ''
                            : 'identity-upsell-follow-button-wrap--blocked',
                    ].join(' ')}
                    onMouseOut={() => {
                        this.onMouseOut();
                    }}
                    onBlur={() => {
                        this.onMouseOut();
                    }}>
                    <div
                        role="alert"
                        className={[
                            'manage-account__button',
                            'manage-account__button--secondary',
                            'manage-account__button--center',
                            'identity-upsell-follow-button-wrap__button',
                        ].join(' ')}>
                        Signed up
                    </div>
                    <button
                        data-link-name={
                            trackingName
                                ? `upsell-consent : ${trackingName} : untick`
                                : false
                        }
                        type="button"
                        className={[
                            'manage-account__button',
                            'manage-account__button--danger',
                            'manage-account__button--center',
                            'identity-upsell-follow-button-wrap__button',
                            'identity-upsell-follow-button-wrap__button--longer',
                            'identity-upsell-follow-button-wrap__button--hoverable',
                        ].join(' ')}
                        onClick={() => {
                            this.updateFollowing(false);
                        }}>
                        Unsubscribe
                    </button>
                </div>
            );
        }

        return (
            <button
                data-link-name={
                    trackingName
                        ? `upsell-consent : ${trackingName} : tick`
                        : false
                }
                type="button"
                className="manage-account__button manage-account__button--green"
                onClick={() => {
                    this.updateFollowing(true);
                }}>
                Sign me up
            </button>
        );
    }
}

export { FollowButtonWrap };
