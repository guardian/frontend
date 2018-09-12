// @flow
import {
    getAllNewsletters,
    getSubscribedNewsletters,
} from 'common/modules/identity/api';
import type { Followable } from 'common/modules/identity/upsell/consent-card/FollowCard';

type Newsletter = {
    id: string,
    name: string,
    description: string,
};

const set = (newsletterId: string, subscribed: boolean) => {
    console.log(newsletterId, subscribed);
};

const get = (): Promise<Followable<Newsletter>[]> =>
    Promise.all([getAllNewsletters(), getSubscribedNewsletters()]).then(
        ([allNewsletters, subscribedNewsletters]) =>
            allNewsletters.map(nl => ({
                value: nl,
                isFollowing: subscribedNewsletters.includes(
                    nl.exactTargetListId
                ),
                onChange: newValue => {
                    set(nl.id, newValue);
                },
            }))
    );

export type { Newsletter };

export { get };
