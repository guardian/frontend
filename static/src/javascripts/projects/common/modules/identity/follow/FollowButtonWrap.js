import React, { Component } from 'preact-compat';

type FollowButtonWrapProps = {
    initiallyFollowing: boolean,
    onFollow: () => void,
    onUnfollow: () => void,
};

class FollowButtonWrap extends Component<FollowButtonWrapProps, {
    following: boolean
}> {

    constructor(props: FollowButtonWrapProps): void {
        super(props);
        this.state = {
            following: props.initiallyFollowing,
        };
    }

    updateFollowing = (to: boolean) => {
        this.setState({following: to});
        if(to){
            this.props.onFollow();
        }
        else {
            this.props.onUnfollow();
        }
    };

    render() {
        if (this.state.following === true) {
            return (
                <button type="button" onClick={(ev)=>{this.updateFollowing(false)}}>
                    Following – click to unfollow
                </button>
            )
        }
        else {
            return (
                <button type="button" onClick={(ev)=>{this.updateFollowing(true)}}>
                    Follow
                </button>
            );
        }
    }
}

export { FollowButtonWrap };
