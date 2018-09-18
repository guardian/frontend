// @flow
import React, { Component } from 'preact-compat';
import { FollowCard } from 'common/modules/identity/upsell/consent-card/FollowCard';
import type { ConsentType } from '../store/consents';
import { setConsentsInApi } from '../store/consents';

type FollowCardListProps = {
    followables: Promise<ConsentType>[],
    expandableFollowables: Promise<ConsentType>[],
};

class FollowCardList extends Component<
    FollowCardListProps,
    {
        followables: ConsentType[],
        expandableFollowables: ConsentType[],
        isExpanded: ConsentType[],
    }
> {
    constructor(props: FollowCardListProps<T>) {
        super(props);
        this.setState({
            followables: [],
            expandableFollowables: [],
            isExpanded: false,
        });
    }

    componentDidMount() {
        Promise.all([
            Promise.all(this.props.followables),
            Promise.all(this.props.expandableFollowables),
        ]).then(([followables, expandableFollowables]) => {
            this.setState({
                followables,
                expandableFollowables,
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
                            setConsentsInApi([{ ...followable, hasConsented }]);
                        }}
                    />
                ))}
            </div>
        );
    }
}

export { FollowCardList };
