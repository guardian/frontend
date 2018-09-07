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
                    onClick={() => {
                        this.updateFollowing(false);
                    }}>
                    Following – click to unfollow
                </button>
            );
        }

        return (
            <button
                type="button"
                onClick={() => {
                    this.updateFollowing(true);
                }}>
                Follow
            </button>
        );
    }
}

export { FollowButtonWrap };
