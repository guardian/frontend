// @flow
import React from 'preact-compat';
import config from 'lib/config';
import { FollowCard } from 'common/modules/identity/upsell/consent-card/FollowCard';
import type { ConsentWithState } from '../store/types';
import { setConsentsInApi } from '../store/consents';
import { ErrorBar, genericErrorStr } from '../error-bar/ErrorBar';
import { ExpanderButton } from '../button/ExpanderButton';
import {getNewsLetterConsents, getUserConsents} from "common/modules/identity/upsell/store/consents";

const getConsents = (): Promise<ConsentWithState[]> => {

    const userConsents = getUserConsents([
        'supporter',
        'holidays',
        'events',
        'offers',
        'jobs',
    ]);

    const newsLetterConsents =  getNewsLetterConsents([
        'today-uk',
        'the-long-read',
        'bookmarks',
        'brexit-briefing',
        'green-light',
        'lab-notes',
    ]);

    return Promise.all([userConsents, newsLetterConsents])
        .then(consents => consents[0].concat(consents[1]))
};

type Props = {
    cutoff: number,
};

type State = {
    consents: ConsentWithState[],
    isLoading: boolean,
    isExpanded: boolean,
    errors: string[],
}

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
        getConsents()
            .then(consents =>
                this.setState({
                    consents,
                    isLoading: false,
                })
            )
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

    render() {
        const { consents, isLoading, isExpanded, errors } = this.state;
        const { cutoff } = this.props;

        const displayables = isExpanded ? consents : [...consents].splice(0, cutoff);

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
                        <ExpanderButton
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
            </div>
        );
    }
}

export { FollowCardList };
