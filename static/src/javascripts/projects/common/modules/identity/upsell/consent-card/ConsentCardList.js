// @flow
import React, { Component } from 'preact-compat';
import { getAllConsents, getUserFromApi } from 'common/modules/identity/api';
import { ConsentCard } from './ConsentCard';
import type { Consent } from './ConsentCard';

class ConsentCardList extends Component<
    {},
    {
        acceptedConsents: string[],
        allConsents: Consent[],
    }
> {
    constructor(props: {}) {
        super(props);
        this.setState({
            acceptedConsents: [],
            allConsents: [],
        });
    }

    componentDidMount() {
        let acceptedConsents = [];
        getUserFromApi(user => {
            if (user && user.consents) {
                acceptedConsents = user.consents
                    .filter(consent => consent.consented === true)
                    .map(consent => consent.id);
            }
        });
        getAllConsents().then(allConsents => {
            const filteredConsents = allConsents.filter(
                consent =>
                    consent.isOptOut === false && consent.isChannel === false
            );
            this.setState({
                allConsents: filteredConsents,
                acceptedConsents,
            });
        });
    }

    render() {
        const { allConsents, acceptedConsents } = this.state;
        return (
            <div>
                {allConsents.map(consent => {
                    const hasConsented =
                        acceptedConsents.filter(e => e === consent.id).length >
                        0;
                    return (
                        <ConsentCard
                            consent={consent}
                            hasConsented={hasConsented}
                        />
                    );
                })}
            </div>
        );
    }
}

export { ConsentCardList };
