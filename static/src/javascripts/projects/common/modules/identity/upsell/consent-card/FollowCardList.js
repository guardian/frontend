// @flow
import React, { Component } from 'preact-compat';
import config from 'lib/config';
import { FollowCard } from 'common/modules/identity/upsell/consent-card/FollowCard';
import type { ConsentWithState } from '../store/types';
import { setConsentsInApi } from '../store/consents';
import { ErrorBar, genericErrorStr } from '../error-bar/ErrorBar';
import { ExpanderButton } from '../button/ExpanderButton';

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
                        <ExpanderButton
                            isExpanded={isExpanded}
                            linkName="upsell-follow-expander"
                            onToggle={this.updateExpandState}
                            text={{
                                more: this.expandableConsentsButtonText(
                                    [...consents].splice(cutoff)
                                ),
                                less: 'Less',
                            }}
                        />
                        {isExpanded && (
                            <div className="identity-upsell-newsletter-link">
                                <a className="u-underline" href={`${config.get(
                                    'page.host'
                                )}/email-newsletters`}
                                >View all Guardian newsletters</a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
}

export { FollowCardList };
