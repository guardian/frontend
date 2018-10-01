// @flow
import React, { Component } from 'preact-compat';
import envelopeRemove from 'svgs/icon/envelope-remove.svg';
import envelopeAdd from 'svgs/icon/envelope-add.svg';
import tick from 'svgs/icon/tick.svg';

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
            mousedOutOnce: true,
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
        return (following) ?
            (
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
                            'manage-account__button--icon-left',
                            'identity-upsell-follow-button-wrap__button',
                        ].join(' ')}>
                                                <span
                                                    className="manage-account__button-react-icon"
                                                    dangerouslySetInnerHTML={{ __html: tick.markup }}
                                                />
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
                            'manage-account__button--icon-left',
                            'manage-account__button--center',
                            'identity-upsell-follow-button-wrap__button',
                            'identity-upsell-follow-button-wrap__button--longer',
                            'identity-upsell-follow-button-wrap__button--hoverable',
                        ].join(' ')}
                        onClick={() => {
                            this.updateFollowing(false);
                        }}>
                        <span
                            className="manage-account__button-react-icon"
                            dangerouslySetInnerHTML={{ __html: envelopeRemove.markup }}
                        />
                        Unsubscribe
                    </button>
                </div>
            ) : (
            <button
                data-link-name={
                    trackingName
                        ? `upsell-consent : ${trackingName} : tick`
                        : false
                }
                type="button"
                className={['manage-account__button','manage-account__button--green','manage-account__button--icon-left'].join(' ')}
                onClick={() => {
                    this.updateFollowing(true);
                }}>
                <span
                    className="manage-account__button-react-icon"
                    dangerouslySetInnerHTML={{ __html: envelopeAdd.markup }}
                />
                Sign me up
            </button>
        );
    }
}

export { FollowButtonWrap };
