// @flow
import React from 'preact/compat';
import config from 'lib/config';
import { FollowCard } from 'common/modules/identity/upsell/consent-card/FollowCard';
import {
    setConsentsInApi,
    getNewsletterConsent,
    getUserConsent,
} from 'common/modules/identity/upsell/store/consents';
import { LegalTextBlock } from 'common/modules/identity/upsell/block/LegalTextBlock';
import type { ConsentWithState } from '../store/types';
import { ErrorBar, genericErrorStr } from '../error-bar/ErrorBar';
import { FollowCardExpanderButton } from '../button/FollowCardExpanderButton';

const getConsents = (): Promise<(?ConsentWithState)[]> =>
    Promise.all([
        getUserConsent('supporter'),
        getNewsletterConsent('the-long-read'),
        getUserConsent('holidays'),
        getNewsletterConsent('bookmarks'),
        getUserConsent('events'),
        getNewsletterConsent('brexit-briefing'),
        getUserConsent('offers'),
        getUserConsent('jobs'),
        getNewsletterConsent('green-light'),
        getNewsletterConsent('lab-notes'),
    ]);

type Props = {
    cutoff: number,
};

type State = {
    consents: ConsentWithState[],
    isLoading: boolean,
    isExpanded: boolean,
    errors: string[],
};

// TODO: seperate this into a stateless component and a stateful wrapper.
class FollowCardList extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.setState({
            consents: [],
            isLoading: true,
            isExpanded: false,
            errors: [],
        });
    }

    componentDidMount() {
        getConsents().then(consents =>
            this.setState({
                consents,
                isLoading: false,
            })
        );
    }

    updateConsentState(consent: ConsentWithState) {
        this.setState(state => ({
            errors: [],
            consents: state.consents.map(original =>
                original.uniqueId === consent.uniqueId ? consent : original
            ),
        }));
        setConsentsInApi([consent]).catch(() => {
            consent.flipState();
            this.setState(state => ({
                errors: [genericErrorStr],
                consents: state.consents.map(original =>
                    original.uniqueId === consent.uniqueId ? consent : original
                ),
            }));
        });
    }

    updateExpandState = (isExpanded: boolean) => {
        this.setState({
            isExpanded,
        });
    };

    render() {
        const { consents, isLoading, isExpanded, errors } = this.state;
        const { cutoff } = this.props;

        const displayables = isExpanded
            ? consents
            : [...consents].splice(0, cutoff);

        return (
            <div>
                {isLoading && (
                    <div className="identity-forms-loading u-identity-forms-padded">
                        <div className="identity-forms-loading__spinner is-updating" />
                    </div>
                )}
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
                        <FollowCardExpanderButton
                            isExpanded={isExpanded}
                            linkName="upsell-follow-expander"
                            onToggle={this.updateExpandState}
                            text={{
                                more: 'See more',
                                less: 'Less',
                            }}
                        />
                        {isExpanded && (
                            <div>
                                <a
                                    data-link-name="upsell-newsletter-link"
                                    className="u-underline identity-upsell-consent-card__link"
                                    href={`${config.get(
                                        'page.idUrl'
                                    )}/email-prefs`}>
                                    View all Guardian newsletters
                                </a>
                            </div>
                        )}
                    </div>
                )}
                <LegalTextBlock>
                    By subscribing, you confirm that you are 13 years or older.
                    The Guardian’s newsletters may include advertising and
                    messages about the Guardian’s other products and services,
                    such as Jobs and Masterclasses. To find out what personal
                    data we collect and how we use it, please visit our&nbsp;
                    <a
                        data-link-name="upsell-privacy-link"
                        className="u-underline identity-upsell-consent-card__link"
                        href="https://www.theguardian.com/info/privacy">
                        Privacy Policy.
                    </a>
                </LegalTextBlock>
            </div>
        );
    }
}

export { FollowCardList };
