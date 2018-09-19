// @flow
import React, { Component } from 'preact-compat';

type FollowButtonWrapProps = {
    following: boolean,
    onFollow: () => Promise<void>,
    onUnfollow: () => Promise<void>,
};

class FollowButtonWrap extends Component<FollowButtonWrapProps, {}> {
    updateFollowing = (to: boolean) => {
        if (to) {
            this.props.onFollow();
        } else {
            this.props.onUnfollow();
        }
    };

    render() {
        if (this.props.following === true) {
            return (
                <button
                    type="button"
                    className={'manage-account__button manage-account__button--secondary'}
                    onClick={() => {
                        this.updateFollowing(false);
                    }}>
                    Signed up – click to undo
                </button>
            );
        }

        return (
            <button
                type="button"
                className={'manage-account__button manage-account__button--green'}
                onClick={() => {
                    this.updateFollowing(true);
                }}>
                Sign me up
            </button>
        );
    }
}

export { FollowButtonWrap };
