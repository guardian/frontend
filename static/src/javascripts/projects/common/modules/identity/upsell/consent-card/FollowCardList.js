// @flow
import React, { Component } from 'preact-compat';
import { FollowCard } from 'common/modules/identity/upsell/consent-card/FollowCard';
import type { ConsentWithState } from '../store/types';
import { setConsentsInApi } from '../store/consents';

type FollowCardListProps = {
    consents: Promise<ConsentWithState>[],
    expandableConsents: Promise<ConsentWithState>[],
};

class FollowCardList extends Component<
    FollowCardListProps,
    {
        consents: ConsentWithState[],
        expandableConsents: ConsentWithState[],
        isExpanded: boolean,
    }
> {
    constructor(props: FollowCardListProps) {
        super(props);
        this.setState({
            consents: [],
            expandableConsents: [],
            isExpanded: false,
        });
    }

    componentDidMount() {
        Promise.all([
            Promise.all(this.props.consents),
            Promise.all(this.props.expandableConsents),
        ]).then(([consents, expandableConsents]) => {
            this.setState({
                consents,
                expandableConsents,
            });
        });
    }

    updateState(consent: ConsentWithState) {
        this.setState(state => ({
            consents: state.consents.map(
                original =>
                    original.uniqueId === consent.uniqueId ? consent : original
            ),
            expandableConsents: state.expandableConsents.map(
                original =>
                    original.uniqueId === consent.uniqueId ? consent : original
            ),
        }));
    }

    updateExpandState = (isExpanded: boolean) => {
        this.setState(() => ({
            isExpanded,
        }));
    };

    render() {
        const { consents, expandableConsents, isExpanded } = this.state;

        const displayables = isExpanded
            ? [...consents, ...expandableConsents]
            : [...consents];

        console.log(displayables.length);

        return (
            <div>
                <div className={'identity-upsell-consent-card-grid'}>
                    {displayables.map((consent, index) => (
                        <FollowCard
                            key={consent.uniqueId+index}
                            consent={consent.consent}
                            hasConsented={consent.hasConsented}
                            onChange={hasConsented => {
                                consent.setState(hasConsented);
                                this.updateState(consent);
                                setConsentsInApi([consent]);
                            }}
                        />
                    ))}
                </div>
                <div className={'identity-upsell-consent-card-footer'}>
                    {isExpanded ? (
                        <button className={'manage-account__button manage-account__button--secondary'} onClick={() => this.updateExpandState(false)}>
                            Less
                        </button>
                    ) : (
                        <button className={'manage-account__button manage-account__button--secondary'} onClick={() => this.updateExpandState(true)}>
                            More
                        </button>
                    )}
                </div>
            </div>
        );
    }
}

export { FollowCardList };
