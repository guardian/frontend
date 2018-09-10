// @flow
import React, { Component } from 'preact-compat';
import { ConsentCard } from 'common/modules/identity/upsell/consent-card/ConsentCard';
import {
    get as getConsents,
    updateRemotely,
} from 'common/modules/identity/upsell/store/consents';
import type {
    ConsentType,
    Consent,
} from 'common/modules/identity/upsell/store/consents';

type ConsentCardListProps = {
    displayWhiteList: string[],
};

class ConsentCardList extends Component<
    ConsentCardListProps,
    {
        consents: ConsentType[],
    }
> {
    constructor(props: ConsentCardListProps) {
        super(props);
        this.setState({
            consents: [],
        });
    }

    componentDidMount() {
        getConsents().then(consents => {
            this.setState({
                consents: consents.filter(c =>
                    this.props.displayWhiteList.contains(c.consent.id)
                ),
            });
        });
    }

    toggleConsent = (hasConsented: boolean, consent: Consent) => {
        updateRemotely(hasConsented, consent.id).then(() => {
            this.setState({
                consents: [
                    ...this.state.consents.map(
                        c =>
                            c.consent.id === consent.id
                                ? { consent, hasConsented }
                                : c
                    ),
                ],
            });
        });
    };

    render() {
        const { consents } = this.state;
        return (
            <div>
                {consents.map(consent => (
                    <ConsentCard
                        consent={consent.consent}
                        hasConsented={consent.hasConsented}
                        onToggleConsent={hasConsent =>
                            this.toggleConsent(hasConsent, consent.consent)
                        }
                    />
                ))}
            </div>
        );
    }
}

export { ConsentCardList };
