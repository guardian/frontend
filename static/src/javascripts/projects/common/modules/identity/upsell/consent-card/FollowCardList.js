// @flow
import React, { Component } from 'preact-compat';
import {
    getAllConsents,
    getUserFromApi,
    setConsent,
} from 'common/modules/identity/api';
import { FollowCard } from './FollowCard';
import type { Consent } from './FollowCard';

type FollowCardListProps = {
    displayWhiteList: string[],
};

class FollowCardList extends Component<
    FollowCardListProps,
    {
        acceptedConsents: string[],
        allConsents: Consent[],
    }
> {
    constructor(props: FollowCardListProps) {
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
                    this.props.displayWhiteList.filter(id => consent.id === id)
                        .length > 0
            );
            this.setState({
                allConsents: filteredConsents,
                acceptedConsents,
            });
        });
    }

    toggleConsent = (hasConsented: boolean, consentId: string) => {
        setConsent(consentId, hasConsented).then(() => {
            const { acceptedConsents } = this.state;
            if (hasConsented) {
                this.setState({
                    acceptedConsents: [
                        ...acceptedConsents.filter(
                            consent => consent !== consentId
                        ),
                        consentId,
                    ],
                });
            } else {
                this.setState({
                    acceptedConsents: acceptedConsents.filter(
                        consent => consent !== consentId
                    ),
                });
            }
        });
    };

    render() {
        const { allConsents, acceptedConsents } = this.state;
        return (
            <div>
                {allConsents.map(consent => {
                    const hasConsented =
                        acceptedConsents.filter(e => e === consent.id).length >
                        0;
                    return (
                        <FollowCard
                            followable={consent}
                            hasFollowed={hasConsented}
                            onToggleFollow={hasConsent =>
                                this.toggleConsent(hasConsent, consent.id)
                            }
                        />
                    );
                })}
            </div>
        );
    }
}

export { FollowCardList };
