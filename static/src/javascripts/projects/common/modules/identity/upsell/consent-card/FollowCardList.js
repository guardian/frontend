// @flow
import React, { Component } from 'preact-compat';
import { FollowCard } from 'common/modules/identity/upsell/consent-card/FollowCard';
// import {
//     get as getConsents,
//     updateRemotely,
// } from 'common/modules/identity/upsell/store/consents';
// import type {
//     ConsentType,
//     Consent,
// } from 'common/modules/identity/upsell/store/consents';

import type {
    CardLike,
    Followable,
} from 'common/modules/identity/upsell/consent-card/FollowCard';

type FollowCardListProps<T: CardLike> = {
    displayWhiteList: string[],
    loadFollowables: () => Promise<Followable<T>[]>,
};

class FollowCardList<T: CardLike> extends Component<
    FollowCardListProps<T>,
    {
        followables: Followable<T>[],
    }
> {
    constructor(props: FollowCardListProps<T>) {
        super(props);
        this.setState({
            followables: [],
        });
    }

    componentDidMount() {
        this.props.loadFollowables().then(followables => {
            this.setState({
                followables: followables.filter(c =>
                    this.props.displayWhiteList.includes(c.value.id)
                ),
            });
        });
    }

    updateState(followable: Followable<T>, newValue: boolean) {
        this.setState(state => ({
            followables: [
                ...state.followables.map(
                    f =>
                        f.value.id === followable.value.id
                            ? { ...followable, isFollowing: newValue }
                            : f
                ),
            ],
        }));
    }

    render() {
        const { followables } = this.state;
        return (
            <div>
                {followables.map(followable => (
                    <FollowCard
                        value={followable.value}
                        isFollowing={followable.isFollowing}
                        onChange={newValue => {
                            followable.onChange(newValue);
                            this.updateState(followable, newValue);
                        }}
                    />
                ))}
            </div>
        );
    }
}

export { FollowCardList };
