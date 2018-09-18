// @flow
import React, { Component } from 'preact-compat';
import { FollowCard } from 'common/modules/identity/upsell/consent-card/FollowCard';
import type {
    CardLike,
    Followable,
} from 'common/modules/identity/upsell/consent-card/FollowCard';
import type {ConsentType} from "../store/consents";
import {setConsentsInApi} from "../store/consents";


type FollowCardListProps<T: CardLike> = {
    displayWhiteList: string[],
    followables: Promise<ConsentType>,
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
        Promise.all(this.props.followables).then(followables => {
            this.setState({
                followables
            });
        });
    }

    updateState(followable: ConsentType, newValue: boolean) {
        this.setState(state => ({
            followables: [
                ...state.followables.map(
                    f =>
                        f.consent.id === followable.consent.id
                            ? { ...followable, hasConsented: newValue }
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
                        consent={followable.consent}
                        hasConsented={followable.hasConsented}
                        onChange={hasConsented => {
                            this.updateState(followable, hasConsented);
                            setConsentsInApi([{...followable, hasConsented}]);
                        }}
                    />
                ))}
            </div>
        );
    }
}

export { FollowCardList };
