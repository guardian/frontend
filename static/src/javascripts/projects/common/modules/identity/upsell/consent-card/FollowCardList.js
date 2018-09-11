// @flow
import React, { Component } from 'preact-compat';
import { FollowCard } from 'common/modules/identity/upsell/consent-card/FollowCard';
import {
    get as getConsents,
    updateRemotely,
} from 'common/modules/identity/upsell/store/consents';
import type {
    ConsentType,
    Consent,
} from 'common/modules/identity/upsell/store/consents';

type FollowCardListProps = {
    displayWhiteList: string[],
};

class FollowCardList extends Component<
    FollowCardListProps,
    {
        consents: ConsentType[],
    }
> {
    constructor(props: FollowCardListProps) {
        super(props);
        this.setState({
            consents: [],
        });
    }

    componentDidMount() {
        getConsents().then(consents => {
            this.setState({
                consents: consents.filter(c =>
                    this.props.displayWhiteList.includes(c.consent.id)
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
                {consents.map(consent => {
                    return (
                        <FollowCard
                            followable={{
                                value: consent.consent,
                                onChange: newValue => {
                                    this.toggleConsent(newValue, consent.consent);
                                },
                            }}
                            hasFollowed={consent.hasConsented}
                        />
                    );
                })}
            </div>
        );
    }
}

export { FollowCardList };
