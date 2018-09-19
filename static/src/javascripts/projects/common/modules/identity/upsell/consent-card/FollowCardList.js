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

    expandableConsentsButtonText = (): string => {
        const joinWithOr = arr =>
            arr.reduce(
                (acc, val, idx, src) =>
                    idx === 0
                        ? val
                        : [
                              acc,
                              idx + 1 >= src.length ? ' or ' : ', ',
                              val,
                          ].join(''),
                ''
            );
        const buttonWords = [...this.state.expandableConsents]
            .splice(0, 2)
            .map(c => c.consent.name);
        if (this.state.expandableConsents.length > buttonWords.length) {
            buttonWords.push('More');
        }
        return `Interested in ${joinWithOr(buttonWords)}?`;
    };

    render() {
        const { consents, expandableConsents, isExpanded } = this.state;

        const displayables = isExpanded
            ? [...consents, ...expandableConsents]
            : [...consents];

        return (
            <div>
                <div className="identity-upsell-consent-card-grid">
                    {displayables.map(consent => (
                        <FollowCard
                            key={consent.uniqueId}
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
                {expandableConsents.length > 0 && (
                    <div className="identity-upsell-consent-card-footer">
                        {isExpanded ? (
                            <button
                                className="manage-account__button manage-account__button--secondary"
                                onClick={() => this.updateExpandState(false)}>
                                Less
                            </button>
                        ) : (
                            <button
                                className="manage-account__button manage-account__button--secondary"
                                onClick={() => this.updateExpandState(true)}>
                                {this.expandableConsentsButtonText()}
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export { FollowCardList };
