
import React, { Component } from "preact-compat";
import envelopeRemove from "svgs/icon/envelope-remove.svg";
import envelopeAdd from "svgs/icon/envelope-add.svg";
import tick from "svgs/icon/tick.svg";

const getButtonClassNames = (...modifiers: string[]) => ['manage-account__button', ...modifiers.map(m => `manage-account__button--${m}`)];

type FollowButtonWrapProps = {
  following: boolean;
  onFollow: () => Promise<void>;
  onUnfollow: () => Promise<void>;
  trackingName: string | null | undefined;
};

type FollowButtonWrapState = {
  mousedOutOnce: boolean;
};

class FollowButtonWrap extends Component<FollowButtonWrapProps, FollowButtonWrapState> {

  constructor(props: FollowButtonWrapProps) {
    super(props);
    this.setState({
      mousedOutOnce: true
    });
  }

  onMouseOut = () => {
    this.setState({
      mousedOutOnce: true
    });
  };

  updateFollowing = (to: boolean) => {
    if (to) {
      this.props.onFollow();
      this.setState({
        mousedOutOnce: false
      });
    } else {
      this.props.onUnfollow();
    }
  };

  render() {
    const {
      following,
      trackingName
    } = this.props;
    const {
      mousedOutOnce
    } = this.state;

    const followingFeedbackButton = (...classNames: string[]) => <div role="alert" className={[...getButtonClassNames('green-secondary', 'center', 'icon-left'), ...classNames].join(' ')}>
                <span className="manage-account__button-react-icon" dangerouslySetInnerHTML={{ __html: tick.markup }} />
                Signed up
            </div>;

    const unfollowButton = (...classNames: string[]) => <button data-link-name={trackingName ? `upsell-consent : ${trackingName} : untick` : false} type="button" className={[...getButtonClassNames('danger', 'center', 'icon-left'), ...classNames].join(' ')} onClick={() => {
      this.updateFollowing(false);
    }}>
                <span className="manage-account__button-react-icon" dangerouslySetInnerHTML={{
        __html: envelopeRemove.markup
      }} />
                Unsubscribe
            </button>;

    const followButton = () => <button data-link-name={trackingName ? `upsell-consent : ${trackingName} : tick` : false} type="button" className={getButtonClassNames('green', 'icon-left').join(' ')} onClick={() => {
      this.updateFollowing(true);
    }}>
                <span className="manage-account__button-react-icon" dangerouslySetInnerHTML={{ __html: envelopeAdd.markup }} />
                Sign me up
            </button>;

    return following ? <div aria-live="polite" className={['identity-upsell-follow-button-wrap', mousedOutOnce ? '' : 'identity-upsell-follow-button-wrap--blocked'].join(' ')} onMouseOut={() => {
      this.onMouseOut();
    }} onBlur={() => {
      this.onMouseOut();
    }}>
                {followingFeedbackButton('identity-upsell-follow-button-wrap__button')}
                {unfollowButton('identity-upsell-follow-button-wrap__button', 'identity-upsell-follow-button-wrap__button--longer', 'identity-upsell-follow-button-wrap__button--hoverable')}
            </div> : followButton();
  }
}

export { FollowButtonWrap };