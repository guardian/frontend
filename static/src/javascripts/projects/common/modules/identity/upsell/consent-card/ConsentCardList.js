// @flow
import React, { Component } from 'preact-compat';
import { ConsentCard } from './ConsentCard';
import { get as getConsents, updateRemotely } from '../store/consents';
import type { Consent } from '../store/consents';

class ConsentCardList extends Component<
    {},
    {
        consents: Consent[],
    }
> {
    constructor(props: {}) {
        super(props);
        this.setState({
            consents: [],
        });
    }

    componentDidMount() {
        getConsents().then(consents => {
            this.setState({
                consents: consents.filter(
                    c => c.isOptOut === false && c.isChannel === false
                ),
            });
        });
    }

    toggleConsent = (hasConsented: boolean, consent: Consent) => {
        updateRemotely(hasConsented, consent.id).then(() => {
            this.setState({
                consents: [
                    ...this.state.consents.map(
                        c => (c.id === consent.id ? { ...c, hasConsented } : c)
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
                        consent={consent}
                        hasConsented={consent.hasConsented}
                        onToggleConsent={hasConsent =>
                            this.toggleConsent(hasConsent, consent)
                        }
                    />
                ))}
            </div>
        );
    }
}

export { ConsentCardList };
