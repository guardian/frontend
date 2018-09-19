// @flow
import React, { Component } from 'preact-compat';
import { FollowCard } from 'common/modules/identity/upsell/consent-card/FollowCard';
import type { ConsentWithState } from '../store/consents';
import { setConsentsInApi } from '../store/consents';

type FollowCardListProps = {
    followables: Promise<ConsentWithState>[],
    expandableFollowables: Promise<ConsentWithState>[],
};

class FollowCardList extends Component<
    FollowCardListProps,
    {
        followables: ConsentWithState[],
        expandableFollowables: ConsentWithState[],
        isExpanded: ConsentWithState[],
    }
> {
    constructor(props: FollowCardListProps) {
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

    updateState(followable: ConsentWithState, newValue: boolean) {
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

    updateExpandState = (isExpanded: boolean) => {
        this.setState(() => ({
            isExpanded,
        }));
    };

    render() {
        const { followables, expandableFollowables, isExpanded } = this.state;

        const displayables = isExpanded
            ? [...followables, ...expandableFollowables]
            : followables;

        return (
            <div>
                <div>
                    {displayables.map(followable => (
                        <FollowCard
                            consent={followable.consent}
                            hasConsented={followable.hasConsented}
                            onChange={hasConsented => {
                                this.updateState(followable, hasConsented);
                                setConsentsInApi([
                                    { ...followable, hasConsented },
                                ]);
                            }}
                        />
                    ))}
                </div>
                {isExpanded ? (
                    <button onClick={() => this.updateExpandState(false)}>
                        less
                    </button>
                ) : (
                    <button onClick={() => this.updateExpandState(true)}>
                        more
                    </button>
                )}
            </div>
        );
    }
}

export { FollowCardList };
