// @flow
import React, { Component } from 'preact-compat';
import { FollowCard } from 'common/modules/identity/upsell/consent-card/FollowCard';
import type { ConsentWithState } from '../store/types';
import { setConsentsInApi } from '../store/consents';
import { ErrorBar, genericErrorStr } from '../error-bar/ErrorBar';

const joinWithOr = arr =>
    arr.reduce(
        (acc, val, idx, src) =>
            idx === 0
                ? val
                : [acc, idx + 1 >= src.length ? ', or ' : ', ', val].join(''),
        ''
    );

type FollowCardListProps = {
    consents: Promise<ConsentWithState>[],
    cutoff: number,
};

class FollowCardList extends Component<
    FollowCardListProps,
    {
        consents: ConsentWithState[],
        isExpanded: boolean,
    }
> {
    constructor(props: FollowCardListProps) {
        super(props);
        this.setState({
            consents: [],
            errors: [],
            isExpanded: false,
        });
    }

    componentDidMount() {
        Promise.all(this.props.consents).then(consents => {
            this.setState({
                consents,
            });
        });
    }

    updateConsentState(consent: ConsentWithState) {
        this.setState(state => ({
            errors: [],
            consents: state.consents.map(
                original =>
                    original.uniqueId === consent.uniqueId ? consent : original
            ),
        }));
        setConsentsInApi([consent]).catch(() => {
            consent.flipState();
            this.setState(state => ({
                errors: [genericErrorStr],
                consents: state.consents.map(
                    original =>
                        original.uniqueId === consent.uniqueId
                            ? consent
                            : original
                ),
            }));
        });
    }

    updateExpandState = (isExpanded: boolean) => {
        this.setState({
            isExpanded,
        });
    };

    expandableConsentsButtonText = (consents: ConsentWithState[]): string => {
        const buttonWords = [...consents].splice(0, 2).map(c => c.consent.name);
        if (consents.length > buttonWords.length) {
            buttonWords.push('more');
        }
        return `Interested in ${joinWithOr(buttonWords)}?`;
    };

    render() {
        const { consents, isExpanded, errors } = this.state;
        const { cutoff } = this.props;

        const displayables = isExpanded
            ? consents
            : [...consents].splice(0, cutoff);

        return (
            <div>
                <ErrorBar errors={errors} />
                <div className="identity-upsell-consent-card-grid">
                    {displayables.map(consent => (
                        <FollowCard
                            key={consent.uniqueId}
                            consent={consent.consent}
                            hasConsented={consent.hasConsented}
                            onChange={hasConsented => {
                                consent.setState(hasConsented);
                                this.updateConsentState(consent);
                            }}
                        />
                    ))}
                </div>
                {[...consents].splice(cutoff).length > 0 && (
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
                                {this.expandableConsentsButtonText(
                                    [...consents].splice(cutoff)
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export { FollowCardList };
